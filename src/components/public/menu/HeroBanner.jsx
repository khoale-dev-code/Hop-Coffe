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
                  className="inline-flex items-center justify-center gap-2 rounded-[8px] bg-white px-5 py-3 text-sm font-black text-[#6B4B3E] ring-1 ring-[#EEE3D8] transition hover:bg-neutral-50"
                >
                  <MapPin size={17} />
                  Chỉ đường
                </a>
              )}
            </div>
          </div>

          {/* KHU VỰC HIỂN THỊ HÌNH ẢNH (ĐÃ CẢI THIỆN UI) */}
          <div className="group relative min-h-[280px] w-full overflow-hidden bg-[#F8F2EA] lg:min-h-full">
            {shop.coverUrl ? (
              <>
                <img
                  src={shop.coverUrl}
                  alt={shop.name}
                  className="h-full w-full object-cover object-center transition-transform duration-1000 ease-out group-hover:scale-105"
                />
                {/* Lớp phủ gradient tạo khối ánh sáng và hiệu ứng cinematic */}
                <div className="absolute inset-0 bg-gradient-to-tr from-[#2F221C]/60 via-transparent to-transparent opacity-80 mix-blend-multiply transition-opacity duration-500 group-hover:opacity-60" />
              </>
            ) : shop.logoUrl ? (
              <>
                {/* Nền mờ ảo (Glassmorphism/Blur) từ chính logo để lấp đầy không gian */}
                <img
                  src={shop.logoUrl}
                  alt="Background Blur"
                  className="absolute inset-0 h-full w-full object-cover opacity-30 blur-3xl saturate-150 transition-transform duration-1000 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-[#F8F2EA]/40 backdrop-blur-sm" />
                
                {/* Logo chính giữa với bóng đổ mạnh tạo khối 3D */}
                <div className="absolute inset-0 flex items-center justify-center p-8">
                  <img
                    src={shop.logoUrl}
                    alt={shop.name}
                    className="h-48 w-48 object-contain drop-shadow-2xl transition-transform duration-700 ease-out group-hover:scale-105"
                  />
                </div>
              </>
            ) : (
              <div className="grid h-full min-h-[280px] place-items-center text-[#6B4B3E]/30 bg-gradient-to-br from-[#F8F2EA] to-[#EEE3D8]">
                <Coffee size={90} className="transition-transform duration-700 group-hover:scale-110 group-hover:text-[#6B4B3E]/50" />
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}