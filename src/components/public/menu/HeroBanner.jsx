import { ArrowRight, Coffee, MapPin } from "lucide-react";

export default function HeroBanner({ shop, totalItems }) {
  return (
   <section className="bg-white pt-16 lg:pt-20">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="grid overflow-hidden rounded-[18px] border border-[#EEE3D8] bg-white shadow-sm lg:grid-cols-[1fr_0.9fr]">
          <div className="p-6 sm:p-8 lg:p-12">
            <div className="inline-flex items-center gap-2 rounded-full bg-[#F8F2EA] px-4 py-2 text-xs font-black uppercase tracking-[0.14em] text-[#6B4B3E]">
              <Coffee size={15} />
              Menu online
            </div>

            <h1 className="mt-5 max-w-3xl text-4xl font-black leading-[0.98] tracking-[-0.05em] text-[#2F221C] sm:text-6xl lg:text-7xl">
              {shop.name || "Hớp"}
              <span className="block text-[#7CAEB8]">coffee & drinks</span>
            </h1>

            <p className="mt-5 max-w-2xl text-base font-medium leading-8 text-[#73584D]">
              {shop.description ||
                "Xem menu nhanh, rõ giá, dễ tìm món và liên hệ với quán ngay trên điện thoại."}
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
             <a
                href="#menu"
                className="inline-flex items-center justify-center gap-2 rounded-[8px] bg-[#2F221C] px-5 py-3 text-sm font-black !text-white shadow-sm transition hover:bg-[#6B4B3E]"
                >
                <span className="text-white">
                    Xem {totalItems} sản phẩm
                </span>
                <ArrowRight size={17} className="text-white" />
                </a>

              {shop.googleMapUrl && (
                <a
                  href={shop.googleMapUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center justify-center gap-2 rounded-[8px] bg-white px-5 py-3 text-sm font-black text-[#6B4B3E] ring-1 ring-[#EEE3D8]"
                >
                  <MapPin size={17} />
                  Chỉ đường
                </a>
              )}
            </div>
          </div>

          <div className="min-h-[280px] bg-[#F8F2EA] lg:min-h-full">
            {shop.coverUrl ? (
              <img
                src={shop.coverUrl}
                alt={shop.name}
                className="h-full w-full object-cover"
              />
            ) : shop.logoUrl ? (
              <img
                src={shop.logoUrl}
                alt={shop.name}
                className="h-full w-full object-contain p-12"
              />
            ) : (
              <div className="grid h-full min-h-[280px] place-items-center text-[#6B4B3E]">
                <Coffee size={90} />
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}