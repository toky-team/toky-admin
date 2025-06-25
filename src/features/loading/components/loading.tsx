import { useLoadingStore } from '~/features/loading/store/loading-store';

export function Loading() {
  const isLoading = useLoadingStore((state) => state.isLoading);

  if (!isLoading) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="flex items-center justify-center bg-surface rounded-md px-6 py-4 shadow-md">
        <div className="w-6 h-6 border-4 border-gray-300 border-t-primary rounded-full animate-spin" />
      </div>
    </div>
  );
}
