export default function Loading() {
  return (
    <div
      role="status"
      aria-label="Yükleniyor"
      className="min-h-screen flex items-center justify-center bg-[#04070d]"
    >
      <div className="relative">
        <div className="w-12 h-12 rounded-full border-2 border-white/[0.08]" />
        <div className="absolute inset-0 w-12 h-12 rounded-full border-2 border-transparent border-t-indigo-400 border-r-cyan-400 animate-spin" />
      </div>
    </div>
  );
}
