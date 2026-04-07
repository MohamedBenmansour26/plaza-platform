export default function ProduitsLoading() {
  return (
    <div className="min-h-screen bg-[#FAFAF9]">
      <div className="max-w-[1040px] mx-auto px-4 py-6 md:p-8">
        {/* Header skeleton */}
        <div className="hidden md:flex items-center justify-between mb-6">
          <div className="h-7 w-40 animate-pulse rounded-lg bg-[#F5F5F4]" />
          <div className="h-10 w-40 animate-pulse rounded-lg bg-[#F5F5F4]" />
        </div>

        {/* Search + filter skeleton */}
        <div className="space-y-3 mb-4">
          <div className="h-10 w-full md:w-[280px] animate-pulse rounded-lg bg-[#F5F5F4]" />
          <div className="flex gap-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-8 w-16 animate-pulse rounded-full bg-[#F5F5F4]" />
            ))}
          </div>
        </div>

        {/* Table skeleton */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="h-12 bg-[#F8FAFC] border-b border-[#E2E8F0]" />
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-16 px-4 flex items-center gap-4 border-b border-[#F3F4F6]">
              <div className="w-12 h-12 animate-pulse rounded-lg bg-[#F5F5F4]" />
              <div className="flex-1 h-4 animate-pulse rounded bg-[#F5F5F4]" />
              <div className="w-20 h-4 animate-pulse rounded bg-[#F5F5F4]" />
              <div className="w-20 h-4 animate-pulse rounded bg-[#F5F5F4]" />
              <div className="w-16 h-5 animate-pulse rounded-full bg-[#F5F5F4]" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
