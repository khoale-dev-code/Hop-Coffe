import { useEffect, useState } from "react";
import { CalendarDays, Coffee, X } from "lucide-react";
import { cn, getPromotionMedia } from "./publicMenuUtils";

export default function PromotionModal({ promotion, onClose }) {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    setActiveIndex(0);
  }, [promotion?.id]);

  useEffect(() => {
    if (!promotion) return;

    const previousOverflow = document.body.style.overflow;

    function handleKeyDown(event) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [promotion, onClose]);

  if (!promotion) return null;

  const mediaList = getPromotionMedia(promotion);
  const activeMedia = mediaList[activeIndex] || mediaList[0];

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center bg-black/55 px-0 py-0 backdrop-blur-sm sm:grid sm:place-items-center sm:px-5 sm:py-6">
      <button
        type="button"
        onClick={onClose}
        className="absolute inset-0 cursor-default"
        aria-label="Đóng khuyến mãi"
      />

      <div className="relative z-10 max-h-[94vh] w-full overflow-hidden rounded-t-[16px] bg-white shadow-2xl sm:max-w-5xl sm:rounded-[10px]">
        <div className="sticky top-0 z-20 flex items-center justify-between border-b border-neutral-200 bg-white/95 px-4 py-3 backdrop-blur-xl sm:hidden">
          <div className="min-w-0">
            <p className="text-[10px] font-black uppercase tracking-[0.14em] text-[#7CAEB8]">
              Chi tiết khuyến mãi
            </p>

            <p className="line-clamp-1 text-sm font-black text-[#2F221C]">
              {promotion.title}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="ml-3 grid h-9 w-9 shrink-0 place-items-center rounded-[8px] bg-neutral-100 text-[#2F221C]"
            aria-label="Đóng"
          >
            <X size={19} />
          </button>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="absolute right-3 top-3 z-20 hidden h-10 w-10 place-items-center rounded-[6px] bg-white text-[#2F221C] shadow-md ring-1 ring-neutral-200 transition hover:bg-neutral-50 sm:grid"
          aria-label="Đóng"
        >
          <X size={20} />
        </button>

        <div className="max-h-[94vh] overflow-y-auto sm:max-h-[92vh]">
          <div className="grid lg:grid-cols-[1.05fr_0.95fr]">
            <div className="border-b border-neutral-200 bg-white p-3 sm:p-5 lg:border-b-0 lg:border-r lg:p-6">
              <div className="overflow-hidden rounded-[8px] border border-neutral-200 bg-white">
                <PromotionMediaFrame media={activeMedia} mode="modal" />
              </div>

              {mediaList.length > 1 && (
                <div className="hop-hide-scroll mt-3 flex gap-2 overflow-x-auto pb-1">
                  {mediaList.map((media, index) => (
                    <button
                      key={`${media.url}-${index}`}
                      type="button"
                      onClick={() => setActiveIndex(index)}
                      className={cn(
                        "h-14 w-20 shrink-0 overflow-hidden rounded-[6px] border bg-white transition sm:h-20 sm:w-28",
                        activeIndex === index
                          ? "border-[#6B4B3E] ring-2 ring-[#6B4B3E]/15"
                          : "border-neutral-200 hover:border-[#C9A58D]"
                      )}
                    >
                      <PromotionMediaFrame media={media} mode="thumb" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-white p-4 pb-6 sm:p-7">
              <div className="hidden sm:block">
                <p className="text-xs font-black uppercase tracking-[0.18em] text-[#7CAEB8]">
                  Chi tiết khuyến mãi
                </p>

                <h3 className="mt-3 pr-8 text-3xl font-black leading-tight tracking-tight text-[#2F221C]">
                  {promotion.title}
                </h3>
              </div>

              {promotion.subtitle && (
                <p className="mt-1 text-base font-bold leading-7 text-[#6B4B3E] sm:mt-3">
                  {promotion.subtitle}
                </p>
              )}

              {promotion.description && (
                <div className="mt-4 rounded-[8px] border border-neutral-200 bg-white p-4 sm:mt-5">
                  <p className="font-black text-[#2F221C]">Nội dung ưu đãi</p>

                  <p className="mt-2 whitespace-pre-line text-sm leading-7 text-[#73584D]">
                    {promotion.description}
                  </p>
                </div>
              )}

              {(promotion.startAt || promotion.endAt) && (
                <div className="mt-4 grid gap-3 sm:mt-5 sm:grid-cols-2">
                  {promotion.startAt && (
                    <InfoBox label="Bắt đầu" value={promotion.startAt} />
                  )}

                  {promotion.endAt && (
                    <InfoBox label="Kết thúc" value={promotion.endAt} />
                  )}
                </div>
              )}

              {promotion.terms && (
                <div className="mt-4 rounded-[8px] border border-neutral-200 bg-white p-4 sm:mt-5">
                  <p className="font-black text-[#2F221C]">
                    Điều kiện áp dụng
                  </p>

                  <p className="mt-2 whitespace-pre-line text-sm leading-7 text-[#73584D]">
                    {promotion.terms}
                  </p>
                </div>
              )}

              <button
                type="button"
                onClick={onClose}
                className="mt-6 w-full rounded-[8px] bg-[#2F221C] px-5 py-4 text-sm font-black uppercase tracking-[0.12em] text-white transition hover:bg-[#6B4B3E] sm:mt-7"
              >
                Đã hiểu
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function PromotionMediaFrame({ media, mode = "banner" }) {
  const wrapperClass =
    mode === "modal"
      ? "min-h-[230px] max-h-[64vh] sm:min-h-[360px] sm:max-h-[68vh]"
      : mode === "thumb"
        ? "h-full"
        : "min-h-[170px] max-h-[340px]";

  const mediaClass =
    mode === "thumb"
      ? "h-full w-full object-contain p-1"
      : mode === "modal"
        ? "max-h-[64vh] w-full object-contain p-3 sm:max-h-[68vh] sm:p-5"
        : "max-h-[340px] w-full object-contain p-2";

  if (!media) {
    return (
      <div
        className={cn(
          "grid place-items-center bg-white text-[#6B4B3E]",
          wrapperClass
        )}
      >
        <Coffee size={mode === "thumb" ? 24 : 48} />
      </div>
    );
  }

  if (media.type === "video") {
    return (
      <div className={cn("grid place-items-center bg-black", wrapperClass)}>
        <video
          src={media.url}
          controls={mode === "modal"}
          muted={mode !== "modal"}
          playsInline
          preload="metadata"
          className={
            mode === "thumb"
              ? "h-full w-full object-cover"
              : "max-h-[64vh] w-full object-contain sm:max-h-[68vh]"
          }
        />
      </div>
    );
  }

  return (
    <div className={cn("grid place-items-center bg-white", wrapperClass)}>
      <img
        src={media.url}
        alt={media.name || "Khuyến mãi"}
        loading="eager"
        className={mediaClass}
      />
    </div>
  );
}

function InfoBox({ label, value }) {
  return (
    <div className="rounded-[8px] border border-neutral-200 bg-white p-4">
      <div className="flex items-center gap-2 text-[#7CAEB8]">
        <CalendarDays size={16} />

        <p className="text-xs font-black uppercase tracking-[0.14em]">
          {label}
        </p>
      </div>

      <p className="mt-2 font-black text-[#2F221C]">{value}</p>
    </div>
  );
}