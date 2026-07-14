import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axiosInstance from '../../api/axiosInstance';

const TestDetail = () => {
  const { id } = useParams();
  const [test, setTest] = useState(null);
  const [manualQ, setManualQ] = useState({
    questionText: '',
    optionA: '',
    optionB: '',
    optionC: '',
    optionD: '',
    correctAnswer: 'A',
    topic: '',
  });
  const [bulkFile, setBulkFile] = useState(null);
  const [bulkResult, setBulkResult] = useState(null);
  const [results, setResults] = useState([]);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const fetchTest = async () => {
    const { data } = await axiosInstance.get(`/tests/${id}/edit`);
    setTest(data.data);
  };

  const fetchResults = async () => {
    try {
      const { data } = await axiosInstance.get(`/results/test/${id}`);
      setResults(data.data);
    } catch (err) {
      // results endpoint may 403/empty before any submissions — ignore silently
    }
  };

  useEffect(() => {
    fetchTest();
    fetchResults();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleManualChange = (e) => setManualQ({ ...manualQ, [e.target.name]: e.target.value });

  const handleAddQuestion = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    try {
      await axiosInstance.post(`/tests/${id}/questions`, manualQ);
      setMessage('Question added successfully');
      setManualQ({
        questionText: '',
        optionA: '',
        optionB: '',
        optionC: '',
        optionD: '',
        correctAnswer: 'A',
        topic: '',
      });
      fetchTest();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add question');
    }
  };

  const handleBulkUpload = async (e) => {
    e.preventDefault();
    if (!bulkFile) {
      setError('Please select a file');
      return;
    }
    setError('');
    setMessage('');
    setBulkResult(null);
    try {
      const formData = new FormData();
      formData.append('file', bulkFile);
      const { data } = await axiosInstance.post(`/tests/${id}/questions/bulk-upload`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setBulkResult(data.data);
      setBulkFile(null);
      fetchTest();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to upload questions');
    }
  };

  const handlePublish = async () => {
    setError('');
    setMessage('');
    try {
      await axiosInstance.patch(`/tests/${id}/publish`);
      setMessage('Test published successfully');
      fetchTest();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to publish test');
    }
  };

  if (!test) return <div className="p-6">Loading...</div>;

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{test.title}</h1>
          <p className="text-sm text-gray-500">
            {test.questions.length} questions · {test.durationMinutes} min ·{' '}
            {test.isPublished ? 'Published' : 'Draft'}
          </p>
        </div>
        {!test.isPublished && (
          <button
            onClick={handlePublish}
            disabled={test.questions.length === 0}
            className="rounded bg-green-600 px-4 py-2 text-white hover:bg-green-700 disabled:opacity-50"
          >
            Publish Test
          </button>
        )}
      </div>

      {message && <p className="mb-4 text-sm text-green-600">{message}</p>}
      {error && <p className="mb-4 text-sm text-red-600">{error}</p>}

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        {/* Bulk upload */}
        <div className="rounded-lg border border-gray-200 p-4">
          <h2 className="mb-2 font-semibold">Bulk Upload (Excel/CSV)</h2>
          <p className="mb-3 text-xs text-gray-500">
            Columns required: Question, Option A, Option B, Option C, Option D, Correct Answer (A/B/C/D), Topic
            (optional). Max 2MB.
          </p>
          <form onSubmit={handleBulkUpload} className="space-y-3">
            <input
              type="file"
              accept=".xlsx,.csv"
              onChange={(e) => setBulkFile(e.target.files[0])}
              className="w-full text-sm"
            />
            <button type="submit" className="rounded bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700">
              Upload
            </button>
          </form>

          {bulkResult && (
            <div className="mt-4 rounded bg-gray-50 p-3 text-sm">
              <p className="font-medium text-green-700">{bulkResult.insertedCount} question(s) added</p>
              {bulkResult.failedCount > 0 && (
                <>
                  <p className="mt-2 font-medium text-red-600">{bulkResult.failedCount} row(s) failed:</p>
                  <ul className="mt-1 space-y-1 text-xs text-red-600">
                    {bulkResult.rowErrors.map((re, idx) => (
                      <li key={idx}>
                        Row {re.row}: {re.errors.join(', ')}
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </div>
          )}
        </div>

        {/* Manual add */}
        <div className="rounded-lg border border-gray-200 p-4">
          <h2 className="mb-2 font-semibold">Add Single Question (manual)</h2>
          <form onSubmit={handleAddQuestion} className="space-y-2">
            <input
              name="questionText"
              value={manualQ.questionText}
              onChange={handleManualChange}
              placeholder="Question text"
              className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
              required
            />
            <input
              name="optionA"
              value={manualQ.optionA}
              onChange={handleManualChange}
              placeholder="Option A"
              className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
              required
            />
            <input
              name="optionB"
              value={manualQ.optionB}
              onChange={handleManualChange}
              placeholder="Option B"
              className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
              required
            />
            <input
              name="optionC"
              value={manualQ.optionC}
              onChange={handleManualChange}
              placeholder="Option C"
              className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
              required
            />
            <input
              name="optionD"
              value={manualQ.optionD}
              onChange={handleManualChange}
              placeholder="Option D"
              className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
              required
            />
            <select
              name="correctAnswer"
              value={manualQ.correctAnswer}
              onChange={handleManualChange}
              className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
            >
              <option value="A">A</option>
              <option value="B">B</option>
              <option value="C">C</option>
              <option value="D">D</option>
            </select>
            <input
              name="topic"
              value={manualQ.topic}
              onChange={handleManualChange}
              placeholder="Topic (optional)"
              className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
            />
            <button type="submit" className="rounded bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700">
              Add Question
            </button>
          </form>
        </div>
      </div>

      <div className="mt-8">
        <h2 className="mb-3 font-semibold">Questions ({test.questions.length})</h2>
        <ul className="space-y-2">
          {test.questions.map((q, idx) => (
            <li key={q._id} className="rounded border border-gray-200 p-3 text-sm">
              <p className="font-medium">
                {idx + 1}. {q.questionText} <span className="text-xs text-gray-400">({q.topic})</span>
              </p>
              <p className="mt-1 text-xs text-gray-500">
                A: {q.optionA} · B: {q.optionB} · C: {q.optionC} · D: {q.optionD} · Correct:{' '}
                <span className="font-semibold text-green-600">{q.correctAnswer}</span>
              </p>
            </li>
          ))}
        </ul>
      </div>

      {results.length > 0 && (
        <div className="mt-8">
          <h2 className="mb-3 font-semibold">Results ({results.length} submissions)</h2>
          <table className="min-w-full divide-y divide-gray-200 rounded-lg border border-gray-200 bg-white">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium uppercase text-gray-500">Student</th>
                <th className="px-4 py-2 text-left text-xs font-medium uppercase text-gray-500">Score</th>
                <th className="px-4 py-2 text-left text-xs font-medium uppercase text-gray-500">%</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {results.map((r) => (
                <tr key={r._id}>
                  <td className="px-4 py-2 text-sm">{r.studentId?.name}</td>
                  <td className="px-4 py-2 text-sm">
                    {r.score}/{r.totalQuestions}
                  </td>
                  <td className="px-4 py-2 text-sm font-medium">{r.percentage}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default TestDetail;