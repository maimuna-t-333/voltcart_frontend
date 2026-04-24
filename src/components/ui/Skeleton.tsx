export function Skeleton({ className = '' }: { className?: string }) {
  return <div className={`bg-gray-200 rounded-lg animate-pulse ${className}`} />;
}

export function ProductCardSkeleton() {
  return (
    <div className='bg-white rounded-2xl border border-gray-100 p-4'>
      <Skeleton className='aspect-square rounded-xl mb-4' />
      <Skeleton className='h-4 w-1/3 mb-2' />
      <Skeleton className='h-5 w-3/4 mb-2' />
      <Skeleton className='h-4 w-1/4 mb-3' />
      <div className='flex justify-between'>
        <Skeleton className='h-6 w-16' />
        <Skeleton className='h-9 w-9 rounded-xl' />
      </div>
    </div>
  );
}
