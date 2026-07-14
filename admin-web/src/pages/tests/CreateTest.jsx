import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../../api/axiosInstance';

const CreateTest = () => {
  const [batches, setBatches] = useState([]);
  const [form, setForm] = useState({ title: '', batchId: '', durationMinutes: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchBatches = async () => {
      const { data } = await axiosInstance.get('/batches');
      setBatches(data.data);
      if (data.data.length > 0) setForm((f) => ({ ...f, batchId: data.data[0]._id }));
    };
    fetchBatches();
  }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { data } = await axiosInstance.post('/tests', {
        ...form,
        durationMinutes: Number(form.durationMinutes),
      });
      navigate(`/tests/${data.data._id}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create test');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <h1 className="mb-6 text-2xl font-bold">Create Test</h1>

      <form onSubmit={handleSubmit} className="max-w-md space-y-4 rounded-lg bg-white p-6 shadow">
        {error && <p className="text-sm text-red-600">{error}</p>}

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Batch</label>
          <select
            name="batchId"
            value={form.batchId}
            onChange={handleChange}
            className="w-full rounded border border-gray-300 px-3 py-2"
          >
            {batches.map((b) => (
              <option key={b._id} value={b._id}>
                {b.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Test Title</label>
          <input
            name="title"
            value={form.title}
            onChange={handleChange}
            placeholder="e.g. Physics Test 1"
            className="w-full rounded border border-gray-300 px-3 py-2"
            required
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Duration (minutes)</label>
          <input
            type="number"
            name="durationMinutes"
            value={form.durationMinutes}
            onChange={handleChange}
            min="1"
            className="w-full rounded border border-gray-300 px-3 py-2"
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded bg-blue-600 py-2 font-medium text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Creating...' : 'Create Test'}
        </button>
      </form>
    </div>
  );
};

export default CreateTest;