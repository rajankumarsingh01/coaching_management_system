import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axiosInstance from '../../api/axiosInstance';

const Leaderboard = () => {
  const { batchId } = useParams();
  const [leaderboard, setLeaderboard] = useState([]);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      const { data } = await axiosInstance.get(`/results/leaderboard/${batchId}`);
      setLeaderboard(data.data);
    };
    fetchLeaderboard();
  }, [batchId]);

  return (
    <div className="p-6">
      <h1 className="mb-6 text-2xl font-bold">Leaderboard</h1>

      <div className="overflow-hidden rounded-lg border border-gray-200">
        <table className="min-w-full divide-y divide-gray-200 bg-white">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Rank</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Student</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Tests Taken</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Average %</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {leaderboard.map((s, idx) => (
              <tr key={s.name + idx}>
                <td className="px-4 py-3 text-sm font-bold">
                  {idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : idx + 1}
                </td>
                <td className="px-4 py-3 text-sm">{s.name}</td>
                <td className="px-4 py-3 text-sm">{s.testsCount}</td>
                <td className="px-4 py-3 text-sm font-semibold">{s.averagePercentage}%</td>
              </tr>
            ))}
            {leaderboard.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-6 text-center text-sm text-gray-500">
                  No results yet for this batch.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Leaderboard;