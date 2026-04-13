export default function StorefrontLoading() {
  return (
    <div className="min-h-screen bg-[#FAFAF9]">
      {/* Header skeleton */}
      <header className="sticky top-0 z-40 border-b bg-white h-14 flex items-center px-4 justify-between">
        <div className="space-y-1.5">
          <div className="h-4 w-36 animate-pulse rounded bg-stone-200" />
          <div className="h-3 w-24 animate-pulse rounded bg-stone-100" />
        </div>
        <div className="h-9 w-9 animate-pulse rounded-full bg-stone-200" />
      </header>

      {/* Banner skeleton */}
      <div className="h-60 w-full animate-pulse bg-stone-200" />

      {/* Category chips skeleton */}
      <div className="px-4 my-6 flex gap-2 overflow-hidden">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-9 w-20 flex-shrink-0 animate-pulse rounded-full bg-stone-200" />
        ))}
      </div>

      {/* Product grid skeleton */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 px-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="bg-stone-100 rounded-2xl h-64 animate-pulse" />
        ))}
      </div>
    </div>
  );
}
