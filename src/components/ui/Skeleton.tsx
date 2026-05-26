export function Skeleton({ className = '' }: { className?: string }) {
  return <div className={`bg-neutral-200 dark:bg-white/[0.06] rounded-lg animate-pulse ${className}`} />;
}

export function ProductCardSkeleton() {
  return (
    <div className='rounded-2xl border border-neutral-100 dark:border-white/[0.06] p-4 bg-white dark:bg-[#0c0a14]'>
      <Skeleton className='aspect-square rounded-xl mb-4' />
      <Skeleton className='h-3 w-1/4 mb-2' />
      <Skeleton className='h-4 w-3/4 mb-2' />
      <Skeleton className='h-3 w-1/3 mb-3' />
      <div className='flex justify-between items-center pt-2 border-t border-neutral-100 dark:border-white/[0.06]'>
        <Skeleton className='h-5 w-16' />
        <Skeleton className='h-9 w-9 rounded-xl' />
      </div>
    </div>
  );
}
