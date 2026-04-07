export default function DashboardLoading() {
  return (
    <div className="min-h-screen bg-[#FAFAF9]">
      <div className="max-w-[1040px] mx-auto px-4 py-6 md:p-8">
        {/* Header skeleton */}
        <div className="mb-8 space-y-2">
          <div className="h-7 w-48 animate-pulse rounded-lg bg-[#F5F5F4]" />
          <div className="h-4 w-32 animate-pulse rounded-lg bg-[#F5F5F4]" />
        </div>

        {/* Stats skeleton */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-8">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-white rounded-xl shadow-sm p-5 space-y-3">
              <div className="w-10 h-10 rounded-full animate-pulse bg-[#F5F5F4]" />
              <div className="h-8 w-16 animate-pulse rounded bg-[#F5F5F4]" />
              <div className="h-3 w-24 animate-pulse rounded bg-[#F5F5F4]" />
            </div>
          ))}
        </div>

        {/* Table skeleton */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="h-12 bg-[#F8FAFC] border-b border-[#E2E8F0]" />
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-12 px-4 flex items-center gap-4 border-b border-[#F3F4F6]">
              <div className="w-24 h-4 animate-pulse rounded bg-[#F5F5F4]" />
              <div className="w-32 h-4 animate-pulse rounded bg-[#F5F5F4]" />
              <div className="w-20 h-4 animate-pulse rounded bg-[#F5F5F4]" />
              <div className="w-20 h-5 animate-pulse rounded-full bg-[#F5F5F4]" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
