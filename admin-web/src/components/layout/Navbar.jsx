import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();

  if (!user) return null;

  return (
    <nav className="flex items-center justify-between bg-gray-900 px-6 py-3 text-white">
      <div className="flex items-center gap-6">
        <span className="font-bold">Coaching Platform</span>

        {user.role === 'super_admin' && (
          <>
            <Link to="/institutes" className="text-sm hover:text-gray-300">
              Institutes
            </Link>
            <Link to="/institutes/create" className="text-sm hover:text-gray-300">
              Onboard Institute
            </Link>
          </>
        )}

        {user.role === 'admin' && (
          <>
            <Link to="/dashboard" className="text-sm hover:text-gray-300">
              Dashboard
            </Link>
            <Link to="/batches" className="text-sm hover:text-gray-300">
              Batches
            </Link>
            <Link to="/users/create" className="text-sm hover:text-gray-300">
              Create User
            </Link>
            <Link to="/attendance/mark" className="text-sm hover:text-gray-300">
              Mark Attendance
            </Link>
            <Link to="/attendance/report" className="text-sm hover:text-gray-300">
              Attendance Report
            </Link>
          </>
        )}

        {user.role === 'teacher' && (
          <>
            <Link to="/attendance/mark" className="text-sm hover:text-gray-300">
              Mark Attendance
            </Link>
            <Link to="/attendance/report" className="text-sm hover:text-gray-300">
              Attendance Report
            </Link>
          </>
        )}
      </div>

      <div className="flex items-center gap-4">
        <span className="text-sm text-gray-300">
          {user.name} ({user.role})
        </span>
        <button onClick={logout} className="rounded bg-red-600 px-3 py-1 text-sm hover:bg-red-700">
          Logout
        </button>
      </div>
    </nav>
  );
};

export default Navbar;