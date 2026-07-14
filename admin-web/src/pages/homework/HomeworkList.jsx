import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axiosInstance from '../../api/axiosInstance';

const HomeworkList = () => {
  const [batches, setBatches] = useState([]);
  const [selectedBatchId, setSelectedBatchId] = useState('');
  const [homeworkList, setHomeworkList] = useState([]);

  useEffect(() => {
    const fetchBatches = async () => {
      const { data } = await axiosInstance.get('/batches');
      setBatches(data.data);
      if (data.data.length > 0) setSelectedBatchId(data.data[0]._id);
    };
    fetchBatches();
  }, []);

  const fetchHomework = async () => {
    if (!selectedBatchId) return;
    const { data } = await axiosInstance.get(`/homework/batch/${selectedBatchId}`);
    setHomeworkList(data.data);
  };

  useEffect(() => {
    fetchHomework();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedBatchId]);

  const isOverdue = (dueDate) => new Date(dueDate) < new Date();

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Homework</h1>
        <Link to="/homework/create" className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">
          + New Homework
        </Link>
      </div>

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

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {homeworkList.map((hw) => (
          <Link
            key={hw._id}
            to={`/homework/${hw._id}/submissions`}
            className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm hover:shadow-md"
          >
            <h2 className="text-lg font-semibold">{hw.title}</h2>
            <p className="text-sm text-gray-500">by {hw.createdBy?.name}</p>
            <p
              className={`mt-2 text-xs font-medium ${
                isOverdue(hw.dueDate) ? 'text-red-600' : 'text-gray-500'
              }`}
            >
              Due: {new Date(hw.dueDate).toLocaleDateString()}
            </p>
          </Link>
        ))}
        {homeworkList.length === 0 && (
          <p className="text-sm text-gray-500">No homework assigned yet for this batch.</p>
        )}
      </div>
    </div>
  );
};

export default HomeworkList;