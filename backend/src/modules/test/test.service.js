const xlsx = require('xlsx');
const ApiError = require('../../utils/ApiError');
const testRepository = require('./test.repository');
const batchRepository = require('../batch/batch.repository');
const { ROLES } = require('../../config/constants');
const { bulkQuestionRowSchema } = require('./test.validation');
const notificationService = require('../notification/notification.service');
const batchRepositoryForNotif = require('../batch/batch.repository');
const { getTenantFilter } = require('../../utils/tenantFilter');
const { emitToBatch, emitToInstituteRole } = require('../../socket/socket');
const resultRepository = require('../result/result.repository');
const gemini = require('../../config/openrouter.config');
const aiUsageService = require('../aiUsage/aiUsage.service');
const env = require('../../config/env');

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

  // Real-time — teacher/admin dashboards ka test list turant naya draft
  // dikhaye, bina refresh kiye (jaise ek doosra teacher/admin usi batch pe
  // dekh raha ho). Students ko nahi bhejte — ye abhi draft hai, unpublished.
  const createdPayload = {
    testId: String(test._id),
    title: test.title,
    batchId: String(batchId),
    durationMinutes: test.durationMinutes,
    isPublished: false,
  };
  emitToInstituteRole(String(batch.instituteId), 'teacher', 'test:created', createdPayload);
  emitToInstituteRole(String(batch.instituteId), 'admin', 'test:created', createdPayload);

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

  // Real-time — test-detail screen (agar dusra device/tab khula ho) ka
  // question count/list turant update ho jaye, teacher ko manually
  // refresh karne ki zarurat na pade
  emitToInstituteRole(String(updated.instituteId), 'teacher', 'test:questionAdded', {
    testId: String(updated._id),
    batchId: String(updated.batchId),
    questionCount: updated.questions.length,
  });
  emitToInstituteRole(String(updated.instituteId), 'admin', 'test:questionAdded', {
    testId: String(updated._id),
    batchId: String(updated.batchId),
    questionCount: updated.questions.length,
  });

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

    emitToInstituteRole(String(updatedTest.instituteId), 'teacher', 'test:questionAdded', {
      testId: String(updatedTest._id),
      batchId: String(updatedTest.batchId),
      questionCount: updatedTest.questions.length,
    });
    emitToInstituteRole(String(updatedTest.instituteId), 'admin', 'test:questionAdded', {
      testId: String(updatedTest._id),
      batchId: String(updatedTest.batchId),
      questionCount: updatedTest.questions.length,
    });
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

  // Real-time — batch-tests list (teacher/admin) se turant hata do, aur
  // agar student ka test-list already load ho chuka hai (published test
  // delete hua) to wahan se bhi turant gayab ho jaye
  const deletedPayload = { testId: String(test._id), batchId: String(test.batchId) };
  emitToInstituteRole(String(test.instituteId), 'teacher', 'test:deleted', deletedPayload);
  emitToInstituteRole(String(test.instituteId), 'admin', 'test:deleted', deletedPayload);
  if (test.isPublished) {
    emitToBatch(String(test.batchId), 'test:deleted', deletedPayload);
  }
};


const DAILY_GENERATION_LIMIT = 10;

// Step 1: AI se questions generate karke DRAFT return karta hai — DB me kuch save nahi hota.
// Teacher/admin frontend pe review karega, edit/discard karega, phir alag endpoint se accept karega.
const generateQuestionsWithAI = async (requester, testId, { topic, count, difficulty }) => {
  await getTestForEdit(requester, testId); // ensures test exists & requester owns it

 if (!env.openrouter.apiKey) {
    throw new ApiError(503, 'AI question generator is not set up yet. Please contact support.');
  }

  await aiUsageService.checkAndRecordUsage(
    requester.id,
    requester.instituteId,
    'question_generation',
    DAILY_GENERATION_LIMIT
  );

  const safeCount = Math.min(Math.max(count, 1), 10); // hard cap, chahe frontend kuch bhi bheje

  const prompt = `Generate ${safeCount} multiple-choice questions (MCQs) for a school/coaching test.
Topic: ${topic}
Difficulty: ${difficulty || 'medium'}
Respond ONLY with a valid JSON array, no other text, no markdown code fences, in exactly this format:
[{"questionText": "...", "optionA": "...", "optionB": "...", "optionC": "...", "optionD": "...", "correctAnswer": "A", "topic": "${topic}"}]`;

  let raw;
  try {
    raw = await gemini.generateContent(prompt, 1500);
  } catch (err) {
    throw new ApiError(503, 'AI question generator is busy right now. Please try again in a moment.');
  }

 let parsed;
  try {
    let cleaned = raw.replace(/```json|```/g, '').trim();

    // AI kabhi-kabhi JSON se pehle/baad me extra text likh deta hai
    // ("Here are the questions:" jaisa) — sirf [ ... ] wala hissa nikal lo
    const firstBracket = cleaned.indexOf('[');
    const lastBracket = cleaned.lastIndexOf(']');
    if (firstBracket !== -1 && lastBracket !== -1 && lastBracket > firstBracket) {
      cleaned = cleaned.slice(firstBracket, lastBracket + 1);
    }

    parsed = JSON.parse(cleaned);
  } catch (err) {
    console.error('AI QUESTION GEN — raw response was:', raw); // 👈 TEMP DEBUG
    throw new ApiError(502, 'AI returned an unexpected format. Please try generating again.');
  }

  const validOptions = ['A', 'B', 'C', 'D'];
  // Malformed entries silently drop kar dete hain — poora batch fail karne ke bajaye
  // jo bhi valid shape me aaya, wahi teacher ko review ke liye dikhta hai
  const cleanQuestions = (Array.isArray(parsed) ? parsed : [])
    .filter((q) => q.questionText && q.optionA && q.optionB && q.optionC && q.optionD && validOptions.includes(q.correctAnswer))
    .map((q) => ({
      questionText: q.questionText,
      optionA: q.optionA,
      optionB: q.optionB,
      optionC: q.optionC,
      optionD: q.optionD,
      correctAnswer: q.correctAnswer,
      topic: q.topic || topic,
    }));

  return cleanQuestions;
};

// Step 2: Teacher ne jo questions review karke accept/edit kiye, unhi ko save karta hai
const addGeneratedQuestions = async (requester, testId, questions) => {
  const test = await getTestForEdit(requester, testId);

  if (!Array.isArray(questions) || questions.length === 0) {
    throw new ApiError(400, 'No questions provided');
  }

  const updated = await testRepository.addQuestions(test._id, questions);

  emitToInstituteRole(String(updated.instituteId), 'teacher', 'test:questionAdded', {
    testId: String(updated._id),
    batchId: String(updated.batchId),
    questionCount: updated.questions.length,
  });
  emitToInstituteRole(String(updated.instituteId), 'admin', 'test:questionAdded', {
    testId: String(updated._id),
    batchId: String(updated.batchId),
    questionCount: updated.questions.length,
  });

  return updated;
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
    generateQuestionsWithAI, // 👈 new
  addGeneratedQuestions,   // 👈 new
};