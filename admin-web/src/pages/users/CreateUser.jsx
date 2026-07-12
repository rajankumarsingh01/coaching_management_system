import { useEffect, useState, useCallback } from 'react';
import axiosInstance from '../../api/axiosInstance';

const ROLES = ['teacher', 'student', 'parent'];

const CreateUser = () => {
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'teacher', parentId: '' });
  const [parents, setParents] = useState([]);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const fetchParents = useCallback(async () => {
    try {
      const { data } = await axiosInstance.get('/users', { params: { role: 'parent' } });
      setParents(data.data);
    } catch (err) {
      console.error('Failed to load parents', err);
    }
  }, []);

  useEffect(() => {
    fetchParents();
  }, [fetchParents]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    try {
      const payload = { ...form };
      if (form.role !== 'student' || !form.parentId) {
        delete payload.parentId;
      }
      const { data } = await axiosInstance.post('/users/register', payload);
      setMessage(`User created: ${data.data.name} (${data.data.role})`);
      setForm({ name: '', email: '', password: '', role: 'teacher', parentId: '' });

      // refresh parent list — so a newly created parent shows up immediately
      // the next time role=student is selected, without needing a page reload
      fetchParents();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create user');
    }
  };

  return (
    <div className="p-6">
      <h1 className="mb-6 text-2xl font-bold">Create User</h1>

      <form onSubmit={handleSubmit} className="max-w-md space-y-4">
        {message && <p className="text-sm text-green-600">{message}</p>}
        {error && <p className="text-sm text-red-600">{error}</p>}

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Name</label>
          <input
            name="name"
            value={form.name}
            onChange={handleChange}
            className="w-full rounded border border-gray-300 px-3 py-2"
            required
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Email</label>
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            className="w-full rounded border border-gray-300 px-3 py-2"
            required
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Password</label>
          <input
            type="password"
            name="password"
            value={form.password}
            onChange={handleChange}
            className="w-full rounded border border-gray-300 px-3 py-2"
            required
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Role</label>
          <select
            name="role"
            value={form.role}
            onChange={handleChange}
            className="w-full rounded border border-gray-300 px-3 py-2"
          >
            {ROLES.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </div>

        {form.role === 'student' && (
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Link to Parent (optional)
            </label>
            <select
              name="parentId"
              value={form.parentId}
              onChange={handleChange}
              className="w-full rounded border border-gray-300 px-3 py-2"
            >
              <option value="">No parent linked yet</option>
              {parents.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.email})
                </option>
              ))}
            </select>
            {parents.length === 0 && (
              <p className="mt-1 text-xs text-gray-400">
                No parent accounts yet — create a parent first if you want to link now.
              </p>
            )}
          </div>
        )}

        <button type="submit" className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">
          Create User
        </button>
      </form>
    </div>
  );
};

export default CreateUser;