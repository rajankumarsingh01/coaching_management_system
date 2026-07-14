import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axiosInstance from '../../api/axiosInstance';
import { useAuth } from '../../context/AuthContext';

const TYPE_STYLES = {
  test: 'bg-blue-100 text-blue-700',
  holiday: 'bg-red-100 text-red-700',
  event: 'bg-green-100 text-green-700',
};

const CalendarView = () => {
  const { user } = useAuth();
  const [events, setEvents] = useState([]);
  const [error, setError] = useState('');

  const fetchEvents = async () => {
    try {
      const endpoint = user.role === 'admin' ? '/calendar/all' : '/calendar/me';
      const { data } = await axiosInstance.get(endpoint);
      setEvents(data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load calendar events');
    }
  };

  useEffect(() => {
    fetchEvents();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleDelete = async (id) => {
    try {
      await axiosInstance.delete(`/calendar/${id}`);
      fetchEvents();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete event');
    }
  };

  const canManage = user.role === 'admin' || user.role === 'teacher';

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Calendar</h1>
        {canManage && (
          <Link to="/calendar/create" className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">
            + New Event
          </Link>
        )}
      </div>

      {error && <p className="mb-4 text-sm text-red-600">{error}</p>}

      <div className="space-y-3">
        {events.map((e) => (
          <div
            key={e._id}
            className="flex items-center justify-between rounded-lg border border-gray-200 bg-white p-4"
          >
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-semibold">{e.title}</h2>
                <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${TYPE_STYLES[e.type]}`}>
                  {e.type}
                </span>
              </div>
              <p className="text-sm text-gray-500">{new Date(e.date).toLocaleDateString()}</p>
              {e.description && <p className="mt-1 text-sm text-gray-600">{e.description}</p>}
              <p className="mt-1 text-xs text-gray-400">
                {e.batchId ? 'Batch-specific' : 'Institute-wide'}
              </p>
            </div>
            {canManage && (
              <button onClick={() => handleDelete(e._id)} className="text-xs text-red-600 hover:underline">
                Delete
              </button>
            )}
          </div>
        ))}
        {events.length === 0 && <p className="text-sm text-gray-500">No events scheduled.</p>}
      </div>
    </div>
  );
};

export default CalendarView;