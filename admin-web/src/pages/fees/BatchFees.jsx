import { useEffect, useState } from 'react';
import axiosInstance from '../../api/axiosInstance';

const STATUS_STYLES = {
  paid: 'bg-green-100 text-green-700',
  pending: 'bg-yellow-100 text-yellow-700',
  due: 'bg-red-100 text-red-700',
};

const BatchFees = () => {
  const [batches, setBatches] = useState([]);
  const [selectedBatchId, setSelectedBatchId] = useState('');
  const [fees, setFees] = useState([]);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const fetchBatches = async () => {
      const { data } = await axiosInstance.get('/batches');
      setBatches(data.data);
      if (data.data.length > 0) setSelectedBatchId(data.data[0]._id);
    };
    fetchBatches();
  }, []);

  const fetchFees = async () => {
    if (!selectedBatchId) return;
    const { data } = await axiosInstance.get(`/fees/batch/${selectedBatchId}`);
    setFees(data.data);
  };

  useEffect(() => {
    fetchFees();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedBatchId]);

  const handleMarkPaid = async (feeId) => {
    setMessage('');
    try {
      await axiosInstance.patch(`/fees/${feeId}/mark-paid`, {});
      setMessage('Fee marked as paid');
      fetchFees();
    } catch (err) {
      setMessage(err.response?.data?.message || 'Failed to mark as paid');
    }
  };

  return (
    <div className="p-6">
      <h1 className="mb-6 text-2xl font-bold">Batch Fees</h1>

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

      {message && <p className="mb-4 text-sm text-green-600">{message}</p>}

      <div className="overflow-x-auto rounded-lg border border-gray-200">
        <table className="min-w-full divide-y divide-gray-200 bg-white">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Student</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Amount</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Due Date</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Status</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {fees.map((fee) => (
              <tr key={fee._id}>
                <td className="px-4 py-3 text-sm text-gray-900">{fee.studentId?.name}</td>
                <td className="px-4 py-3 text-sm text-gray-600">₹{fee.amount}</td>
                <td className="px-4 py-3 text-sm text-gray-600">
                  {new Date(fee.dueDate).toLocaleDateString()}
                </td>
                <td className="px-4 py-3 text-sm">
                  <span className={`rounded-full px-2 py-1 text-xs font-medium ${STATUS_STYLES[fee.status]}`}>
                    {fee.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm">
                  {fee.status !== 'paid' && (
                    <button
                      onClick={() => handleMarkPaid(fee._id)}
                      className="rounded bg-green-600 px-3 py-1 text-xs font-medium text-white hover:bg-green-700"
                    >
                      Mark Paid
                    </button>
                  )}
                </td>
              </tr>
            ))}
            {fees.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-sm text-gray-500">
                  No fee records for this batch.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default BatchFees;