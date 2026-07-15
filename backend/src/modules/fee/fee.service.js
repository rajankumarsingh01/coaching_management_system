const crypto = require('crypto');
const ApiError = require('../../utils/ApiError');
const feeRepository = require('./fee.repository');
const batchRepository = require('../batch/batch.repository');
const userRepository = require('../user/user.repository');
const { ROLES } = require('../../config/constants');
const { FEE_STATUS } = require('./fee.model');
const razorpayInstance = require('../../config/razorpay.config');
const env = require('../../config/env');
const logger = require('../../utils/logger');
const { getTenantFilter } = require('../../utils/tenantFilter');
const { emitToUser, emitToInstituteRole } = require('../../socket/socket');

const Institute = require('../institute/institute.model');
const User = require('../user/user.model');
const { generateReceiptPDF } = require('../../utils/generateReceipt');

const toIdString = (entry) => String(entry?._id ?? entry);

// Payment confirm hone ke baad ka common realtime emit — markFeePaid, verifyPayment
// aur handleWebhook teeno yahi function call karenge, taki emit logic ek hi jagah rahe.
// Batch-wide broadcast NAHI kiya — fee financial data hai, sirf concerned log hi dekhein.
const emitFeePaymentUpdate = async (fee) => {
  const payload = {
    feeId: String(fee._id),
    studentId: String(fee.studentId),
    batchId: String(fee.batchId),
    amount: fee.amount,
    status: fee.status,
    paidDate: fee.paidDate,
    paymentMethod: fee.paymentMethod,
  };

  // Student ko turant confirmation
  emitToUser(fee.studentId, 'fee:payment-confirmed', payload);

  // Parent bhi turant dekh sake (agar student ke saath parent linked hai)
  const student = await userRepository.findById(fee.studentId);
  if (student?.parentId) {
    emitToUser(student.parentId, 'fee:payment-confirmed', payload);
  }

  // Admin dashboard ka live fee-collection % turant update — sirf admin role
  // wale institute room me, poore batch me nahi
  emitToInstituteRole(fee.instituteId, 'admin', 'fee:paid', payload);
};

const createFee = async (requester, { studentId, batchId, amount, dueDate, remarks }) => {
  const batchFilter = requester.role === ROLES.SUPER_ADMIN ? {} : { instituteId: requester.instituteId };
  const batch = await batchRepository.findByIdScoped(batchId, batchFilter);
  if (!batch) {
    throw new ApiError(404, 'Batch not found');
  }

  const student = await userRepository.findById(studentId);
  if (!student || student.role !== ROLES.STUDENT) {
    throw new ApiError(400, 'Provided studentId is not a valid student');
  }
  if (String(student.instituteId) !== String(batch.instituteId)) {
    throw new ApiError(403, 'Student does not belong to the same institute as this batch');
  }

  const isInBatch = batch.studentIds.some((entry) => toIdString(entry) === String(studentId));
  if (!isInBatch) {
    throw new ApiError(400, 'Student is not enrolled in this batch');
  }

  const fee = await feeRepository.create({
    studentId,
    batchId,
    instituteId: batch.instituteId,
    amount,
    dueDate: new Date(dueDate),
    remarks: remarks || '',
    markedBy: requester.id,
  });

  // Naya fee record turant student/parent ko dikhe — bina app refresh kiye
  const newFeePayload = {
    feeId: String(fee._id),
    amount: fee.amount,
    dueDate: fee.dueDate,
    status: fee.status,
  };
  emitToUser(fee.studentId, 'fee:created', newFeePayload);
  if (student.parentId) {
    emitToUser(student.parentId, 'fee:created', newFeePayload);
  }

  return fee;
};

// Admin manually marking a fee as paid (cash/offline payment)
const markFeePaid = async (requester, feeId, remarks) => {
  const filter = getTenantFilter(requester);
  const fee = await feeRepository.findByIdScoped(feeId, filter);
  if (!fee) {
    throw new ApiError(404, 'Fee record not found');
  }

  const updated = await feeRepository.updateStatus(feeId, {
    status: FEE_STATUS.PAID,
    paidDate: new Date(),
    remarks: remarks || fee.remarks,
    paymentMethod: 'manual',
    markedBy: requester.id,
  });

  await emitFeePaymentUpdate(updated);

  return updated;
};

// Student initiates online payment — creates a Razorpay order for this fee
const createRazorpayOrder = async (requester, feeId) => {
 const filter = getTenantFilter(requester);

  const fee = await feeRepository.findByIdScoped(feeId, filter);
  if (!fee) {
    throw new ApiError(404, 'Fee record not found');
  }

  // only the fee's own student can pay for it
  if (requester.role === ROLES.STUDENT && String(fee.studentId) !== String(requester.id)) {
    throw new ApiError(403, 'You can only pay your own fees');
  }

  if (fee.status === FEE_STATUS.PAID) {
    throw new ApiError(400, 'This fee is already paid');
  }

  const order = await razorpayInstance.orders.create({
    amount: fee.amount * 100, // Razorpay expects paise
    currency: 'INR',
    receipt: `fee_${fee._id}`,
    notes: { feeId: String(fee._id), studentId: String(fee.studentId) },
  });

  await feeRepository.updateStatus(feeId, { razorpayOrderId: order.id });

  return {
    orderId: order.id,
    amount: order.amount,
    currency: order.currency,
    keyId: env.razorpay.keyId,
    feeId: fee._id,
  };
};

// Called by the client (mobile app) right after Razorpay checkout succeeds —
// verifies the payment signature server-side before trusting it.
const verifyPayment = async (requester, { feeId, razorpay_order_id, razorpay_payment_id, razorpay_signature }) => {
 const filter = getTenantFilter(requester);

  const fee = await feeRepository.findByIdScoped(feeId, filter);
  if (!fee) {
    throw new ApiError(404, 'Fee record not found');
  }

  if (fee.razorpayOrderId !== razorpay_order_id) {
    throw new ApiError(400, 'Order ID mismatch');
  }

  const expectedSignature = crypto
    .createHmac('sha256', env.razorpay.keySecret)
    .update(`${razorpay_order_id}|${razorpay_payment_id}`)
    .digest('hex');

  if (expectedSignature !== razorpay_signature) {
    throw new ApiError(400, 'Payment verification failed — invalid signature');
  }

  const updated = await feeRepository.updateStatus(feeId, {
    status: FEE_STATUS.PAID,
    paidDate: new Date(),
    paymentMethod: 'razorpay',
    razorpayPaymentId: razorpay_payment_id,
    razorpaySignature: razorpay_signature,
  });

  await emitFeePaymentUpdate(updated);

  return updated;
};

// Razorpay webhook — server-to-server confirmation, independent of the client.
// This is the source of truth in production (client-side verifyPayment can be
// skipped/spoofed by a malicious client, but this webhook signature can't be).
const handleWebhook = async (rawBody, signatureHeader) => {
  const expectedSignature = crypto
    .createHmac('sha256', env.razorpay.webhookSecret)
    .update(rawBody)
    .digest('hex');

  if (expectedSignature !== signatureHeader) {
    throw new ApiError(400, 'Invalid webhook signature');
  }

  const payload = JSON.parse(rawBody.toString());

  if (payload.event === 'payment.captured') {
    const payment = payload.payload.payment.entity;
    const orderId = payment.order_id;

    const fee = await feeRepository.findByRazorpayOrderId(orderId);
    if (fee && fee.status !== FEE_STATUS.PAID) {
      const updated = await feeRepository.updateStatus(fee._id, {
        status: FEE_STATUS.PAID,
        paidDate: new Date(),
        paymentMethod: 'razorpay',
        razorpayPaymentId: payment.id,
      });

      await emitFeePaymentUpdate(updated);

      logger.info(`Webhook confirmed payment for fee ${fee._id}`);
    }
  }

  return { received: true };
};

const getBatchFees = async (requester, batchId) => {
 const filter = getTenantFilter(requester);

  await feeRepository.markOverdue(filter);
  return feeRepository.findByBatch(batchId, filter);
};

const getStudentFees = async (requester, studentId) => {
 const filter = getTenantFilter(requester);

  await feeRepository.markOverdue(filter);
  return feeRepository.findByStudent(studentId, filter);
};

const getFeeOverview = async (requester) => {
 const filter = getTenantFilter(requester);

  await feeRepository.markOverdue(filter);

  const allFees = await feeRepository.findAllForInstitute(filter);

  const totalAmount = allFees.reduce((sum, f) => sum + f.amount, 0);
  const paidAmount = allFees
    .filter((f) => f.status === FEE_STATUS.PAID)
    .reduce((sum, f) => sum + f.amount, 0);
  const pendingCount = allFees.filter((f) => f.status === FEE_STATUS.PENDING).length;
  const dueCount = allFees.filter((f) => f.status === FEE_STATUS.DUE).length;
  const collectionPercentage = totalAmount === 0 ? 0 : Math.round((paidAmount / totalAmount) * 100);

  return {
    totalAmount,
    paidAmount,
    pendingAmount: totalAmount - paidAmount,
    pendingCount,
    dueCount,
    collectionPercentage,
    records: allFees,
  };
};


// requester = { id, role, instituteId }
const getReceiptPDF = async (requester, feeId) => {
  const filter = getTenantFilter(requester);
  
  const fee = await feeRepository.findByIdScoped(feeId, filter);
  if (!fee) throw new ApiError(404, 'Fee record not found');

  if (fee.status !== FEE_STATUS.PAID) {
    throw new ApiError(400, 'Receipt is only available for paid fees');
  }

  // students/parents may only download their own/child's receipt
  if (requester.role === ROLES.STUDENT && String(fee.studentId) !== String(requester.id)) {
    throw new ApiError(403, 'You can only download your own receipt');
  }

  const institute = await Institute.findById(fee.instituteId);
  const student = await User.findById(fee.studentId);
  if (!institute || !student) throw new ApiError(404, 'Related data not found');

  const pdfBuffer = await generateReceiptPDF({ institute, fee, student });
  return pdfBuffer;
};

module.exports = {
  createFee,
  markFeePaid,
  createRazorpayOrder,
  verifyPayment,
  handleWebhook,
  getBatchFees,
  getStudentFees,
  getFeeOverview,
  getReceiptPDF,
};