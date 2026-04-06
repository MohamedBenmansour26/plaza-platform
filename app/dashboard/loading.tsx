export default function DashboardLoading() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-4">
      <div className="space-y-4 text-center">
        <div className="h-9 w-64 animate-pulse rounded bg-muted mx-auto" />
        <div className="h-5 w-48 animate-pulse rounded bg-muted mx-auto" />
        <div className="h-9 w-32 animate-pulse rounded bg-muted mx-auto" />
      </div>
    </main>
  );
}
