import { useEffect, useState } from 'react';
import axiosInstance from '../../api/axiosInstance';

const todayISO = () => new Date().toISOString().split('T')[0];

const MarkAttendance = () => {
  const [batches, setBatches] = useState([]);
  const [selectedBatchId, setSelectedBatchId] = useState('');
  const [date, setDate] = useState(todayISO());
  const [students, setStudents] = useState([]);
  const [statusMap, setStatusMap] = useState({});
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchBatches = async () => {
      const { data } = await axiosInstance.get('/batches');
      setBatches(data.data);
      if (data.data.length > 0) setSelectedBatchId(data.data[0]._id);
    };
    fetchBatches();
  }, []);

  useEffect(() => {
    if (!selectedBatchId) return;
    const batch = batches.find((b) => b._id === selectedBatchId);
    if (batch) {
      setStudents(batch.studentIds || []);
      const initialMap = {};
      (batch.studentIds || []).forEach((s) => {
        initialMap[s._id] = 'present';
      });
      setStatusMap(initialMap);
    }
  }, [selectedBatchId, batches]);

  const handleStatusChange = (studentId, status) => {
    setStatusMap({ ...statusMap, [studentId]: status });
  };

  const handleSubmit = async () => {
    setError('');
    setMessage('');
    setLoading(true);
    try {
      const records = Object.entries(statusMap).map(([studentId, status]) => ({ studentId, status }));
      await axiosInstance.post('/attendance', { batchId: selectedBatchId, date, records });
      setMessage('Attendance marked successfully');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to mark attendance');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <h1 className="mb-6 text-2xl font-bold">Mark Attendance</h1>

      <div className="mb-6 flex flex-wrap gap-4">
        <div>
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

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Date</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="rounded border border-gray-300 px-3 py-2"
          />
        </div>
      </div>

      {message && <p className="mb-4 text-sm text-green-600">{message}</p>}
      {error && <p className="mb-4 text-sm text-red-600">{error}</p>}

      <div className="overflow-x-auto rounded-lg border border-gray-200">
        <table className="min-w-full divide-y divide-gray-200 bg-white">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Student</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {students.map((s) => (
              <tr key={s._id}>
                <td className="px-4 py-3 text-sm text-gray-900">{s.name}</td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    {['present', 'absent', 'late'].map((status) => (
                      <button
                        key={status}
                        onClick={() => handleStatusChange(s._id, status)}
                        className={`rounded px-3 py-1 text-xs font-medium capitalize ${
                          statusMap[s._id] === status
                            ? status === 'present'
                              ? 'bg-green-600 text-white'
                              : status === 'absent'
                              ? 'bg-red-600 text-white'
                              : 'bg-yellow-500 text-white'
                            : 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        {status}
                      </button>
                    ))}
                  </div>
                </td>
              </tr>
            ))}
            {students.length === 0 && (
              <tr>
                <td colSpan={2} className="px-4 py-6 text-center text-sm text-gray-500">
                  No students in this batch.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {students.length > 0 && (
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="mt-6 rounded bg-blue-600 px-6 py-2 font-medium text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Saving...' : 'Save Attendance'}
        </button>
      )}
    </div>
  );
};

export default MarkAttendance;