export default function StorefrontLoading() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header skeleton */}
      <header className="sticky top-0 z-40 border-b bg-background/95">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
          <div className="space-y-1">
            <div className="h-5 w-40 animate-pulse rounded bg-muted" />
            <div className="h-4 w-64 animate-pulse rounded bg-muted" />
          </div>
          <div className="h-10 w-10 animate-pulse rounded-full bg-muted" />
        </div>
      </header>

      {/* Product grid skeleton */}
      <main className="mx-auto max-w-5xl px-4 py-6">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="overflow-hidden rounded-lg border bg-card shadow-sm"
            >
              <div className="aspect-square w-full animate-pulse bg-muted" />
              <div className="space-y-2 p-3">
                <div className="h-4 w-full animate-pulse rounded bg-muted" />
                <div className="h-4 w-3/4 animate-pulse rounded bg-muted" />
                <div className="h-8 w-full animate-pulse rounded bg-muted" />
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
