import { LoadingSpinner } from '@/components/common/loading-spinner';

export default function Loading() {
  return (
    <div
      className="flex min-h-[50vh] items-center justify-center"
      aria-busy="true"
    >
      <LoadingSpinner label="Đang tải..." />
    </div>
  );
}
