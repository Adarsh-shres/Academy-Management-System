import { SkeletonBlock, SkeletonCard, SkeletonCircle, SkeletonText } from '../shared/Skeleton';

type PageSkeletonProps = {
  titleWidth?: string;
  subtitleWidth?: string;
};

function PageHeaderSkeleton({ titleWidth = 'w-64', subtitleWidth = 'w-80' }: PageSkeletonProps) {
  return (
    <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
      <div>
        <SkeletonBlock className={`h-9 ${titleWidth}`} />
        <SkeletonText className={`mt-3 ${subtitleWidth} max-w-full`} />
      </div>
      <div className="flex gap-2.5">
        <SkeletonBlock className="h-10 w-28" />
        <SkeletonBlock className="h-10 w-36" />
      </div>
    </div>
  );
}

export function CardGridPageSkeleton({ cards = 6 }: { cards?: number }) {
  return (
    <div className="flex flex-col gap-6 md:gap-8 pb-10 flex-1 min-w-0">
      <PageHeaderSkeleton />
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
        {Array.from({ length: cards }).map((_, index) => (
          <SkeletonCard key={index} className="p-5">
            <div className="flex items-start gap-4">
              <SkeletonBlock className="h-11 w-11 shrink-0" />
              <div className="min-w-0 flex-1 space-y-3">
                <SkeletonBlock className="h-5 w-36" />
                <SkeletonText className="w-full" />
                <SkeletonText className="w-2/3" />
              </div>
            </div>
            <SkeletonBlock className="mt-5 h-9 w-full" />
          </SkeletonCard>
        ))}
      </div>
    </div>
  );
}

export function TablePageSkeleton({ rows = 8 }: { rows?: number }) {
  return (
    <div className="flex flex-col gap-6 md:gap-8 pb-10 flex-1 min-w-0">
      <PageHeaderSkeleton />
      <SkeletonCard className="p-5">
        <div className="flex flex-col md:flex-row gap-3 md:items-center md:justify-between mb-5">
          <SkeletonBlock className="h-10 w-full md:w-72" />
          <SkeletonBlock className="h-10 w-36" />
        </div>
        <div className="space-y-3">
          {Array.from({ length: rows }).map((_, index) => (
            <div key={index} className="grid grid-cols-[44px_1fr_120px_96px] gap-4 items-center rounded-[8px] border border-[#f3eff7] p-3">
              <SkeletonCircle className="h-10 w-10" />
              <div className="space-y-2">
                <SkeletonText className="w-48" />
                <SkeletonText className="w-64 max-w-full" />
              </div>
              <SkeletonBlock className="h-7 w-full rounded-full" />
              <SkeletonBlock className="h-8 w-full" />
            </div>
          ))}
        </div>
      </SkeletonCard>
    </div>
  );
}

export function DetailPageSkeleton() {
  return (
    <div className="flex flex-col gap-6 md:gap-8 pb-10 flex-1 min-w-0">
      <SkeletonCard className="p-6">
        <div className="flex flex-col md:flex-row gap-5 md:items-center">
          <SkeletonCircle className="h-16 w-16" />
          <div className="flex-1 space-y-3">
            <SkeletonBlock className="h-8 w-64" />
            <SkeletonText className="w-80 max-w-full" />
          </div>
          <SkeletonBlock className="h-10 w-32" />
        </div>
      </SkeletonCard>
      <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6">
        <SkeletonCard className="p-5">
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, index) => (
              <SkeletonBlock key={index} className="h-10 w-full" />
            ))}
          </div>
        </SkeletonCard>
        <SkeletonCard className="p-5">
          <SkeletonBlock className="h-7 w-44" />
          <div className="mt-5 space-y-4">
            {Array.from({ length: 5 }).map((_, index) => (
              <SkeletonBlock key={index} className="h-16 w-full" />
            ))}
          </div>
        </SkeletonCard>
      </div>
    </div>
  );
}

export function FormPageSkeleton() {
  return (
    <div className="flex flex-col gap-6 md:gap-8 pb-10 flex-1 min-w-0 max-w-[860px] mx-auto w-full">
      <PageHeaderSkeleton />
      <SkeletonCard className="p-6 md:p-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="space-y-2">
              <SkeletonText className="w-28" />
              <SkeletonBlock className="h-11 w-full" />
            </div>
          ))}
        </div>
        <SkeletonBlock className="mt-6 h-24 w-full" />
        <SkeletonBlock className="ml-auto mt-6 h-10 w-32" />
      </SkeletonCard>
    </div>
  );
}

export function SchedulePageSkeleton() {
  return (
    <div className="flex flex-col gap-6 md:gap-8 pb-10 flex-1 min-w-0">
      <PageHeaderSkeleton />
      <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-6">
        <SkeletonCard className="p-5">
          <SkeletonBlock className="h-7 w-40" />
          <div className="mt-5 space-y-3">
            {Array.from({ length: 5 }).map((_, index) => (
              <SkeletonBlock key={index} className="h-14 w-full" />
            ))}
          </div>
        </SkeletonCard>
        <SkeletonCard className="p-5">
          <div className="grid grid-cols-7 gap-2">
            {Array.from({ length: 35 }).map((_, index) => (
              <SkeletonBlock key={index} className="h-16 w-full" />
            ))}
          </div>
        </SkeletonCard>
      </div>
    </div>
  );
}

export function ProfilePageSkeleton() {
  return (
    <div className="flex flex-col gap-6 md:gap-8 pb-10 flex-1 min-w-0 max-w-[900px] mx-auto w-full">
      <SkeletonCard className="p-8">
        <div className="flex flex-col sm:flex-row gap-6 sm:items-center">
          <SkeletonCircle className="h-24 w-24" />
          <div className="flex-1 space-y-3">
            <SkeletonBlock className="h-8 w-56" />
            <SkeletonText className="w-72 max-w-full" />
            <SkeletonBlock className="h-8 w-32" />
          </div>
        </div>
      </SkeletonCard>
      <SkeletonCard className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="space-y-2">
              <SkeletonText className="w-24" />
              <SkeletonBlock className="h-11 w-full" />
            </div>
          ))}
        </div>
      </SkeletonCard>
    </div>
  );
}

export function NotificationPageSkeleton() {
  return (
    <div className="flex flex-col gap-8 pb-10 flex-1 min-w-0 max-w-[1100px] mx-auto w-full">
      <PageHeaderSkeleton />
      <SkeletonCard className="overflow-hidden">
        {Array.from({ length: 7 }).map((_, index) => (
          <div key={index} className="flex items-start gap-4 border-b border-[#f3eff7] p-5 last:border-0">
            <SkeletonCircle className="mt-1 h-3 w-3" />
            <div className="flex-1 space-y-3">
              <SkeletonBlock className="h-5 w-56" />
              <SkeletonText className="w-full" />
            </div>
            <SkeletonText className="w-16" />
          </div>
        ))}
      </SkeletonCard>
    </div>
  );
}

export function MaterialsPageSkeleton() {
  return (
    <div className="flex flex-col gap-6 md:gap-8 pb-10 flex-1 min-w-0">
      <PageHeaderSkeleton />
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        {Array.from({ length: 8 }).map((_, index) => (
          <SkeletonCard key={index} className="p-5">
            <SkeletonBlock className="h-12 w-12" />
            <SkeletonBlock className="mt-5 h-5 w-36" />
            <SkeletonText className="mt-3 w-full" />
            <SkeletonText className="mt-2 w-2/3" />
          </SkeletonCard>
        ))}
      </div>
    </div>
  );
}
