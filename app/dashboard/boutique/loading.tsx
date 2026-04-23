export default function BoutiqueLoading() {
  // design-refresh §3.1 — canvas inherits from DashboardLayout (`bg-background`).
  return (
    <div className="bg-background min-h-screen p-4 md:p-8 animate-pulse">
      <div className="max-w-[1040px] mx-auto space-y-3">
        <div className="h-8 bg-border rounded w-48 mb-6" />
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-card rounded-xl shadow-card p-6">
            <div className="h-4 bg-muted rounded w-32 mb-4" />
            <div className="space-y-3">
              <div className="h-10 bg-muted rounded" />
              <div className="h-10 bg-muted rounded" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
