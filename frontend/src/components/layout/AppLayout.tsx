import React, { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { api } from '../../api';

export const AppLayout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [pendingReviewsCount, setPendingReviewsCount] = useState(0);
  const [openImpactsCount, setOpenImpactsCount] = useState(0);
  const location = useLocation();

  useEffect(() => {
    const fetchCounters = async () => {
      try {
        const [subs, impacts] = await Promise.all([
          api.getSubmissions(),
          api.getImpacts()
        ]);
        setPendingReviewsCount(subs.filter(s => s.status === 'pending').length);
        setOpenImpactsCount(impacts.filter(i => i.status === 'open').length);
      } catch {}
    };

    fetchCounters();
    const interval = setInterval(fetchCounters, 20000);
    return () => clearInterval(interval);
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col transition-colors duration-200">
      <Sidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        pendingReviewsCount={pendingReviewsCount}
        openImpactsCount={openImpactsCount}
      />

      <div className="lg:pl-64 flex flex-col flex-1">
        <Topbar onMenuToggle={() => setSidebarOpen(!sidebarOpen)} />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto animate-in fade-in duration-200">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
