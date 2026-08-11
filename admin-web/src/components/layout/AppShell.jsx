// src/components/layout/AppShell.jsx
//
// Login page pe koi sidebar/topbar nahi dikhta (Login.jsx ka apna full-screen
// layout hai). Baaki sab authenticated pages Sidebar + Topbar ke andar wrap
// hote hain.

import { useAuth } from '../../context/AuthContext';
import Sidebar from './Sidebar';
import Topbar from './Topbar';

const AppShell = ({ children }) => {
  const { user } = useAuth();

  if (!user) {
    return <>{children}</>;
  }

  return (
    <div className="flex h-screen bg-slate-50">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Topbar />
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
};

export default AppShell;