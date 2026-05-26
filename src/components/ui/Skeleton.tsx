export function Skeleton({ className = '' }: { className?: string }) {
  return <div className={`bg-neutral-200 dark:bg-white/[0.06] rounded-lg animate-pulse ${className}`} />;
}

export function ProductCardSkeleton() {
  return (
    <div className='rounded-2xl overflow-hidden bg-white dark:bg-[#0c0a14] border border-neutral-100 dark:border-white/6'>
      <div className='relative h-[360px] sm:h-[420px]'>
        <Skeleton className='absolute inset-0 rounded-none' />
        <div className='absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent pointer-events-none' />
        <div className='absolute inset-x-0 bottom-0 p-4 sm:p-5'>
          <Skeleton className='h-3 w-1/4 mb-2' />
          <Skeleton className='h-4 w-3/4 mb-2' />
          <Skeleton className='h-3 w-1/3 mb-3' />
          <div className='flex items-center gap-1.5 pt-2.5 border-t border-white/10'>
            <Skeleton className='h-5 w-16' />
          </div>
        </div>
      </div>
    </div>
  );
}
