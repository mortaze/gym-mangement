export function SkeletonCard({ className = "" }) {
  return (
    <div className={`animate-pulse rounded-[2rem] border border-gray-800 bg-[#1a1d23] p-5 ${className}`}>
      <div className="mb-3 h-4 w-16 rounded-lg bg-gray-800" />
      <div className="mb-2 h-8 w-24 rounded-lg bg-gray-800" />
      <div className="h-3 w-20 rounded-lg bg-gray-800" />
    </div>
  );
}

export function SkeletonList({ rows = 3 }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="animate-pulse rounded-[2rem] border border-gray-800 bg-[#1a1d23] p-4">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-2xl bg-gray-800" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-3/4 rounded-lg bg-gray-800" />
              <div className="h-3 w-1/2 rounded-lg bg-gray-800" />
            </div>
            <div className="h-8 w-20 rounded-xl bg-gray-800" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function SkeletonChart() {
  return (
    <div className="animate-pulse rounded-[2rem] border border-gray-800 bg-[#1a1d23] p-5">
      <div className="mb-5 h-5 w-40 rounded-lg bg-gray-800" />
      <div className="h-[280px] rounded-2xl bg-gray-800/50" />
    </div>
  );
}
