import { SkeletonBlock, SkeletonCard, SkeletonText } from '../shared/Skeleton';

function AdminStatSkeleton() {
  return (
    <SkeletonCard className="p-5">
      <div className="flex items-center gap-4">
        <SkeletonBlock className="h-11 w-11" />
        <div className="flex-1 space-y-3">
          <SkeletonText className="w-24" />
          <SkeletonBlock className="h-8 w-16" />
        </div>
      </div>
    </SkeletonCard>
  );
}

export default function AdminDashboardSkeleton() {
  return (
    <div className="flex flex-col gap-6 md:gap-8 pb-10 flex-1 min-w-0">
      <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
        <div>
          <SkeletonBlock className="h-9 w-72" />
          <SkeletonText className="mt-3 w-64" />
        </div>
        <SkeletonBlock className="h-10 w-40" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-[18px]">
        <AdminStatSkeleton />
        <AdminStatSkeleton />
        <AdminStatSkeleton />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-5">
        <SkeletonCard className="overflow-hidden">
          <SkeletonBlock className="h-16 w-full rounded-none" />
          <div className="p-5 space-y-4">
            <SkeletonCard className="p-4">
              <SkeletonBlock className="h-10 w-full" />
              <SkeletonBlock className="mt-3 h-20 w-full" />
              <SkeletonBlock className="ml-auto mt-3 h-9 w-32" />
            </SkeletonCard>
            <SkeletonBlock className="h-20 w-full" />
            <SkeletonBlock className="h-20 w-full" />
          </div>
        </SkeletonCard>

        <SkeletonCard className="p-5">
          <SkeletonBlock className="h-6 w-28" />
          <div className="mt-5 grid grid-cols-2 gap-4">
            {Array.from({ length: 6 }).map((_, index) => (
              <SkeletonBlock key={index} className="h-24 w-full" />
            ))}
          </div>
        </SkeletonCard>
      </div>
    </div>
  );
}
