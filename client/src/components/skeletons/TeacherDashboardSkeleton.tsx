import { SkeletonBlock, SkeletonCard, SkeletonCircle, SkeletonText } from '../shared/Skeleton';

function TeacherOverviewCardSkeleton() {
  return (
    <SkeletonCard className="rounded-2xl p-6">
      <SkeletonCircle className="mx-auto mb-3 h-12 w-12" />
      <SkeletonBlock className="mx-auto h-8 w-12" />
      <SkeletonText className="mx-auto mt-3 w-28" />
    </SkeletonCard>
  );
}

function AnnouncementSkeleton() {
  return (
    <div className="flex gap-4 rounded-sm border border-[#e7dff0] bg-[#fbf8fe] p-4 border-l-[3px] border-l-primary">
      <SkeletonBlock className="h-10 w-10 shrink-0" />
      <div className="flex-1 space-y-3">
        <SkeletonText className="w-32" />
        <SkeletonText className="w-20" />
        <SkeletonText className="w-full" />
      </div>
    </div>
  );
}

export default function TeacherDashboardSkeleton() {
  return (
    <div className="flex-1 p-6 md:p-8 flex flex-col lg:flex-row gap-8 w-full">
      <div className="flex-1 flex flex-col min-w-0">
        <SkeletonCard className="mb-8 rounded-sm">
          <div className="border-b border-[#e7dff0] bg-[#fbf8fe] p-5">
            <SkeletonBlock className="h-6 w-36" />
          </div>
          <div className="p-5 flex flex-col gap-4">
            <AnnouncementSkeleton />
            <AnnouncementSkeleton />
          </div>
        </SkeletonCard>

        <div className="mb-8">
          <SkeletonBlock className="mb-4 h-6 w-24" />
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <TeacherOverviewCardSkeleton />
            <TeacherOverviewCardSkeleton />
            <TeacherOverviewCardSkeleton />
          </div>
        </div>

        <div className="flex flex-col gap-6 mb-8">
          <SkeletonCard className="p-5">
            <SkeletonBlock className="h-6 w-32" />
            <div className="mt-5 space-y-3">
              <SkeletonBlock className="h-16 w-full" />
              <SkeletonBlock className="h-16 w-full" />
            </div>
          </SkeletonCard>
          <div className="flex flex-col md:flex-row gap-6">
            <SkeletonCard className="w-full md:w-[55%] p-5">
              <SkeletonBlock className="h-14 w-full" />
              <SkeletonBlock className="mt-4 h-20 w-full" />
              <SkeletonBlock className="mt-3 h-20 w-full" />
            </SkeletonCard>
            <SkeletonCard className="w-full md:flex-1 p-5">
              <SkeletonBlock className="h-8 w-44" />
              <SkeletonBlock className="mt-4 h-24 w-full" />
              <SkeletonBlock className="ml-auto mt-3 h-8 w-24" />
            </SkeletonCard>
          </div>
        </div>
      </div>

      <div className="w-full lg:w-[320px] flex flex-col shrink-0 gap-8 pb-10">
        <SkeletonCard className="p-5">
          <SkeletonBlock className="h-6 w-36" />
          <div className="mt-5 space-y-3">
            <SkeletonBlock className="h-14 w-full" />
            <SkeletonBlock className="h-14 w-full" />
            <SkeletonBlock className="h-14 w-full" />
          </div>
        </SkeletonCard>
        <SkeletonCard className="p-5">
          <SkeletonBlock className="h-6 w-32" />
          <div className="mt-5 space-y-3">
            <SkeletonBlock className="h-16 w-full" />
            <SkeletonBlock className="h-16 w-full" />
          </div>
        </SkeletonCard>
      </div>
    </div>
  );
}
