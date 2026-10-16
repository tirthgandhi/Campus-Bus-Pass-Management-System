export default function Spinner() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#E8F1FA] gap-4">
      <div className="relative">
        <div className="w-12 h-12 rounded-full border-[3px] border-[#CDE1F2]" />
        <div className="absolute inset-0 w-12 h-12 rounded-full border-[3px] border-transparent border-t-[#1B3A6B] animate-spin" />
      </div>
      <p className="text-xs text-[#6B8CAE] font-medium animate-pulse">Loading…</p>
    </div>
  );
}
