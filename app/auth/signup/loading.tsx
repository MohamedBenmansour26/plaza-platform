export default function SignupLoading() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-4">
      <div className="w-full max-w-sm space-y-4">
        <div className="h-8 w-48 animate-pulse rounded bg-muted mx-auto" />
        <div className="h-4 w-64 animate-pulse rounded bg-muted mx-auto" />
        <div className="space-y-3 pt-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="space-y-1">
              <div className="h-4 w-24 animate-pulse rounded bg-muted" />
              <div className="h-9 w-full animate-pulse rounded bg-muted" />
            </div>
          ))}
          <div className="h-9 w-full animate-pulse rounded bg-muted" />
        </div>
      </div>
    </main>
  );
}
