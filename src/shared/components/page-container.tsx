import type { ReactNode } from 'react';

export default function PageContainer({ children }: { children: ReactNode }) {
  return <div className="min-h-full w-full max-w-6xl mx-auto p-4">{children}</div>;
}
