import { InkLoader } from '@/components/ui/InkLoader';

export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#04070d]">
      <InkLoader />
    </div>
  );
}
