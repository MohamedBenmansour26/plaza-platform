export default function OrderStatusLoading() {
  return (
    <div className="min-h-screen bg-[#FAFAF9]">
      {/* Header skeleton */}
      <div className="sticky top-0 z-30 bg-white border-b border-[#E2E8F0] h-14 flex items-center px-4 gap-3">
        <div className="w-9 h-9 rounded-full bg-[#F5F5F4] animate-pulse" />
        <div className="h-5 w-48 bg-[#F5F5F4] animate-pulse rounded flex-1" />
        <div className="w-9 h-9 rounded-full bg-[#F5F5F4] animate-pulse" />
      </div>

      <div className="p-4 space-y-4">
        {/* Timeline skeleton */}
        <div className="bg-white rounded-xl p-5 space-y-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex gap-4">
              <div className="flex flex-col items-center">
                <div className="w-10 h-10 rounded-full bg-[#F5F5F4] animate-pulse flex-shrink-0" />
                {i < 3 && <div className="w-0.5 h-12 bg-[#F5F5F4] animate-pulse mt-1" />}
              </div>
              <div className="flex-1 space-y-1.5 pt-2">
                <div className="h-4 w-40 bg-[#F5F5F4] animate-pulse rounded" />
                <div className="h-3 w-24 bg-[#F5F5F4] animate-pulse rounded" />
              </div>
            </div>
          ))}
        </div>

        {/* Customer info skeleton */}
        <div className="bg-white rounded-xl p-5 space-y-3">
          <div className="h-5 w-36 bg-[#F5F5F4] animate-pulse rounded" />
          <div className="space-y-2">
            <div className="h-3 w-16 bg-[#F5F5F4] animate-pulse rounded" />
            <div className="h-4 w-32 bg-[#F5F5F4] animate-pulse rounded" />
          </div>
          <div className="space-y-2">
            <div className="h-3 w-20 bg-[#F5F5F4] animate-pulse rounded" />
            <div className="h-4 w-28 bg-[#F5F5F4] animate-pulse rounded" />
          </div>
        </div>

        {/* Order summary skeleton */}
        <div className="bg-white rounded-xl p-5 space-y-3">
          <div className="h-5 w-40 bg-[#F5F5F4] animate-pulse rounded" />
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-[#F5F5F4] animate-pulse flex-shrink-0" />
              <div className="flex-1 space-y-1.5">
                <div className="h-4 w-32 bg-[#F5F5F4] animate-pulse rounded" />
                <div className="h-3 w-20 bg-[#F5F5F4] animate-pulse rounded" />
              </div>
              <div className="h-4 w-16 bg-[#F5F5F4] animate-pulse rounded" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
