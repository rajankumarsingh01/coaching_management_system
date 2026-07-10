import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../../api/axiosInstance';

const CreateInstitute = () => {
  const [form, setForm] = useState({
    instituteName: '',
    instituteCode: '',
    adminName: '',
    adminEmail: '',
    adminPassword: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess(null);
    setLoading(true);
    try {
      const { data } = await axiosInstance.post('/institutes', form);
      setSuccess(data.data);
      setTimeout(() => navigate('/institutes'), 1500);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create institute');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <h1 className="mb-6 text-2xl font-bold">Onboard New Institute</h1>

      <form onSubmit={handleSubmit} className="max-w-md space-y-4 rounded-lg bg-white p-6 shadow">
        {error && <p className="text-sm text-red-600">{error}</p>}
        {success && (
          <p className="text-sm text-green-600">
            Institute "{success.institute.name}" created with admin {success.admin.email}
          </p>
        )}

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Institute Name</label>
          <input
            name="instituteName"
            value={form.instituteName}
            onChange={handleChange}
            className="w-full rounded border border-gray-300 px-3 py-2"
            required
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Institute Code</label>
          <input
            name="instituteCode"
            value={form.instituteCode}
            onChange={handleChange}
            placeholder="e.g. SCC001"
            className="w-full rounded border border-gray-300 px-3 py-2"
            required
          />
        </div>

        <hr className="my-2" />
        <p className="text-sm font-medium text-gray-600">Institute Admin (Owner) Account</p>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Admin Name</label>
          <input
            name="adminName"
            value={form.adminName}
            onChange={handleChange}
            className="w-full rounded border border-gray-300 px-3 py-2"
            required
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Admin Email</label>
          <input
            type="email"
            name="adminEmail"
            value={form.adminEmail}
            onChange={handleChange}
            className="w-full rounded border border-gray-300 px-3 py-2"
            required
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Admin Password</label>
          <input
            type="password"
            name="adminPassword"
            value={form.adminPassword}
            onChange={handleChange}
            className="w-full rounded border border-gray-300 px-3 py-2"
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded bg-blue-600 py-2 font-medium text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Creating...' : 'Create Institute'}
        </button>
      </form>
    </div>
  );
};

export default CreateInstitute;