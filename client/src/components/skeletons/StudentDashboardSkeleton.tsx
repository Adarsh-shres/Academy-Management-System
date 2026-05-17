import { SkeletonBlock, SkeletonCard, SkeletonCircle, SkeletonText } from '../shared/Skeleton';

function StatSkeleton() {
  return (
    <SkeletonCard className="p-5">
      <div className="flex items-start gap-3">
        <SkeletonCircle className="h-10 w-10" />
        <div className="flex-1 space-y-3">
          <SkeletonText className="w-20" />
          <SkeletonBlock className="h-7 w-14" />
          <SkeletonText className="w-28" />
        </div>
      </div>
    </SkeletonCard>
  );
}

function AssignmentSkeleton() {
  return (
    <SkeletonCard className="p-5">
      <div className="flex gap-4">
        <SkeletonBlock className="h-9 w-9 shrink-0" />
        <div className="flex-1 space-y-3">
          <div className="flex items-start justify-between gap-4">
            <SkeletonText className="h-4 w-32" />
            <SkeletonBlock className="h-6 w-20 rounded-full" />
          </div>
          <SkeletonText className="w-48" />
          <SkeletonText className="w-40" />
        </div>
      </div>
      <SkeletonBlock className="mt-5 h-10 w-full" />
    </SkeletonCard>
  );
}

export default function StudentDashboardSkeleton() {
  return (
    <div className="flex flex-col gap-8 pb-10 flex-1 min-w-0 max-w-[1100px] mx-auto w-full">
      <div className="rounded-[10px] border border-[#e7dff0] bg-white p-8 shadow-md">
        <SkeletonText className="w-36" />
        <SkeletonBlock className="mt-3 h-9 w-64" />
        <SkeletonText className="mt-3 w-56" />
        <SkeletonBlock className="mt-7 h-8 w-24" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-5">
        {Array.from({ length: 5 }).map((_, index) => (
          <StatSkeleton key={index} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-7">
        <div className="space-y-5">
          <div className="flex items-center justify-between">
            <SkeletonBlock className="h-6 w-28" />
            <SkeletonText className="w-16" />
          </div>
          <div className="space-y-4">
            <AssignmentSkeleton />
            <AssignmentSkeleton />
          </div>
          <SkeletonCard className="p-5">
            <SkeletonBlock className="h-14 w-full" />
            <div className="mt-4 space-y-3">
              <SkeletonBlock className="h-16 w-full" />
              <SkeletonBlock className="h-16 w-full" />
            </div>
          </SkeletonCard>
        </div>

        <SkeletonCard className="p-5">
          <SkeletonBlock className="h-6 w-36" />
          <div className="mt-5 space-y-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="flex items-center gap-3">
                <SkeletonBlock className="h-10 w-10 shrink-0" />
                <div className="flex-1 space-y-2">
                  <SkeletonText className="w-32" />
                  <SkeletonText className="w-20" />
                </div>
              </div>
            ))}
          </div>
        </SkeletonCard>
      </div>
    </div>
  );
}
