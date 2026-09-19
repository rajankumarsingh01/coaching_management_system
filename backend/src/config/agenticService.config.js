const axios = require('axios');
const env = require('./env');

const agenticClient = axios.create({
  baseURL: env.agenticService.baseUrl,
  timeout: 10000,
});

const checkHealth = async () => {
  const { data } = await agenticClient.get('/health');
  return data;
};

const ping = async () => {
  const { data } = await agenticClient.get('/ping');
  return data;
};

// UPDATED — ab instituteId bhi bhejte hain, RAG retrieval isi se filter hoga.
const askDoubt = async ({ question, subject, imageUrl, instituteId }) => {
  const { data } = await agenticClient.post(
    '/doubt',
    {
      question,
      subject: subject || null,
      image_url: imageUrl || null,
      institute_id: String(instituteId),
    },
    { timeout: 30000 }
  );
  return data;
};

// NEW — Notes upload hone pe call hoga (fire-and-forget, Node isko await
// nahi karega taaki upload response fast rahe).
const ingestNote = async ({ noteId, fileUrl, instituteId, batchId, title }) => {
  const { data } = await agenticClient.post(
    '/notes/ingest',
    {
      note_id: String(noteId),
      file_url: fileUrl,
      institute_id: String(instituteId),
      batch_id: String(batchId),
      title,
    },
    { timeout: 15000 }
  );
  return data;
};

// NEW — Note delete hone pe uske chunks bhi clean karne ke liye.
const deleteNoteChunks = async (noteId) => {
  const { data } = await agenticClient.delete(`/notes/${String(noteId)}`, { timeout: 10000 });
  return data;
};


// NEW — Weak-topic stats leke natural-language study plan banwata hai
const generateStudyPlan = async ({ studentName, weakTopics, allTopics }) => {
  const { data } = await agenticClient.post(
    '/study-plan',
    {
      student_name: studentName,
      weak_topics: weakTopics,
      all_topics: allTopics,
    },
    { timeout: 20000 }
  );
  return data; // { plan }
};

// NEW — notes-grounded, self-validating question generation
const generateQuestions = async ({ topic, count, difficulty, instituteId }) => {
  const { data } = await agenticClient.post(
    '/questions/generate',
    {
      topic,
      count,
      difficulty: difficulty || 'medium',
      institute_id: String(instituteId),
    },
    { timeout: 45000 }  // generate + validate + possible retry = multiple LLM calls, isliye zyada timeout
  );
  return data; // { questions, grounded_in_notes }
};



// NEW — attendance+fee+weak-topics leke Hinglish parent report banata hai
const generateParentReport = async ({ studentName, attendance, fees, weakTopics, allTopics }) => {
  const { data } = await agenticClient.post(
    '/parent-report',
    {
      student_name: studentName,
      attendance,
      fees,
      weak_topics: weakTopics,
      all_topics: allTopics,
    },
    { timeout: 20000 }
  );
  return data; // { report }
};

module.exports = {
  checkHealth,
  ping,
  askDoubt,
  ingestNote,
  deleteNoteChunks,
  generateStudyPlan,
  generateQuestions,
  generateParentReport,   // NEW
};




