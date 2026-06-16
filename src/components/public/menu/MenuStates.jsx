import { Coffee } from "lucide-react";

export function LoadingScreen() {
  return (
    <main className="min-h-screen bg-white px-4 py-16 sm:py-20 lg:py-24">
      <div className="mx-auto max-w-7xl">
        {/* Hero Skeleton */}
        <div className="h-[240px] animate-pulse rounded-2xl bg-[#F8F2EA] sm:h-[280px] lg:h-[360px]" />

        <div className="mt-6 grid gap-5 lg:grid-cols-[260px_1fr] lg:gap-6">
          {/* Sidebar Skeleton (Desktop only) */}
          <div className="hidden h-[520px] animate-pulse rounded-2xl bg-[#F8F2EA] lg:block" />

          {/* Product Grid Skeletons */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 8 }).map((_, index) => (
              <ProductCardSkeleton key={index} />
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}

// Skeleton cho từng sản phẩm (giống card thật)
function ProductCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm">
      {/* Image area */}
      <div className="aspect-square w-full animate-pulse bg-[#F1E9DF]" />

      <div className="space-y-3 p-4">
        {/* Title */}
        <div className="h-5 w-4/5 animate-pulse rounded bg-[#F1E9DF]" />
        
        {/* Category */}
        <div className="h-3.5 w-1/2 animate-pulse rounded bg-[#F1E9DF]" />

        {/* Price */}
        <div className="h-6 w-2/3 animate-pulse rounded bg-[#F1E9DF]" />

        {/* Action buttons area */}
        <div className="flex gap-2 pt-2">
          <div className="h-9 flex-1 animate-pulse rounded-xl bg-[#F1E9DF]" />
          <div className="h-9 flex-1 animate-pulse rounded-xl bg-[#F1E9DF]" />
        </div>
      </div>
    </div>
  );
}

export function StateBox({ title, description }) {
  return (
    <div className="mx-auto w-full max-w-md rounded-2xl border border-[#EEE3D8] bg-white p-8 text-center shadow-xl sm:p-10">
      <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-[#E7F2F4] text-[#4E8791]">
        <Coffee size={32} />
      </div>

      <h1 className="mt-6 text-3xl font-black tracking-tight text-[#2F221C] sm:text-[32px]">
        {title}
      </h1>
      
      <p className="mx-auto mt-3 max-w-[280px] text-[15px] font-medium leading-relaxed text-[#73584D]">
        {description}
      </p>
    </div>
  );
}