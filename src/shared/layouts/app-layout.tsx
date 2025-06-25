import { useState } from 'react';
import { Outlet } from 'react-router-dom';

import { useNavigationLoading } from '~/features/loading/hooks/use-navigation-loading';
import { Header } from '~/shared/widgets/header/header';
import { Sidebar } from '~/shared/widgets/sidebar/sidebar';

export default function AppLayout() {
  useNavigationLoading();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Header onMenuClick={() => setMobileOpen(true)} />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} />

        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
