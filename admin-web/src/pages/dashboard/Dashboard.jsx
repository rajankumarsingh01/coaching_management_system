import { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Users, CalendarCheck, Wallet, FileText, BookOpen, UserPlus } from 'lucide-react';

const QUICK_LINKS = [
  { to: '/batches', label: 'Batches', desc: 'Manage batches and enrollments', icon: Users, color: 'bg-indigo-50 text-indigo-600' },
  { to: '/attendance/mark', label: 'Attendance', desc: "Mark today's attendance", icon: CalendarCheck, color: 'bg-emerald-50 text-emerald-600' },
  { to: '/fees', label: 'Fees', desc: 'Track dues and payments', icon: Wallet, color: 'bg-amber-50 text-amber-600' },
  { to: '/tests', label: 'Tests', desc: 'Create and review tests', icon: FileText, color: 'bg-rose-50 text-rose-600' },
  { to: '/homework', label: 'Homework', desc: 'Assign and check homework', icon: BookOpen, color: 'bg-sky-50 text-sky-600' },
  { to: '/users/create', label: 'Create User', desc: 'Add a teacher or student', icon: UserPlus, color: 'bg-violet-50 text-violet-600' },
];

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
    <div className="space-y-6">
      <div className="rounded-2xl bg-gradient-to-r from-indigo-600 to-indigo-500 px-6 py-8 text-white shadow-sm">
        <p className="text-sm font-medium text-indigo-100">Welcome back</p>
        <h1 className="mt-1 text-2xl font-bold">{user?.name}</h1>
        <div className="mt-4 flex flex-wrap gap-x-6 gap-y-1 text-sm text-indigo-100">
          <span className="capitalize">Role: {user?.role?.replace('_', ' ')}</span>
          {user?.instituteId && <span className="truncate">Institute ID: {user.instituteId}</span>}
        </div>
      </div>

      <div>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">Quick actions</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {QUICK_LINKS.map(({ to, label, desc, icon: Icon, color }) => (
            <Link
              key={to}
              to={to}
              className="group flex items-start gap-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
            >
              <div className={`flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-lg ${color}`}>
                <Icon size={20} strokeWidth={2} />
              </div>
              <div>
                <p className="font-semibold text-slate-800 group-hover:text-indigo-600">{label}</p>
                <p className="mt-0.5 text-sm text-slate-500">{desc}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;