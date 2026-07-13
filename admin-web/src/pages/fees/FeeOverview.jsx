import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axiosInstance from '../../api/axiosInstance';

const STATUS_STYLES = {
  paid: 'bg-green-100 text-green-700',
  pending: 'bg-yellow-100 text-yellow-700',
  due: 'bg-red-100 text-red-700',
};

const FeeOverview = () => {
  const [overview, setOverview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchOverview = async () => {
      try {
        const { data } = await axiosInstance.get('/fees/overview');
        setOverview(data.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load fee overview');
      } finally {
        setLoading(false);
      }
    };
    fetchOverview();
  }, []);

  if (loading) return <div className="p-6">Loading fee overview...</div>;
  if (error) return <div className="p-6 text-sm text-red-600">{error}</div>;

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Fee Overview</h1>
        <Link to="/fees/create" className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">
          + New Fee Record
        </Link>
      </div>

      <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-4">
        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <p className="text-xs text-gray-500">Total Amount</p>
          <p className="text-xl font-bold">₹{overview.totalAmount}</p>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <p className="text-xs text-gray-500">Collected</p>
          <p className="text-xl font-bold text-green-600">₹{overview.paidAmount}</p>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <p className="text-xs text-gray-500">Pending</p>
          <p className="text-xl font-bold text-yellow-600">₹{overview.pendingAmount}</p>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <p className="text-xs text-gray-500">Collection %</p>
          <p className="text-xl font-bold">{overview.collectionPercentage}%</p>
        </div>
      </div>

      <div className="overflow-x-auto rounded-lg border border-gray-200">
        <table className="min-w-full divide-y divide-gray-200 bg-white">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Student</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Batch</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Amount</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Due Date</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Status</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Method</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {overview.records.map((fee) => (
              <tr key={fee._id}>
                <td className="px-4 py-3 text-sm text-gray-900">{fee.studentId?.name}</td>
                <td className="px-4 py-3 text-sm text-gray-600">{fee.batchId?.name}</td>
                <td className="px-4 py-3 text-sm text-gray-600">₹{fee.amount}</td>
                <td className="px-4 py-3 text-sm text-gray-600">
                  {new Date(fee.dueDate).toLocaleDateString()}
                </td>
                <td className="px-4 py-3 text-sm">
                  <span className={`rounded-full px-2 py-1 text-xs font-medium ${STATUS_STYLES[fee.status]}`}>
                    {fee.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm capitalize text-gray-600">{fee.paymentMethod}</td>
              </tr>
            ))}
            {overview.records.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-sm text-gray-500">
                  No fee records yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default FeeOverview;