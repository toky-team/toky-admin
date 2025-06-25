import { Menu } from 'lucide-react';

import { useAuthStore } from '~/features/auth/store/auth-state';

export function Header({ onMenuClick }: { onMenuClick: () => void }) {
  const user = useAuthStore((state) => state.user);

  return (
    <header className="h-16 px-6 border-b border-border bg-surface flex items-center justify-between shadow-sm">
      <div className="flex items-center gap-4">
        <button className="lg:hidden" onClick={onMenuClick}>
          <Menu className="text-foreground" />
        </button>
        <h1 className="text-xl font-semibold text-primary">TOKY Admin</h1>
      </div>

      <div className="flex items-center gap-2 sm:gap-4">
        {user && (
          <span className="hidden sm:inline text-sm text-muted truncate">
            안녕하세요, <strong>{user.name}</strong> 님
          </span>
        )}
        <button
          onClick={() => useAuthStore.getState().logout()}
          className="bg-danger hover:bg-opacity-80 text-white text-sm px-3 py-1.5 rounded-md whitespace-nowrap"
        >
          로그아웃
        </button>
      </div>
    </header>
  );
}
