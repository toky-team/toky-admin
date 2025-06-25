import { Outlet } from 'react-router-dom';

import { useNavigationLoading } from '~/features/loading/hooks/use-navigation-loading';

export default function PublicLayout() {
  useNavigationLoading();

  return (
    <div className="min-h-screen h-screen bg-background text-foreground">
      <Outlet />
    </div>
  );
}
