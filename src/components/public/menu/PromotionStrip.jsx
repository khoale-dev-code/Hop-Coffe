import { ArrowRight, Coffee, PlayCircle } from "lucide-react";
import { getPromotionMedia } from "./publicMenuUtils";

export default function PromotionStrip({ promotions, onOpenPromotion }) {
  if (!promotions || promotions.length === 0) return null;

  return (
    <section
      id="promotions"
      className="mx-auto max-w-7xl bg-white px-4 py-8 sm:px-6 lg:px-8"
    >
      {/* Header Section */}
      <div className="mb-6 flex flex-col gap-2 border-b border-neutral-100 pb-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.18em] text-[#7CAEB8]">
            Khuyến mãi
          </p>
          <h2 className="mt-1.5 text-2xl font-black tracking-tight text-[#2F221C] sm:text-3xl">
            Ưu đãi đang diễn ra
          </h2>
          <p className="mt-2 max-w-xl text-[15px] font-medium leading-relaxed text-[#73584D]">
            Khám phá ngay các chương trình ưu đãi mới nhất từ quán.
          </p>
        </div>
      </div>

      {/* Horizontal Scroll Container:
        - Thêm -mx-4 px-4 trên mobile để list có thể cuộn sát mép màn hình nhưng vẫn giữ padding.
        - snap-x snap-mandatory: Tạo hiệu ứng "hút" từng thẻ khi vuốt.
      */}
      <div className="relative -mx-4 px-4 sm:mx-0 sm:px-0">
        <div className="flex snap-x snap-mandatory gap-4 overflow-x-auto pb-6 pt-2 scroll-smooth [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:gap-6">
          {promotions.map((promotion, index) => {
            const mediaList = getPromotionMedia(promotion);
            const firstMedia = mediaList[0];
            const hasVideo = firstMedia?.type === "video" && firstMedia?.url;

            return (
              <PromotionCard
                key={promotion.id}
                promotion={promotion}
                firstMedia={firstMedia}
                mediaCount={mediaList.length}
                hasVideo={hasVideo}
                index={index}
                onOpen={() => onOpenPromotion(promotion)}
              />
            );
          })}
          
          {/* Spacer để thẻ cuối cùng không dính sát mép phải */}
          <div className="w-1 shrink-0 sm:hidden" aria-hidden="true" />
        </div>
      </div>
    </section>
  );
}

function PromotionCard({
  promotion,
  firstMedia,
  mediaCount,
  hasVideo,
  index,
  onOpen,
}) {
  return (
    <button
      type="button"
      onClick={onOpen}
      style={{ animationDelay: `${Math.min(index, 8) * 50}ms` }}
      // Thêm snap-start. Đổi bo góc thành 16px. Tối ưu Shadow mềm mại hơn.
      className="group hop-reveal relative flex w-[85vw] max-w-[340px] shrink-0 snap-start scroll-ml-4 flex-col overflow-hidden rounded-[16px] border border-neutral-100 bg-white text-left shadow-[0_8px_24px_rgba(47,34,28,0.04)] transition-all duration-300 hover:-translate-y-1 hover:border-[#C9A58D] hover:shadow-[0_16px_40px_rgba(47,34,28,0.08)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7CAEB8] sm:w-[420px] sm:max-w-none sm:scroll-ml-0"
    >
      {/* Media Box: 
        - aspect-[4/3] cho mobile để ảnh bớt bị lùn, sm:aspect-[16/9] cho desktop.
      */}
      <div className="relative aspect-[4/3] w-full shrink-0 overflow-hidden border-b border-neutral-100 bg-neutral-50/80 sm:aspect-[16/9]">
        {hasVideo ? (
          <>
            <video
              src={firstMedia.url}
              muted
              playsInline
              preload="metadata"
              className="h-full w-full object-contain p-2 transition-transform duration-500 group-hover:scale-[1.02]"
            />
            {/* Thêm Icon Play nổi bật ở giữa video */}
            <div className="absolute inset-0 grid place-items-center bg-black/5 transition-colors group-hover:bg-transparent">
              <div className="grid h-12 w-12 place-items-center rounded-full bg-white/90 text-[#2F221C] shadow-md backdrop-blur-sm transition-transform group-hover:scale-110">
                <PlayCircle size={24} className="ml-1" fill="currentColor" />
              </div>
            </div>
          </>
        ) : firstMedia?.url ? (
          <img
            src={firstMedia.url}
            alt={promotion.title}
            loading="lazy"
            className="h-full w-full object-contain p-2 transition-transform duration-700 group-hover:scale-[1.05]"
          />
        ) : (
          <div className="grid h-full w-full place-items-center bg-neutral-50 text-[#C9A58D]">
            <Coffee size={40} strokeWidth={1.5} />
          </div>
        )}

        {/* Badges */}
        <div className="absolute left-3 top-3 flex flex-wrap gap-1.5 sm:left-4 sm:top-4">
          <span className="rounded-[6px] bg-[#B22830] px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.08em] text-white shadow-sm">
            Ưu đãi
          </span>
        </div>

        {mediaCount > 1 && (
          <span className="absolute bottom-3 right-3 rounded-[6px] bg-white/95 px-2.5 py-1 text-[10px] font-black text-[#6B4B3E] shadow-sm backdrop-blur-md ring-1 ring-neutral-200/50">
            {mediaCount} media
          </span>
        )}
      </div>

      {/* Content Box */}
      <div className="flex flex-1 flex-col p-4 sm:p-5 sm:pb-6">
        {promotion.subtitle && (
          <p className="line-clamp-1 text-[11px] font-black uppercase tracking-[0.14em] text-[#7CAEB8]">
            {promotion.subtitle}
          </p>
        )}

        <h3 className="mt-1.5 line-clamp-2 text-[17px] font-black leading-snug text-[#2F221C] sm:text-xl">
          {promotion.title}
        </h3>

        {promotion.description && (
          <p className="mt-2 line-clamp-2 text-[13px] font-medium leading-relaxed text-[#73584D] sm:text-sm">
            {promotion.description}
          </p>
        )}

        {/* Căn CTA luôn nằm ở dưới cùng (mt-auto) để các card có chiều cao bằng nhau nếu text ngắn dài khác nhau */}
        <div className="mt-auto pt-5">
          <div className="flex items-center justify-between gap-3">
            <span className="hidden text-[11px] font-black uppercase tracking-[0.12em] text-[#A3A3A3] transition-colors group-hover:text-[#C9A58D] min-[430px]:inline">
              Bấm để xem chi tiết
            </span>

            {/* Micro-interaction: Mũi tên dịch chuyển nhẹ khi hover card */}
            <span className="inline-flex w-full items-center justify-center gap-2 rounded-[8px] border border-[#2F221C] bg-white px-4 py-2.5 text-[11px] font-black uppercase tracking-[0.08em] text-[#2F221C] shadow-sm transition-all duration-300 group-hover:bg-[#2F221C] group-hover:text-white group-active:scale-95 min-[430px]:w-auto sm:text-xs">
              {promotion.buttonText || "Xem ngay"}
              <ArrowRight size={16} className="transition-transform duration-300 group-hover:translate-x-1" />
            </span>
          </div>
        </div>
      </div>
    </button>
  );
}