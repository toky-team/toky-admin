import { X } from 'lucide-react';
import { NavLink } from 'react-router-dom';

const navItems = [
  { label: '홈', to: '/' },
  { label: '경기 점수 관리', to: '/score' },
  { label: '베팅 문항 관리', to: '/question' },
];

interface SidebarProps {
  mobileOpen: boolean;
  onClose: () => void;
}

export function Sidebar({ mobileOpen, onClose }: SidebarProps) {
  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-64 min-h-full border-r border-border bg-surface px-4 py-6 flex-col">
        <nav className="flex flex-col gap-2">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `px-3 py-2 rounded-md text-sm font-medium ${
                  isActive ? 'bg-primary text-white' : 'text-muted hover:bg-border hover:text-foreground'
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      </aside>

      {/* Mobile Overlay Sidebar */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          {/* Sidebar panel */}
          <div className="w-64 min-h-full bg-surface shadow-xl p-6">
            <div className="flex justify-between items-center mb-6">
              <button onClick={onClose}>
                <X className="text-foreground" />
              </button>
            </div>
            <nav className="flex flex-col gap-2">
              {navItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    `px-3 py-2 rounded-md text-sm font-medium ${
                      isActive ? 'bg-primary text-white' : 'text-muted hover:bg-border hover:text-foreground'
                    }`
                  }
                  onClick={onClose}
                >
                  {item.label}
                </NavLink>
              ))}
            </nav>
          </div>

          {/* Backdrop area (click to close) */}
          <div className="flex-1 bg-black/30" onClick={onClose} />
        </div>
      )}
    </>
  );
}
