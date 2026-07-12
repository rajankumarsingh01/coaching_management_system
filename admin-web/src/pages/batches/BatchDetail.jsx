import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axiosInstance from '../../api/axiosInstance';

const BatchDetail = () => {
  const { id } = useParams();
  const [batch, setBatch] = useState(null);
  const [allStudents, setAllStudents] = useState([]);
  const [allTeachers, setAllTeachers] = useState([]);
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [selectedTeacherId, setSelectedTeacherId] = useState('');
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

  const fetchUserOptions = async () => {
    try {
      const [studentsRes, teachersRes] = await Promise.all([
        axiosInstance.get('/users', { params: { role: 'student' } }),
        axiosInstance.get('/users', { params: { role: 'teacher' } }),
      ]);
      setAllStudents(studentsRes.data.data);
      setAllTeachers(teachersRes.data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load users');
    }
  };

  useEffect(() => {
    fetchBatch();
    fetchUserOptions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const alreadyAssignedStudentIds = new Set((batch?.studentIds || []).map((s) => s._id));
  const alreadyAssignedTeacherIds = new Set((batch?.teacherIds || []).map((t) => t._id));

  const availableStudents = allStudents.filter((s) => !alreadyAssignedStudentIds.has(s.id));
  const availableTeachers = allTeachers.filter((t) => !alreadyAssignedTeacherIds.has(t.id));

  const handleAssignStudent = async (e) => {
    e.preventDefault();
    if (!selectedStudentId) return;
    setMessage('');
    setError('');
    try {
      await axiosInstance.post(`/batches/${id}/assign-student`, { userId: selectedStudentId });
      setMessage('Student assigned successfully');
      setSelectedStudentId('');
      fetchBatch();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to assign student');
    }
  };

  const handleAssignTeacher = async (e) => {
    e.preventDefault();
    if (!selectedTeacherId) return;
    setMessage('');
    setError('');
    try {
      await axiosInstance.post(`/batches/${id}/assign-teacher`, { userId: selectedTeacherId });
      setMessage('Teacher assigned successfully');
      setSelectedTeacherId('');
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
            {(!batch.studentIds || batch.studentIds.length === 0) && (
              <li className="text-gray-400">No students assigned yet.</li>
            )}
          </ul>

          {availableStudents.length > 0 ? (
            <form onSubmit={handleAssignStudent} className="flex gap-2">
              <select
                value={selectedStudentId}
                onChange={(e) => setSelectedStudentId(e.target.value)}
                className="flex-1 rounded border border-gray-300 px-3 py-2 text-sm"
                required
              >
                <option value="">Select a student...</option>
                {availableStudents.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.email})
                  </option>
                ))}
              </select>
              <button type="submit" className="rounded bg-blue-600 px-3 py-2 text-sm text-white hover:bg-blue-700">
                Assign
              </button>
            </form>
          ) : (
            <p className="text-xs text-gray-400">
              No unassigned students available. Create one from "Create User".
            </p>
          )}
        </div>

        <div>
          <h2 className="mb-2 font-semibold">Teachers ({batch.teacherIds?.length || 0})</h2>
          <ul className="mb-4 space-y-1 text-sm text-gray-700">
            {batch.teacherIds?.map((t) => (
              <li key={t._id}>{t.name} ({t.email})</li>
            ))}
            {(!batch.teacherIds || batch.teacherIds.length === 0) && (
              <li className="text-gray-400">No teachers assigned yet.</li>
            )}
          </ul>

          {availableTeachers.length > 0 ? (
            <form onSubmit={handleAssignTeacher} className="flex gap-2">
              <select
                value={selectedTeacherId}
                onChange={(e) => setSelectedTeacherId(e.target.value)}
                className="flex-1 rounded border border-gray-300 px-3 py-2 text-sm"
                required
              >
                <option value="">Select a teacher...</option>
                {availableTeachers.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name} ({t.email})
                  </option>
                ))}
              </select>
              <button type="submit" className="rounded bg-blue-600 px-3 py-2 text-sm text-white hover:bg-blue-700">
                Assign
              </button>
            </form>
          ) : (
            <p className="text-xs text-gray-400">
              No unassigned teachers available. Create one from "Create User".
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default BatchDetail;