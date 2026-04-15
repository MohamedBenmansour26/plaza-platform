// app/driver/layout.tsx
// Root layout for the driver app — no i18n, no merchant nav.
// Overrides --color-primary to Plaza blue #2563EB so all child components
// using var(--color-primary) inherit blue, without touching the merchant/storefront CSS.

export default function DriverLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="min-h-screen bg-[#FAFAF9] max-w-[430px] mx-auto relative"
      style={{ '--color-primary': '#2563EB' } as React.CSSProperties}
    >
      {children}
    </div>
  );
}
