import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axiosInstance from '../../api/axiosInstance';

const HomeworkSubmissions = () => {
  const { id } = useParams();
  const [submissions, setSubmissions] = useState([]);

  useEffect(() => {
    const fetchSubmissions = async () => {
      const { data } = await axiosInstance.get(`/submissions/homework/${id}`);
      setSubmissions(data.data);
    };
    fetchSubmissions();
  }, [id]);

  return (
    <div className="p-6">
      <h1 className="mb-6 text-2xl font-bold">Submissions</h1>

      <div className="overflow-hidden rounded-lg border border-gray-200">
        <table className="min-w-full divide-y divide-gray-200 bg-white">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Student</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Submitted At</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Status</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">File</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {submissions.map((s) => (
              <tr key={s._id}>
                <td className="px-4 py-3 text-sm text-gray-900">{s.studentId?.name}</td>
                <td className="px-4 py-3 text-sm text-gray-600">
                  {new Date(s.submittedAt).toLocaleString()}
                </td>
                <td className="px-4 py-3 text-sm">
                  {s.isLate ? (
                    <span className="rounded-full bg-red-100 px-2 py-1 text-xs font-medium text-red-700">
                      Late
                    </span>
                  ) : (
                    <span className="rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-700">
                      On Time
                    </span>
                  )}
                </td>
                <td className="px-4 py-3 text-sm">
                  
                  <a
                    href={s.attachmentUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    View File
                  </a>
                </td>
              </tr>
            ))}
            {submissions.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-6 text-center text-sm text-gray-500">
                  No submissions yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default HomeworkSubmissions;