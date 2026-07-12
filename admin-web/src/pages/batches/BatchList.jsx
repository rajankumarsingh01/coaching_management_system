import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axiosInstance from '../../api/axiosInstance';

const BatchList = () => {
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchBatches = async () => {
      try {
        const { data } = await axiosInstance.get('/batches');
        setBatches(data.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load batches');
      } finally {
        setLoading(false);
      }
    };
    fetchBatches();
  }, []);

  if (loading) return <div className="p-6">Loading batches...</div>;

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Batches</h1>
        <Link to="/batches/create" className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">
          + New Batch
        </Link>
      </div>

      {error && <p className="mb-4 text-sm text-red-600">{error}</p>}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {batches.map((batch) => (
          <Link
            key={batch._id}
            to={`/batches/${batch._id}`}
            className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm hover:shadow-md"
          >
            <h2 className="text-lg font-semibold">{batch.name}</h2>
            <p className="text-sm text-gray-500">{batch.subject || 'No subject set'}</p>
            <p className="mt-2 text-xs text-gray-400">
              {batch.studentIds?.length || 0} students · {batch.teacherIds?.length || 0} teachers
            </p>
          </Link>
        ))}
        {batches.length === 0 && (
          <p className="text-sm text-gray-500">No batches yet. Create the first one.</p>
        )}
      </div>
    </div>
  );
};

export default BatchList;