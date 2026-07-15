const xlsx = require('xlsx');
const ApiError = require('../../utils/ApiError');
const testRepository = require('./test.repository');
const batchRepository = require('../batch/batch.repository');
const { ROLES } = require('../../config/constants');
const { bulkQuestionRowSchema } = require('./test.validation');
const notificationService = require('../notification/notification.service');
const batchRepositoryForNotif = require('../batch/batch.repository');
const { getTenantFilter } = require('../../utils/tenantFilter');
const { emitToBatch } = require('../../socket/socket');
const resultRepository = require('../result/result.repository');

const toIdString = (entry) => String(entry?._id ?? entry);

const assertBatchAccess = async (requester, batchId) => {
const filter = getTenantFilter(requester);
  const batch = await batchRepository.findByIdScoped(batchId, filter);
  if (!batch) throw new ApiError(404, 'Batch not found');

  if (requester.role === ROLES.TEACHER) {
    const isAssigned = batch.teacherIds.some((entry) => toIdString(entry) === String(requester.id));
    if (!isAssigned) throw new ApiError(403, 'You are not assigned to this batch');
  }
  return batch;
};

const createTest = async (requester, { title, batchId, durationMinutes }) => {
  const batch = await assertBatchAccess(requester, batchId);

  const test = await testRepository.create({
    title,
    batchId,
    instituteId: batch.instituteId,
    createdBy: requester.id,
    durationMinutes,
    questions: [],
  });

  return test;
};

const getTestForEdit = async (requester, testId) => {
  const filter = getTenantFilter(requester);
  const test = await testRepository.findByIdScoped(testId, filter);
  if (!test) throw new ApiError(404, 'Test not found');
  return test;
};

// Manual single-question add (fallback method, per Update 4 requirement)
const addQuestion = async (requester, testId, questionData) => {
  const test = await getTestForEdit(requester, testId);
  const updated = await testRepository.addQuestions(test._id, [questionData]);
  return updated;
};

const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB, per Update 4

// Bulk upload via Excel/CSV — validates each row with Zod, reports row-level
// errors without rejecting the whole upload, inserts only the valid rows.
const bulkUploadQuestions = async (requester, testId, file) => {
  if (!file) throw new ApiError(400, 'A file is required');
  if (file.size > MAX_FILE_SIZE) throw new ApiError(400, 'File size must not exceed 2MB');

  const allowedTypes = [
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
    'application/vnd.ms-excel',
    'text/csv',
  ];
  if (!allowedTypes.includes(file.mimetype)) {
    throw new ApiError(400, 'Only .xlsx and .csv files are allowed');
  }

  const test = await getTestForEdit(requester, testId);

  const workbook = xlsx.read(file.buffer, { type: 'buffer' });
  const sheetName = workbook.SheetNames[0];
  const rows = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName], { defval: '' });

  if (rows.length === 0) {
    throw new ApiError(400, 'The uploaded file has no data rows');
  }

  const validQuestions = [];
  const rowErrors = [];

  rows.forEach((row, index) => {
    const result = bulkQuestionRowSchema.safeParse(row);
    if (!result.success) {
      rowErrors.push({
        row: index + 2, // +2 accounts for 1-indexing and the header row
        errors: result.error.errors.map((e) => `${e.path.join('.')}: ${e.message}`),
      });
      return;
    }

    validQuestions.push({
      questionText: result.data.Question,
      optionA: result.data['Option A'],
      optionB: result.data['Option B'],
      optionC: result.data['Option C'],
      optionD: result.data['Option D'],
      correctAnswer: result.data['Correct Answer'],
      topic: result.data.Topic || 'General',
    });
  });

  let updatedTest = test;
  if (validQuestions.length > 0) {
    updatedTest = await testRepository.addQuestions(test._id, validQuestions);
  }

  return {
    insertedCount: validQuestions.length,
    failedCount: rowErrors.length,
    rowErrors,
    test: updatedTest,
  };
};

const publishTest = async (requester, testId) => {
  const test = await getTestForEdit(requester, testId);
  if (test.questions.length === 0) {
    throw new ApiError(400, 'Cannot publish a test with no questions');
  }
  const published = await testRepository.publish(testId);

  // Notify students in the batch — fire-and-forget
  const batch = await batchRepositoryForNotif.findByIdScoped(test.batchId);
  if (batch && batch.studentIds.length > 0) {
    notificationService
      .sendToUsers(batch.studentIds, {
        title: 'New Test Available',
        body: `"${test.title}" is now available to attempt`,
        data: { type: 'test', testId: String(testId) },
      })
      .catch(() => {});
  }

  // Structured realtime event — batch room ke students ki test-list screen
  // isi se turant refresh ho sakti hai, generic notification se alag
  emitToBatch(String(test.batchId), 'test:new', {
    testId: String(testId),
    title: test.title,
    batchId: String(test.batchId),
    durationMinutes: test.durationMinutes,
  });

  return published;
};

// Student/parent view — never expose correctAnswer
const getBatchTestsForStudent = async (requester, batchId) => {
 const filter = getTenantFilter(requester);
  const tests = await testRepository.findByBatch(batchId, { ...filter, isPublished: true });
  return tests;
};

// Teacher/admin view — full data including correct answers, drafts included
const getBatchTestsForStaff = async (requester, batchId) => {
  const filter = getTenantFilter(requester);
  return testRepository.findByBatchFull(batchId, filter);
};

const getTestForAttempt = async (requester, testId) => {
 const filter = getTenantFilter(requester);
  const test = await testRepository.findByIdScoped(testId, { ...filter, isPublished: true });
  if (!test) throw new ApiError(404, 'Test not found or not published');

  // strip correct answers before sending to the student attempting the test
  const sanitized = test.toObject();
  sanitized.questions = sanitized.questions.map((q) => {
    const { correctAnswer, ...rest } = q;
    return rest;
  });
  return sanitized;
};

const deleteTest = async (requester, testId) => {
  const test = await getTestForEdit(requester, testId);
  // Test delete hone se pehle uske saare Result records bhi delete karo —
  // warna Result.testId dangling reference ban jata hai aur student side
  // /results/me me populate karne par null aata hai.
  await resultRepository.deleteByTest(test._id);
  await testRepository.deleteById(test._id);
};

module.exports = {
  createTest,
  getTestForEdit,
  addQuestion,
  bulkUploadQuestions,
  publishTest,
  getBatchTestsForStudent,
  getBatchTestsForStaff,
  getTestForAttempt,
  deleteTest,
};