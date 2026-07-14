const catchAsync = require('../../utils/catchAsync');
const ApiResponse = require('../../utils/ApiResponse');
const ApiError = require('../../utils/ApiError');
const feeService = require('./fee.service');

const getRequester = (req) => ({ id: req.user.id, role: req.user.role, instituteId: req.user.instituteId });

const createFee = catchAsync(async (req, res) => {
  const fee = await feeService.createFee(getRequester(req), req.body);
  res.status(201).json(new ApiResponse(201, fee, 'Fee record created successfully'));
});

const markFeePaid = catchAsync(async (req, res) => {
  const fee = await feeService.markFeePaid(getRequester(req), req.params.id, req.body.remarks);
  res.status(200).json(new ApiResponse(200, fee, 'Fee marked as paid'));
});

const createOrder = catchAsync(async (req, res) => {
  const order = await feeService.createRazorpayOrder(getRequester(req), req.params.id);
  res.status(200).json(new ApiResponse(200, order, 'Razorpay order created'));
});

const verifyPayment = catchAsync(async (req, res) => {
  const fee = await feeService.verifyPayment(getRequester(req), req.body);
  res.status(200).json(new ApiResponse(200, fee, 'Payment verified and fee marked as paid'));
});

const webhook = catchAsync(async (req, res) => {
  const signature = req.headers['x-razorpay-signature'];
  if (!signature) throw new ApiError(400, 'Missing webhook signature header');

  const result = await feeService.handleWebhook(req.body, signature);
  res.status(200).json(result);
});

const getBatchFees = catchAsync(async (req, res) => {
  const fees = await feeService.getBatchFees(getRequester(req), req.params.batchId);
  res.status(200).json(new ApiResponse(200, fees, 'Batch fees fetched successfully'));
});

const getMyFees = catchAsync(async (req, res) => {
  const fees = await feeService.getStudentFees(getRequester(req), req.user.id);
  res.status(200).json(new ApiResponse(200, fees, 'Your fees fetched successfully'));
});

const getStudentFees = catchAsync(async (req, res) => {
  const fees = await feeService.getStudentFees(getRequester(req), req.params.studentId);
  res.status(200).json(new ApiResponse(200, fees, 'Student fees fetched successfully'));
});

const getFeeOverview = catchAsync(async (req, res) => {
  const overview = await feeService.getFeeOverview(getRequester(req));
  res.status(200).json(new ApiResponse(200, overview, 'Fee overview fetched successfully'));
});


const getReceipt = catchAsync(async (req, res) => {
  const pdfBuffer = await feeService.getReceiptPDF(getRequester(req), req.params.id);
  res.set({
    'Content-Type': 'application/pdf',
    'Content-Disposition': `attachment; filename=receipt-${req.params.id}.pdf`,
  });
  res.send(pdfBuffer);
});

module.exports = {
  createFee,
  markFeePaid,
  createOrder,
  verifyPayment,
  webhook,
  getBatchFees,
  getMyFees,
  getStudentFees,
  getFeeOverview,
  getReceipt,
};