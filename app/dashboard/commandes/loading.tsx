export default function CommandesLoading() {
  return (
    <div className="p-4 md:p-8 max-w-[1040px] mx-auto">
      {/* Page header skeleton */}
      <div className="flex items-center justify-between mb-6">
        <div className="h-7 w-36 bg-muted/60 animate-pulse rounded" />
      </div>

      {/* Filter tabs skeleton */}
      <div className="flex gap-2 mb-4 overflow-hidden">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-8 w-24 flex-shrink-0 bg-muted/60 animate-pulse rounded-full" />
        ))}
      </div>

      {/* Desktop table skeleton (hidden on mobile) — brief §2.4 */}
      <div className="hidden md:block bg-card rounded-xl shadow-card overflow-hidden">
        <div className="h-12 bg-muted/40 border-b border-border" />
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-14 px-4 flex items-center gap-4 border-b border-border last:border-b-0">
            <div className="w-[130px] h-4 bg-muted/60 animate-pulse rounded" />
            <div className="w-[160px] h-4 bg-muted/60 animate-pulse rounded" />
            <div className="w-[100px] h-4 bg-muted/60 animate-pulse rounded" />
            <div className="w-[130px] h-4 bg-muted/60 animate-pulse rounded" />
            <div className="w-[140px] h-5 bg-muted/60 animate-pulse rounded-full" />
            <div className="w-[130px] h-5 bg-muted/60 animate-pulse rounded-full" />
          </div>
        ))}
      </div>

      {/* Mobile cards skeleton (hidden on desktop) */}
      <div className="md:hidden space-y-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="bg-card rounded-xl p-3 shadow-card">
            <div className="flex items-start justify-between mb-2">
              <div className="h-4 w-24 bg-muted/60 animate-pulse rounded" />
              <div className="h-4 w-20 bg-muted/60 animate-pulse rounded" />
            </div>
            <div className="flex items-center gap-2">
              <div className="h-5 w-24 bg-muted/60 animate-pulse rounded-full" />
              <div className="h-5 w-20 bg-muted/60 animate-pulse rounded-full" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
