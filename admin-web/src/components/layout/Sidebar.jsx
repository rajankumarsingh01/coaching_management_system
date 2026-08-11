// src/components/layout/Sidebar.jsx
import { NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import {
  LayoutDashboard,
  Building2,
  UserPlus,
  Users,
  CalendarCheck,
  ClipboardList,
  Wallet,
  FolderOpen,
  FileText,
  BookOpen,
  Calendar,
  Palette,
  Image,
  PlusCircle,
} from 'lucide-react';

// Role-based nav config — ek hi jagah se saare role ke links manage hote
// hain, purane Navbar.jsx ki tarah JSX ke andar bikhre hue nahi.
const NAV_CONFIG = {
  super_admin: [
    { to: '/institutes', label: 'Institutes', icon: Building2 },
    { to: '/institutes/create', label: 'Onboard Institute', icon: PlusCircle },
  ],
  admin: [
    { to: '/dashboard', labelKey: 'common.dashboard', icon: LayoutDashboard },
    { to: '/batches', labelKey: 'common.batches', icon: Users },
    { to: '/users/create', labelKey: 'common.createUser', icon: UserPlus },
    { to: '/attendance/mark', labelKey: 'common.attendance', icon: CalendarCheck },
    { to: '/attendance/report', label: 'Attendance Report', icon: ClipboardList },
    { to: '/fees', labelKey: 'common.fees', icon: Wallet },
    { to: '/content', labelKey: 'common.content', icon: FolderOpen },
    { to: '/tests', labelKey: 'common.tests', icon: FileText },
    { to: '/homework', labelKey: 'common.homework', icon: BookOpen },
    { to: '/calendar', labelKey: 'common.calendar', icon: Calendar },
    { to: '/branding', labelKey: 'common.branding', icon: Palette },
    { to: '/poster', label: 'Poster Generator', icon: Image },
  ],
  teacher: [
    { to: '/attendance/mark', labelKey: 'common.attendance', icon: CalendarCheck },
    { to: '/attendance/report', label: 'Attendance Report', icon: ClipboardList },
    { to: '/fees/batch', label: 'Batch Fees', icon: Wallet },
    { to: '/content', labelKey: 'common.content', icon: FolderOpen },
    { to: '/tests', labelKey: 'common.tests', icon: FileText },
    { to: '/homework', labelKey: 'common.homework', icon: BookOpen },
    { to: '/calendar', labelKey: 'common.calendar', icon: Calendar },
    { to: '/poster', label: 'Poster Generator', icon: Image },
  ],
};

const Sidebar = () => {
  const { user } = useAuth();
  const { branding } = useTheme();
  const { t } = useTranslation();

  if (!user) return null;

  const items = NAV_CONFIG[user.role] || [];
  const brandName = user.role === 'admin' && branding?.displayName ? branding.displayName : 'Coaching Platform';
  const brandColor = user.role === 'admin' && branding?.primaryColor ? branding.primaryColor : '#4338CA';

  return (
    <aside className="flex w-64 flex-shrink-0 flex-col border-r border-slate-200 bg-white">
      <div className="flex items-center gap-3 border-b border-slate-100 px-5 py-5">
        {branding?.logoUrl && user.role === 'admin' ? (
          <img src={branding.logoUrl} alt="Logo" className="h-9 w-9 rounded-lg object-cover" />
        ) : (
          <div
            className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg text-sm font-bold text-white"
            style={{ backgroundColor: brandColor }}
          >
            {brandName.charAt(0)}
          </div>
        )}
        <span className="truncate font-semibold text-slate-800">{brandName}</span>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
        {items.map(({ to, label, labelKey, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-indigo-50 text-indigo-700'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`
            }
          >
            <Icon size={18} strokeWidth={2} />
            <span className="truncate">{labelKey ? t(labelKey) : label}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  );
};

export default Sidebar;