import { Outlet, useNavigate } from 'react-router';
import { useEffect } from 'react';
import { Sidebar } from './Sidebar';
import { useApp } from '../../context/AppContext';

export function AppLayout() {
  const { user } = useApp();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/');
    }
  }, [user, navigate]);

  if (!user) return null;

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <Sidebar />
      <main className="flex-1 ml-60 min-h-screen">
        <div className="px-8 py-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
