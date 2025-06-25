import type { ReactNode } from 'react';

export default function PageCenteredContainer({ children }: { children: ReactNode }) {
  return <div className="flex flex-col items-center justify-center h-full">{children}</div>;
}
