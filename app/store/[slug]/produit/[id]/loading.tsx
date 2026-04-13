export default function ProductDetailLoading() {
  return (
    <div className="min-h-screen bg-[#FAFAF9]">
      {/* Header skeleton */}
      <div className="sticky top-0 z-50 bg-white border-b border-[#E2E8F0] h-14 flex items-center px-4 gap-3">
        <div className="w-9 h-9 rounded-full bg-[#F5F5F4] animate-pulse" />
        <div className="h-5 w-40 bg-[#F5F5F4] animate-pulse rounded" />
      </div>

      {/* Product image skeleton */}
      <div className="w-full aspect-square bg-[#F5F5F4] animate-pulse" />

      {/* Product info skeleton */}
      <div className="p-4 space-y-4">
        {/* Title */}
        <div className="space-y-2">
          <div className="h-6 w-3/4 bg-[#F5F5F4] animate-pulse rounded" />
          <div className="h-4 w-1/2 bg-[#F5F5F4] animate-pulse rounded" />
        </div>

        {/* Price */}
        <div className="h-8 w-28 bg-[#F5F5F4] animate-pulse rounded" />

        {/* Description lines */}
        <div className="space-y-2 pt-2">
          <div className="h-4 w-full bg-[#F5F5F4] animate-pulse rounded" />
          <div className="h-4 w-5/6 bg-[#F5F5F4] animate-pulse rounded" />
          <div className="h-4 w-4/6 bg-[#F5F5F4] animate-pulse rounded" />
        </div>

        {/* CTA button skeleton */}
        <div className="h-14 w-full bg-[#F5F5F4] animate-pulse rounded-xl mt-6" />
      </div>
    </div>
  );
}
