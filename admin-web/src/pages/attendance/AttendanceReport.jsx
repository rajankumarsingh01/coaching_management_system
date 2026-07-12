import { useEffect, useState } from 'react';
import axiosInstance from '../../api/axiosInstance';

const todayISO = () => new Date().toISOString().split('T')[0];
const monthAgoISO = () => {
  const d = new Date();
  d.setMonth(d.getMonth() - 1);
  return d.toISOString().split('T')[0];
};

const AttendanceReport = () => {
  const [batches, setBatches] = useState([]);
  const [selectedBatchId, setSelectedBatchId] = useState('');
  const [startDate, setStartDate] = useState(monthAgoISO());
  const [endDate, setEndDate] = useState(todayISO());
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchBatches = async () => {
      const { data } = await axiosInstance.get('/batches');
      setBatches(data.data);
      if (data.data.length > 0) setSelectedBatchId(data.data[0]._id);
    };
    fetchBatches();
  }, []);

  const fetchReport = async () => {
    if (!selectedBatchId) return;
    setLoading(true);
    setError('');
    try {
      const { data } = await axiosInstance.get(`/attendance/batch/${selectedBatchId}/report`, {
        params: { startDate, endDate },
      });
      setRecords(data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load report');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedBatchId) fetchReport();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedBatchId]);

  // aggregate per-student stats from raw records
  const studentStats = {};
  records.forEach((r) => {
    const id = r.studentId._id;
    if (!studentStats[id]) {
      studentStats[id] = { name: r.studentId.name, present: 0, total: 0 };
    }
    studentStats[id].total += 1;
    if (r.status === 'present' || r.status === 'late') studentStats[id].present += 1;
  });

  return (
    <div className="p-6">
      <h1 className="mb-6 text-2xl font-bold">Attendance Report</h1>

      <div className="mb-6 flex flex-wrap items-end gap-4">
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
          <label className="mb-1 block text-sm font-medium text-gray-700">Start Date</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="rounded border border-gray-300 px-3 py-2"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">End Date</label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="rounded border border-gray-300 px-3 py-2"
          />
        </div>
        <button
          onClick={fetchReport}
          className="rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          Refresh
        </button>
      </div>

      {error && <p className="mb-4 text-sm text-red-600">{error}</p>}
      {loading && <p className="text-sm text-gray-500">Loading...</p>}

      <div className="overflow-x-auto rounded-lg border border-gray-200">
        <table className="min-w-full divide-y divide-gray-200 bg-white">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Student</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Present</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Total</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">%</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {Object.values(studentStats).map((s) => (
              <tr key={s.name}>
                <td className="px-4 py-3 text-sm text-gray-900">{s.name}</td>
                <td className="px-4 py-3 text-sm text-gray-600">{s.present}</td>
                <td className="px-4 py-3 text-sm text-gray-600">{s.total}</td>
                <td className="px-4 py-3 text-sm font-medium text-gray-900">
                  {s.total === 0 ? '0' : Math.round((s.present / s.total) * 100)}%
                </td>
              </tr>
            ))}
            {Object.values(studentStats).length === 0 && !loading && (
              <tr>
                <td colSpan={4} className="px-4 py-6 text-center text-sm text-gray-500">
                  No attendance records in this range.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AttendanceReport;