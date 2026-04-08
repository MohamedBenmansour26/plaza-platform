export default function BoutiqueLoading() {
  return (
    <div className="bg-[#FAFAF9] min-h-screen p-4 md:p-8 animate-pulse">
      <div className="max-w-[1040px] mx-auto space-y-3">
        <div className="h-8 bg-[#E2E8F0] rounded w-48 mb-6" />
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white rounded-xl shadow-sm p-6">
            <div className="h-4 bg-[#F5F5F4] rounded w-32 mb-4" />
            <div className="space-y-3">
              <div className="h-10 bg-[#F5F5F4] rounded" />
              <div className="h-10 bg-[#F5F5F4] rounded" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
