import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axiosInstance from '../../api/axiosInstance';

const InstituteList = () => {
  const [institutes, setInstitutes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchInstitutes = async () => {
      try {
        const { data } = await axiosInstance.get('/institutes');
        setInstitutes(data.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load institutes');
      } finally {
        setLoading(false);
      }
    };
    fetchInstitutes();
  }, []);

  if (loading) return <div className="p-6">Loading institutes...</div>;

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">All Institutes (Tenants)</h1>
        <Link
          to="/institutes/create"
          className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
        >
          + New Institute
        </Link>
      </div>

      {error && <p className="mb-4 text-sm text-red-600">{error}</p>}

      <div className="overflow-x-auto rounded-lg border border-gray-200">
        <table className="min-w-full divide-y divide-gray-200 bg-white">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Name</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Code</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Subscription</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Billing</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Created</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {institutes.map((inst) => (
              <tr key={inst._id}>
                <td className="px-4 py-3 text-sm font-medium text-gray-900">{inst.name}</td>
                <td className="px-4 py-3 text-sm text-gray-600">{inst.code}</td>
                <td className="px-4 py-3 text-sm">
                  <span
                    className={`rounded-full px-2 py-1 text-xs font-medium ${
                      inst.subscriptionStatus === 'active'
                        ? 'bg-green-100 text-green-700'
                        : inst.subscriptionStatus === 'trial'
                        ? 'bg-yellow-100 text-yellow-700'
                        : 'bg-red-100 text-red-700'
                    }`}
                  >
                    {inst.subscriptionStatus}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm text-gray-600">{inst.billingStatus}</td>
                <td className="px-4 py-3 text-sm text-gray-600">
                  {new Date(inst.createdAt).toLocaleDateString()}
                </td>
              </tr>
            ))}
            {institutes.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-sm text-gray-500">
                  No institutes yet. Create the first one.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default InstituteList;