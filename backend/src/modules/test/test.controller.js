const catchAsync = require('../../utils/catchAsync');
const ApiResponse = require('../../utils/ApiResponse');
const testService = require('./test.service');
const { ROLES } = require('../../config/constants');

const getRequester = (req) => ({ id: req.user.id, role: req.user.role, instituteId: req.user.instituteId });

const createTest = catchAsync(async (req, res) => {
  const test = await testService.createTest(getRequester(req), req.body);
  res.status(201).json(new ApiResponse(201, test, 'Test created successfully'));
});

const addQuestion = catchAsync(async (req, res) => {
  const test = await testService.addQuestion(getRequester(req), req.params.id, req.body);
  res.status(200).json(new ApiResponse(200, test, 'Question added successfully'));
});

const bulkUploadQuestions = catchAsync(async (req, res) => {
  const result = await testService.bulkUploadQuestions(getRequester(req), req.params.id, req.file);
  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        result,
        `${result.insertedCount} question(s) added, ${result.failedCount} row(s) failed`
      )
    );
});

const publishTest = catchAsync(async (req, res) => {
  const test = await testService.publishTest(getRequester(req), req.params.id);
  res.status(200).json(new ApiResponse(200, test, 'Test published successfully'));
});

const getBatchTests = catchAsync(async (req, res) => {
  const requester = getRequester(req);
  const tests =
    requester.role === ROLES.STUDENT || requester.role === ROLES.PARENT
      ? await testService.getBatchTestsForStudent(requester, req.params.batchId)
      : await testService.getBatchTestsForStaff(requester, req.params.batchId);
  res.status(200).json(new ApiResponse(200, tests, 'Tests fetched successfully'));
});

const getTestForAttempt = catchAsync(async (req, res) => {
  const test = await testService.getTestForAttempt(getRequester(req), req.params.id);
  res.status(200).json(new ApiResponse(200, test, 'Test fetched successfully'));
});

const getTestForEdit = catchAsync(async (req, res) => {
  const test = await testService.getTestForEdit(getRequester(req), req.params.id);
  res.status(200).json(new ApiResponse(200, test, 'Test fetched successfully'));
});

const deleteTest = catchAsync(async (req, res) => {
  await testService.deleteTest(getRequester(req), req.params.id);
  res.status(200).json(new ApiResponse(200, null, 'Test deleted successfully'));
});


const generateQuestions = catchAsync(async (req, res) => {
  const questions = await testService.generateQuestionsWithAI(getRequester(req), req.params.id, req.body);
  res.status(200).json(new ApiResponse(200, questions, 'Questions generated — review before adding'));
});

const addGeneratedQuestions = catchAsync(async (req, res) => {
  const test = await testService.addGeneratedQuestions(getRequester(req), req.params.id, req.body.questions);
  res.status(200).json(new ApiResponse(200, test, 'Selected questions added to test'));
});

module.exports = {
  createTest,
  addQuestion,
  bulkUploadQuestions,
  publishTest,
  getBatchTests,
  getTestForAttempt,
  getTestForEdit,
  deleteTest,
  generateQuestions,
  addGeneratedQuestions,
};