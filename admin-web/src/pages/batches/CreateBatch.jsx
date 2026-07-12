import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../../api/axiosInstance';

const CreateBatch = () => {
  const [form, setForm] = useState({ name: '', subject: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await axiosInstance.post('/batches', form);
      navigate('/batches');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create batch');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <h1 className="mb-6 text-2xl font-bold">Create Batch</h1>

      <form onSubmit={handleSubmit} className="max-w-md space-y-4 rounded-lg bg-white p-6 shadow">
        {error && <p className="text-sm text-red-600">{error}</p>}

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Batch Name</label>
          <input
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="e.g. Class 10 - Morning Batch"
            className="w-full rounded border border-gray-300 px-3 py-2"
            required
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Subject (optional)</label>
          <input
            name="subject"
            value={form.subject}
            onChange={handleChange}
            className="w-full rounded border border-gray-300 px-3 py-2"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded bg-blue-600 py-2 font-medium text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Creating...' : 'Create Batch'}
        </button>
      </form>
    </div>
  );
};

export default CreateBatch;