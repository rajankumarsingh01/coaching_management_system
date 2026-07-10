import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user?.role === 'super_admin') {
      navigate('/institutes');
    }
  }, [user, navigate]);

  if (user?.role === 'super_admin') return null;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">Welcome, {user?.name}</h1>
      <p className="text-gray-600">Role: {user?.role}</p>
      <p className="text-gray-600">Institute ID: {user?.instituteId || 'N/A'}</p>
    </div>
  );
};

export default Dashboard;