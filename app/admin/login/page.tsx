import { LoginForm } from './LoginForm';

type SearchParams = {
  error?: string;
};

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const unauthorized = params?.error === 'unauthorized';

  return (
    <main
      className="flex min-h-screen items-center justify-center px-4"
      style={{ backgroundColor: 'var(--admin-color-bg)' }}
    >
      <div className="w-full max-w-[420px]">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="text-[24px] font-bold text-[var(--admin-color-primary)]">Plaza</div>
          <div className="mt-1 text-[12px] font-semibold uppercase tracking-wider text-[#78716C]">
            Console admin
          </div>
        </div>
        {unauthorized ? (
          <div
            role="alert"
            className="mb-4 rounded-[6px] border border-[#FEF2F2] bg-[#FEF2F2] px-4 py-3 text-[13px] text-[#B91C1C]"
          >
            Cet email n&apos;est pas autorisé à accéder à la console admin.
          </div>
        ) : null}
        <div className="rounded-[8px] border border-[#E7E5E4] bg-white px-8 py-10">
          <LoginForm />
        </div>
        <p className="mt-6 text-center text-[12px] text-[#A8A29E]">
          Plaza Admin · v1.0
        </p>
      </div>
    </main>
  );
}
