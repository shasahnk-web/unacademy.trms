export function BatchGridSkeleton() {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="bg-white rounded-lg shadow-sm border border-slate-200 p-6 animate-pulse">
          <div className="flex items-start space-x-4">
            <div className="w-12 h-12 bg-slate-300 rounded-full"></div>
            <div className="flex-1 space-y-3">
              <div className="h-4 bg-slate-300 rounded w-3/4"></div>
              <div className="h-3 bg-slate-300 rounded w-1/2"></div>
              <div className="flex space-x-2">
                <div className="h-6 bg-slate-300 rounded w-16"></div>
                <div className="h-6 bg-slate-300 rounded w-20"></div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export function BatchDetailsSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header skeleton */}
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
        <div className="flex items-start space-x-4 animate-pulse">
          <div className="w-16 h-16 bg-slate-300 rounded-xl"></div>
          <div className="flex-1 space-y-3">
            <div className="h-6 bg-slate-300 rounded w-3/4"></div>
            <div className="h-4 bg-slate-300 rounded w-1/2"></div>
            <div className="flex space-x-2">
              <div className="h-6 bg-slate-300 rounded w-16"></div>
              <div className="h-6 bg-slate-300 rounded w-20"></div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Content skeleton */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6 animate-pulse">
            <div className="h-6 bg-slate-300 rounded w-1/3 mb-4"></div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="text-center space-y-2">
                  <div className="h-8 bg-slate-300 rounded w-16 mx-auto"></div>
                  <div className="h-4 bg-slate-300 rounded w-20 mx-auto"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        <div className="space-y-6">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="bg-white rounded-lg shadow-sm border border-slate-200 p-6 animate-pulse">
              <div className="h-6 bg-slate-300 rounded w-1/2 mb-4"></div>
              <div className="space-y-3">
                <div className="h-4 bg-slate-300 rounded w-full"></div>
                <div className="h-4 bg-slate-300 rounded w-3/4"></div>
                <div className="h-4 bg-slate-300 rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function VideoListSkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="flex items-center space-x-4 animate-pulse">
          <div className="w-16 h-12 bg-slate-300 rounded"></div>
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-slate-300 rounded w-3/4"></div>
            <div className="h-3 bg-slate-300 rounded w-1/2"></div>
          </div>
        </div>
      ))}
    </div>
  );
}
