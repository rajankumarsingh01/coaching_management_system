import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axiosInstance from '../../api/axiosInstance';

const BatchDetail = () => {
  const { id } = useParams();
  const [batch, setBatch] = useState(null);
  const [studentId, setStudentId] = useState('');
  const [teacherId, setTeacherId] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const fetchBatch = async () => {
    try {
      const { data } = await axiosInstance.get(`/batches/${id}`);
      setBatch(data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load batch');
    }
  };

  useEffect(() => {
    fetchBatch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleAssignStudent = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');
    try {
      await axiosInstance.post(`/batches/${id}/assign-student`, { userId: studentId });
      setMessage('Student assigned successfully');
      setStudentId('');
      fetchBatch();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to assign student');
    }
  };

  const handleAssignTeacher = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');
    try {
      await axiosInstance.post(`/batches/${id}/assign-teacher`, { userId: teacherId });
      setMessage('Teacher assigned successfully');
      setTeacherId('');
      fetchBatch();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to assign teacher');
    }
  };

  if (!batch) return <div className="p-6">Loading...</div>;

  return (
    <div className="p-6">
      <h1 className="mb-2 text-2xl font-bold">{batch.name}</h1>
      <p className="mb-6 text-gray-500">{batch.subject || 'No subject set'}</p>

      {message && <p className="mb-4 text-sm text-green-600">{message}</p>}
      {error && <p className="mb-4 text-sm text-red-600">{error}</p>}

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div>
          <h2 className="mb-2 font-semibold">Students ({batch.studentIds?.length || 0})</h2>
          <ul className="mb-4 space-y-1 text-sm text-gray-700">
            {batch.studentIds?.map((s) => (
              <li key={s._id}>{s.name} ({s.email})</li>
            ))}
          </ul>
          <form onSubmit={handleAssignStudent} className="flex gap-2">
            <input
              value={studentId}
              onChange={(e) => setStudentId(e.target.value)}
              placeholder="Student User ID"
              className="flex-1 rounded border border-gray-300 px-3 py-2 text-sm"
              required
            />
            <button type="submit" className="rounded bg-blue-600 px-3 py-2 text-sm text-white hover:bg-blue-700">
              Assign
            </button>
          </form>
        </div>

        <div>
          <h2 className="mb-2 font-semibold">Teachers ({batch.teacherIds?.length || 0})</h2>
          <ul className="mb-4 space-y-1 text-sm text-gray-700">
            {batch.teacherIds?.map((t) => (
              <li key={t._id}>{t.name} ({t.email})</li>
            ))}
          </ul>
          <form onSubmit={handleAssignTeacher} className="flex gap-2">
            <input
              value={teacherId}
              onChange={(e) => setTeacherId(e.target.value)}
              placeholder="Teacher User ID"
              className="flex-1 rounded border border-gray-300 px-3 py-2 text-sm"
              required
            />
            <button type="submit" className="rounded bg-blue-600 px-3 py-2 text-sm text-white hover:bg-blue-700">
              Assign
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default BatchDetail;