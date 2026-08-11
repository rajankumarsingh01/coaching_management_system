// src/components/layout/Topbar.jsx
import { useAuth } from '../../context/AuthContext';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from '../common/LanguageSwitcher';
import { LogOut } from 'lucide-react';

const Topbar = () => {
  const { user, logout } = useAuth();
  const { t } = useTranslation();

  if (!user) return null;

  const initials = (user.name || '?')
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <header className="flex items-center justify-between border-b border-slate-200 bg-white px-6 py-3.5">
      <div />
      <div className="flex items-center gap-4">
        <LanguageSwitcher />
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-100 text-xs font-semibold text-indigo-700">
            {initials}
          </div>
          <div className="leading-tight">
            <p className="text-sm font-medium text-slate-800">{user.name}</p>
            <p className="text-xs capitalize text-slate-500">{user.role.replace('_', ' ')}</p>
          </div>
        </div>
        <button
          onClick={logout}
          className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-600 transition-colors hover:border-red-200 hover:bg-red-50 hover:text-red-600"
        >
          <LogOut size={15} />
          {t('common.logout')}
        </button>
      </div>
    </header>
  );
};

export default Topbar;