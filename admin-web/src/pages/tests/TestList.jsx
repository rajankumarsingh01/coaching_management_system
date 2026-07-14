import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axiosInstance from '../../api/axiosInstance';

const TestList = () => {
  const [batches, setBatches] = useState([]);
  const [selectedBatchId, setSelectedBatchId] = useState('');
  const [tests, setTests] = useState([]);

  useEffect(() => {
    const fetchBatches = async () => {
      const { data } = await axiosInstance.get('/batches');
      setBatches(data.data);
      if (data.data.length > 0) setSelectedBatchId(data.data[0]._id);
    };
    fetchBatches();
  }, []);

  const fetchTests = async () => {
    if (!selectedBatchId) return;
    const { data } = await axiosInstance.get(`/tests/batch/${selectedBatchId}`);
    setTests(data.data);
  };

  useEffect(() => {
    fetchTests();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedBatchId]);

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Tests</h1>
        <Link to="/tests/create" className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">
          + New Test
        </Link>
      </div>

      <div className="mb-6">
        <label className="mb-1 block text-sm font-medium text-gray-700">Batch</label>
        <select
          value={selectedBatchId}
          onChange={(e) => setSelectedBatchId(e.target.value)}
          className="rounded border border-gray-300 px-3 py-2"
        >
          {batches.map((b) => (
            <option key={b._id} value={b._id}>
              {b.name}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {tests.map((t) => (
          <Link
            key={t._id}
            to={`/tests/${t._id}`}
            className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm hover:shadow-md"
          >
            <h2 className="text-lg font-semibold">{t.title}</h2>
            <p className="text-sm text-gray-500">{t.questions?.length || 0} questions · {t.durationMinutes} min</p>
            <span
              className={`mt-2 inline-block rounded-full px-2 py-1 text-xs font-medium ${
                t.isPublished ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
              }`}
            >
              {t.isPublished ? 'Published' : 'Draft'}
            </span>
          </Link>
        ))}
        {tests.length === 0 && <p className="text-sm text-gray-500">No tests yet for this batch.</p>}
      </div>

      <Link
        to={`/tests/leaderboard/${selectedBatchId}`}
        className="mt-6 inline-block text-sm text-blue-600 hover:underline"
      >
        View Leaderboard →
      </Link>
    </div>
  );
};

export default TestList;