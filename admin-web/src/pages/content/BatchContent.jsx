import { useEffect, useState } from 'react';
import axiosInstance from '../../api/axiosInstance';

const BatchContent = () => {
  const [batches, setBatches] = useState([]);
  const [selectedBatchId, setSelectedBatchId] = useState('');
  const [notes, setNotes] = useState([]);
  const [lectures, setLectures] = useState([]);

  const [noteTitle, setNoteTitle] = useState('');
  const [noteFile, setNoteFile] = useState(null);
  const [lectureTitle, setLectureTitle] = useState('');
  const [lectureUrl, setLectureUrl] = useState('');

  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    const fetchBatches = async () => {
      const { data } = await axiosInstance.get('/batches');
      setBatches(data.data);
      if (data.data.length > 0) setSelectedBatchId(data.data[0]._id);
    };
    fetchBatches();
  }, []);

  const fetchContent = async () => {
    if (!selectedBatchId) return;
    const [notesRes, lecturesRes] = await Promise.all([
      axiosInstance.get(`/notes/batch/${selectedBatchId}`),
      axiosInstance.get(`/lectures/batch/${selectedBatchId}`),
    ]);
    setNotes(notesRes.data.data);
    setLectures(lecturesRes.data.data);
  };

  useEffect(() => {
    fetchContent();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedBatchId]);

  const handleUploadNote = async (e) => {
    e.preventDefault();
    if (!noteFile) {
      setError('Please select a file');
      return;
    }
    setError('');
    setMessage('');
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('title', noteTitle);
      formData.append('batchId', selectedBatchId);
      formData.append('file', noteFile);

      await axiosInstance.post('/notes', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setMessage('Notes uploaded successfully');
      setNoteTitle('');
      setNoteFile(null);
      fetchContent();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to upload notes');
    } finally {
      setUploading(false);
    }
  };

  const handleAddLecture = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    try {
      await axiosInstance.post('/lectures', {
        title: lectureTitle,
        youtubeUrl: lectureUrl,
        batchId: selectedBatchId,
      });
      setMessage('Lecture added successfully');
      setLectureTitle('');
      setLectureUrl('');
      fetchContent();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add lecture');
    }
  };

  const handleDeleteNote = async (id) => {
    try {
      await axiosInstance.delete(`/notes/${id}`);
      fetchContent();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete notes');
    }
  };

  const handleDeleteLecture = async (id) => {
    try {
      await axiosInstance.delete(`/lectures/${id}`);
      fetchContent();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete lecture');
    }
  };

  return (
    <div className="p-6">
      <h1 className="mb-6 text-2xl font-bold">Batch Content</h1>

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
      {error && <p className="mb-4 text-sm text-red-600">{error}</p>}

      <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
        {/* NOTES */}
        <div>
          <h2 className="mb-3 text-lg font-semibold">Notes</h2>

          <form onSubmit={handleUploadNote} className="mb-4 space-y-3 rounded-lg border border-gray-200 p-4">
            <input
              type="text"
              placeholder="Note title"
              value={noteTitle}
              onChange={(e) => setNoteTitle(e.target.value)}
              className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
              required
            />
            <input
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={(e) => setNoteFile(e.target.files[0])}
              className="w-full text-sm"
              required
            />
            <p className="text-xs text-gray-400">Max 5MB. PDF, JPG, PNG only.</p>
            <button
              type="submit"
              disabled={uploading}
              className="rounded bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {uploading ? 'Uploading...' : 'Upload Notes'}
            </button>
          </form>

          <ul className="space-y-2">
            {notes.map((n) => (
              <li
                key={n._id}
                className="flex items-center justify-between rounded border border-gray-200 p-3 text-sm"
              >
                <div>
                  <a href={n.fileUrl} target="_blank" rel="noreferrer" className="font-medium text-blue-600">
                    {n.title}
                  </a>
                  <p className="text-xs text-gray-400">by {n.uploadedBy?.name}</p>
                </div>
                <button
                  onClick={() => handleDeleteNote(n._id)}
                  className="text-xs text-red-600 hover:underline"
                >
                  Delete
                </button>
              </li>
            ))}
            {notes.length === 0 && <p className="text-sm text-gray-400">No notes uploaded yet.</p>}
          </ul>
        </div>

        {/* LECTURES */}
        <div>
          <h2 className="mb-3 text-lg font-semibold">Recorded Lectures</h2>

          <form onSubmit={handleAddLecture} className="mb-4 space-y-3 rounded-lg border border-gray-200 p-4">
            <input
              type="text"
              placeholder="Lecture title"
              value={lectureTitle}
              onChange={(e) => setLectureTitle(e.target.value)}
              className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
              required
            />
            <input
              type="text"
              placeholder="YouTube unlisted link"
              value={lectureUrl}
              onChange={(e) => setLectureUrl(e.target.value)}
              className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
              required
            />
            <button type="submit" className="rounded bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700">
              Add Lecture
            </button>
          </form>

          <ul className="space-y-2">
            {lectures.map((l) => (
              <li
                key={l._id}
                className="flex items-center justify-between rounded border border-gray-200 p-3 text-sm"
              >
                <div>
                  <a href={l.youtubeUrl} target="_blank" rel="noreferrer" className="font-medium text-blue-600">
                    {l.title}
                  </a>
                  <p className="text-xs text-gray-400">by {l.uploadedBy?.name}</p>
                </div>
                <button
                  onClick={() => handleDeleteLecture(l._id)}
                  className="text-xs text-red-600 hover:underline"
                >
                  Delete
                </button>
              </li>
            ))}
            {lectures.length === 0 && <p className="text-sm text-gray-400">No lectures added yet.</p>}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default BatchContent;