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

const toIdString = (entry) => String(entry?._id ?? entry);

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

  return fee;
};

// Admin manually marking a fee as paid (cash/offline payment) — unchanged from before
const markFeePaid = async (requester, feeId, remarks) => {
  const filter = requester.role === ROLES.SUPER_ADMIN ? {} : { instituteId: requester.instituteId };
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

  return updated;
};

// Student initiates online payment — creates a Razorpay order for this fee
const createRazorpayOrder = async (requester, feeId) => {
  const filter = requester.role === ROLES.SUPER_ADMIN ? {} : { instituteId: requester.instituteId };
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
  const filter = requester.role === ROLES.SUPER_ADMIN ? {} : { instituteId: requester.instituteId };
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
      await feeRepository.updateStatus(fee._id, {
        status: FEE_STATUS.PAID,
        paidDate: new Date(),
        paymentMethod: 'razorpay',
        razorpayPaymentId: payment.id,
      });
      logger.info(`Webhook confirmed payment for fee ${fee._id}`);
    }
  }

  return { received: true };
};

const getBatchFees = async (requester, batchId) => {
  const filter = requester.role === ROLES.SUPER_ADMIN ? {} : { instituteId: requester.instituteId };
  await feeRepository.markOverdue(filter);
  return feeRepository.findByBatch(batchId, filter);
};

const getStudentFees = async (requester, studentId) => {
  const filter = requester.role === ROLES.SUPER_ADMIN ? {} : { instituteId: requester.instituteId };
  await feeRepository.markOverdue(filter);
  return feeRepository.findByStudent(studentId, filter);
};

const getFeeOverview = async (requester) => {
  const filter = requester.role === ROLES.SUPER_ADMIN ? {} : { instituteId: requester.instituteId };
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

module.exports = {
  createFee,
  markFeePaid,
  createRazorpayOrder,
  verifyPayment,
  handleWebhook,
  getBatchFees,
  getStudentFees,
  getFeeOverview,
};