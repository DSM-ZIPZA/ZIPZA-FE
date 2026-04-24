export function PropertyCardSkeleton() {
  return (
    <div className="rounded-lg border border-gray-200 bg-white overflow-hidden animate-pulse">
      <div className="h-40 bg-gray-300" />

      <div className="p-4 space-y-3">
        <div className="h-5 bg-gray-300 rounded w-3/4" />

        <div className="space-y-1">
          <div className="h-4 bg-gray-300 rounded w-full" />
          <div className="h-4 bg-gray-300 rounded w-2/3" />
        </div>

        <div className="grid grid-cols-3 gap-2 pt-2 border-t border-gray-200">
          <div className="h-12 bg-gray-300 rounded" />
          <div className="h-12 bg-gray-300 rounded" />
          <div className="h-12 bg-gray-300 rounded" />
        </div>

        <div className="flex gap-1 pt-2">
          <div className="h-6 bg-gray-300 rounded-full w-12" />
          <div className="h-6 bg-gray-300 rounded-full w-16" />
        </div>

        <div className="pt-2 border-t border-gray-200 space-y-1">
          <div className="h-4 bg-gray-300 rounded w-1/3" />
          <div className="h-4 bg-gray-300 rounded w-1/2" />
        </div>
      </div>
    </div>
  );
}

export function PropertyListSkeleton({ count = 5 }: { count?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <PropertyCardSkeleton key={i} />
      ))}
    </div>
  );
}
