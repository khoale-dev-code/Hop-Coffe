import { ArrowRight, Coffee } from "lucide-react";
import { getPromotionMedia } from "./publicMenuUtils";

export default function PromotionStrip({ promotions, onOpenPromotion }) {
  if (!promotions || promotions.length === 0) return null;

  return (
    <section
      id="promotions"
      className="mx-auto max-w-7xl bg-white px-4 py-6 sm:px-6 lg:px-8"
    >
      <div className="mb-5 flex flex-col gap-2 border-b border-neutral-200 pb-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-black uppercase tracking-[0.18em] text-[#7CAEB8]">
            Khuyến mãi
          </p>

          <h2 className="mt-1 text-2xl font-black tracking-tight text-[#2F221C] sm:text-3xl">
            Ưu đãi đang diễn ra
          </h2>

          <p className="mt-2 max-w-xl text-sm font-medium leading-6 text-[#73584D]">
            Các chương trình ưu đãi mới nhất của quán.
          </p>
        </div>
      </div>

      <div className="hop-hide-scroll flex gap-3 overflow-x-auto pb-3 sm:gap-4">
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
      style={{ animationDelay: `${Math.min(index, 8) * 42}ms` }}
      className="hop-reveal group w-[86vw] max-w-[360px] shrink-0 overflow-hidden rounded-[8px] border border-neutral-200 bg-white text-left shadow-sm transition duration-300 hover:-translate-y-0.5 hover:border-[#C9A58D] hover:shadow-[0_16px_36px_rgba(47,34,28,0.10)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7CAEB8] sm:w-[430px] sm:max-w-none lg:w-[460px]"
    >
      <div className="relative border-b border-neutral-100 bg-white">
        <div className="grid aspect-[16/9] min-h-[145px] place-items-center overflow-hidden bg-white sm:min-h-[210px]">
          {hasVideo ? (
            <video
              src={firstMedia.url}
              muted
              playsInline
              preload="metadata"
              className="h-full w-full object-contain p-2"
            />
          ) : firstMedia?.url ? (
            <img
              src={firstMedia.url}
              alt={promotion.title}
              loading="lazy"
              className="h-full w-full object-contain p-2 transition duration-500 group-hover:scale-[1.03]"
            />
          ) : (
            <div className="grid h-full w-full place-items-center bg-neutral-50 text-[#6B4B3E]">
              <Coffee size={42} />
            </div>
          )}
        </div>

        <div className="absolute left-2 top-2 flex flex-wrap gap-1.5 sm:left-3 sm:top-3">
          <span className="rounded-[4px] bg-[#B22830] px-2 py-1 text-[9px] font-black uppercase tracking-[0.08em] text-white shadow-sm sm:px-2.5 sm:text-[10px]">
            Ưu đãi
          </span>

          {hasVideo && (
            <span className="rounded-[4px] bg-white/95 px-2 py-1 text-[9px] font-black uppercase tracking-[0.08em] text-[#2F221C] shadow-sm ring-1 ring-neutral-200 sm:px-2.5 sm:text-[10px]">
              Video
            </span>
          )}
        </div>

        {mediaCount > 1 && (
          <span className="absolute bottom-2 right-2 rounded-[4px] bg-white/95 px-2 py-1 text-[9px] font-black text-[#6B4B3E] shadow-sm ring-1 ring-neutral-200 sm:bottom-3 sm:right-3 sm:px-2.5 sm:text-[10px]">
            {mediaCount} media
          </span>
        )}
      </div>

      <div className="p-3.5 sm:p-5">
        {promotion.subtitle && (
          <p className="line-clamp-1 text-[10px] font-black uppercase tracking-[0.14em] text-[#7CAEB8] sm:text-[11px]">
            {promotion.subtitle}
          </p>
        )}

        <h3 className="mt-1 line-clamp-2 text-base font-black leading-snug text-[#2F221C] sm:text-xl">
          {promotion.title}
        </h3>

        {promotion.description && (
          <p className="mt-2 line-clamp-2 text-sm font-medium leading-6 text-[#73584D]">
            {promotion.description}
          </p>
        )}

        <div className="mt-4 flex items-center justify-between gap-3">
          <span className="hidden text-xs font-black uppercase tracking-[0.12em] text-neutral-400 min-[430px]:inline">
            Bấm để xem chi tiết
          </span>

          <span className="inline-flex w-full items-center justify-center gap-2 rounded-[6px] border border-[#2F221C] bg-white px-3.5 py-2.5 text-xs font-black uppercase tracking-[0.08em] text-[#2F221C] transition group-hover:bg-[#2F221C] group-hover:text-white min-[430px]:w-auto min-[430px]:py-2">
            {promotion.buttonText || "Xem chi tiết"}
            <ArrowRight size={15} />
          </span>
        </div>
      </div>
    </button>
  );
}