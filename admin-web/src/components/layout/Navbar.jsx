import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import LanguageSwitcher from '../common/LanguageSwitcher';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { branding } = useTheme();
  const { t } = useTranslation();

  if (!user) return null;

  const bgColor = user.role === 'admin' && branding?.primaryColor ? branding.primaryColor : '#111827';

  return (
    <nav className="flex items-center justify-between px-6 py-3 text-white" style={{ backgroundColor: bgColor }}>
      <div className="flex items-center gap-6">
        {branding?.logoUrl && user.role === 'admin' ? (
          <img src={branding.logoUrl} alt="Logo" className="h-8 w-8 rounded-full object-cover" />
        ) : null}
        <span className="font-bold">
          {user.role === 'admin' && branding?.displayName ? branding.displayName : 'Coaching Platform'}
        </span>

        {user.role === 'super_admin' && (
          <>
            <Link to="/institutes" className="text-sm hover:opacity-80">
              Institutes
            </Link>
            <Link to="/institutes/create" className="text-sm hover:opacity-80">
              Onboard Institute
            </Link>
          </>
        )}

        {user.role === 'admin' && (
          <>
            <Link to="/dashboard" className="text-sm hover:opacity-80">
              {t('common.dashboard')}
            </Link>
            <Link to="/batches" className="text-sm hover:opacity-80">
              {t('common.batches')}
            </Link>
            <Link to="/users/create" className="text-sm hover:opacity-80">
              {t('common.createUser')}
            </Link>
            <Link to="/attendance/mark" className="text-sm hover:opacity-80">
              {t('common.attendance')}
            </Link>
            <Link to="/attendance/report" className="text-sm hover:opacity-80">
              Attendance Report
            </Link>
            <Link to="/fees" className="text-sm hover:opacity-80">
              {t('common.fees')}
            </Link>
            <Link to="/content" className="text-sm hover:opacity-80">
              {t('common.content')}
            </Link>
            <Link to="/tests" className="text-sm hover:opacity-80">
              {t('common.tests')}
            </Link>
            <Link to="/homework" className="text-sm hover:opacity-80">
              {t('common.homework')}
            </Link>
            <Link to="/calendar" className="text-sm hover:opacity-80">
              {t('common.calendar')}
            </Link>
            <Link to="/branding" className="text-sm hover:opacity-80">
              {t('common.branding')}
            </Link>
            <Link to="/poster" className="text-sm hover:opacity-80">
              Poster Generator
            </Link>
          </>
        )}

        {user.role === 'teacher' && (
          <>
            <Link to="/attendance/mark" className="text-sm hover:opacity-80">
              {t('common.attendance')}
            </Link>
            <Link to="/attendance/report" className="text-sm hover:opacity-80">
              Attendance Report
            </Link>
            <Link to="/fees/batch" className="text-sm hover:opacity-80">
              Batch Fees
            </Link>
            <Link to="/content" className="text-sm hover:opacity-80">
              {t('common.content')}
            </Link>
            <Link to="/tests" className="text-sm hover:opacity-80">
              {t('common.tests')}
            </Link>
            <Link to="/homework" className="text-sm hover:opacity-80">
              {t('common.homework')}
            </Link>
            <Link to="/calendar" className="text-sm hover:opacity-80">
              {t('common.calendar')}
            </Link>
            <Link to="/poster" className="text-sm hover:opacity-80">
              Poster Generator
            </Link>
          </>
        )}
      </div>

      <div className="flex items-center gap-4">
        <LanguageSwitcher />
        <span className="text-sm opacity-90">
          {user.name} ({user.role})
        </span>
        <button onClick={logout} className="rounded bg-red-600 px-3 py-1 text-sm hover:bg-red-700">
          {t('common.logout')}
        </button>
      </div>
    </nav>
  );
};

export default Navbar;