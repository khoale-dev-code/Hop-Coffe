"use client";

import { useEffect, useState, useRef } from "react";
import { CalendarDays, Coffee, X, ChevronLeft, ChevronRight } from "lucide-react";
import { cn, getPromotionMedia } from "./publicMenuUtils";

export default function PromotionModal({ promotion, onClose }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollRef = useRef(null);

  useEffect(() => {
    setActiveIndex(0);
  }, [promotion?.id]);

  useEffect(() => {
    if (!promotion) return;
    const previousOverflow = document.body.style.overflow;
    
    function handleKeyDown(event) {
      if (event.key === "Escape") onClose();
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

  // Xử lý đồng bộ khi vuốt ngang
  const handleScroll = (e) => {
    const container = e.target;
    const scrollPosition = container.scrollLeft;
    const slideWidth = container.clientWidth;
    const newIndex = Math.round(scrollPosition / slideWidth);

    if (newIndex !== activeIndex) {
      setActiveIndex(newIndex);
    }
  };

  // Cuộn đến ảnh cụ thể (dành cho nút bấm)
  const scrollToSlide = (index) => {
    setActiveIndex(index);
    if (scrollRef.current) {
      const slideWidth = scrollRef.current.clientWidth;
      scrollRef.current.scrollTo({
        left: slideWidth * index,
        behavior: "smooth",
      });
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex justify-end bg-black/50 backdrop-blur-sm transition-all animate-in fade-in duration-300">
      {/* Vùng nền bên ngoài: Bấm để đóng */}
      <button
        type="button"
        onClick={onClose}
        className="absolute inset-0 w-full cursor-default"
        aria-label="Đóng khuyến mãi"
      />

      {/* CONTAINER CHÍNH: 
        Mobile: Kéo từ dưới lên (Bottom Sheet), bo tròn cạnh trên.
        Desktop: Kéo từ phải sang (Side Drawer), chiếm 480px chiều rộng.
      */}
      <div className="relative z-10 flex h-[92dvh] w-full flex-col self-end overflow-hidden rounded-t-[24px] bg-[#FDFDFD] shadow-2xl animate-in slide-in-from-bottom-full duration-400 ease-out sm:h-[100dvh] sm:w-[480px] sm:rounded-none sm:slide-in-from-right-full">
        
        {/* NÚT ĐÓNG LƠ LỬNG GÓC TRÊN CÙNG */}
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 z-50 grid h-9 w-9 place-items-center rounded-full bg-black/40 text-white backdrop-blur-md transition-all hover:bg-black/60 hover:scale-105 active:scale-95"
          aria-label="Đóng"
        >
          <X size={18} strokeWidth={2.5} />
        </button>

        {/* 1. KHU VỰC MEDIA (TRÀN VIỀN KÉO VUỐT) */}
        <div className="relative w-full shrink-0 bg-neutral-100 sm:h-[45vh]">
          <div
            ref={scrollRef}
            onScroll={handleScroll}
            className="flex w-full snap-x snap-mandatory overflow-x-auto scroll-smooth [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            {mediaList.map((media, index) => (
              <div key={`${media.url}-${index}`} className="w-full shrink-0 snap-center">
                <PromotionMediaFrame 
                  media={media} 
                  isActive={activeIndex === index} 
                />
              </div>
            ))}
          </div>

          {/* Dấu chấm điều hướng (Dot Indicators) thay cho Thumbnails */}
          {mediaList.length > 1 && (
            <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-1.5 px-4 z-20">
              {mediaList.map((_, index) => (
                <button
                  key={index}
                  onClick={() => scrollToSlide(index)}
                  className={cn(
                    "h-1.5 rounded-full transition-all duration-300",
                    activeIndex === index 
                      ? "w-6 bg-white shadow-sm" 
                      : "w-1.5 bg-white/50 hover:bg-white/80"
                  )}
                  aria-label={`Chuyển đến ảnh ${index + 1}`}
                />
              ))}
            </div>
          )}

          {/* Nút điều hướng Trái/Phải (Chỉ hiện trên Desktop khi hover) */}
          {mediaList.length > 1 && (
            <div className="absolute inset-y-0 left-0 right-0 hidden items-center justify-between px-3 pointer-events-none opacity-0 transition-opacity duration-300 hover:opacity-100 sm:flex">
              <button
                onClick={() => scrollToSlide(Math.max(0, activeIndex - 1))}
                disabled={activeIndex === 0}
                className="pointer-events-auto grid h-8 w-8 place-items-center rounded-full bg-white/80 text-black shadow-sm backdrop-blur transition hover:bg-white hover:scale-105 disabled:opacity-0"
              >
                <ChevronLeft size={18} />
              </button>
              <button
                onClick={() => scrollToSlide(Math.min(mediaList.length - 1, activeIndex + 1))}
                disabled={activeIndex === mediaList.length - 1}
                className="pointer-events-auto grid h-8 w-8 place-items-center rounded-full bg-white/80 text-black shadow-sm backdrop-blur transition hover:bg-white hover:scale-105 disabled:opacity-0"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          )}
        </div>

        {/* 2. KHU VỰC NỘI DUNG (CUỘN DỌC) */}
        <div className="relative flex-1 overflow-y-auto px-5 py-6 sm:px-8 sm:py-8 [scrollbar-width:thin]">
          {/* Nhãn tag nổi */}
          {promotion.subtitle ? (
            <span className="inline-block rounded-full bg-neutral-100 px-3 py-1 text-[11px] font-black uppercase tracking-[0.14em] text-[#6B4B3E]">
              {promotion.subtitle}
            </span>
          ) : (
            <span className="inline-block rounded-full bg-[#E8F0F2] px-3 py-1 text-[11px] font-black uppercase tracking-[0.14em] text-[#4E8791]">
              Khuyến mãi
            </span>
          )}

          <h2 className="mt-4 text-2xl font-black leading-[1.3] tracking-tight text-[#2F221C] sm:text-3xl">
            {promotion.title}
          </h2>

          {(promotion.startAt || promotion.endAt) && (
            <div className="mt-5 flex flex-wrap gap-3">
              {promotion.startAt && (
                <InfoBadge label="Từ" value={promotion.startAt} />
              )}
              {promotion.endAt && (
                <InfoBadge label="Đến" value={promotion.endAt} />
              )}
            </div>
          )}

          {promotion.description && (
            <div className="mt-6 border-t border-neutral-100 pt-6">
              <p className="font-black text-[#2F221C]">Nội dung ưu đãi</p>
              <p className="mt-2 whitespace-pre-line text-[15px] leading-relaxed text-[#5A463E]">
                {promotion.description}
              </p>
            </div>
          )}

          {promotion.terms && (
            <div className="mt-6 rounded-[12px] bg-neutral-50 p-4">
              <p className="font-black text-[#2F221C]">Điều kiện áp dụng</p>
              <p className="mt-1.5 whitespace-pre-line text-[13px] leading-relaxed text-[#73584D]">
                {promotion.terms}
              </p>
            </div>
          )}
        </div>

        {/* 3. KHU VỰC NÚT BẤM (Ghim cố định ở đáy) */}
        <div className="shrink-0 border-t border-neutral-100 bg-white p-4 pb-[max(env(safe-area-inset-bottom),1rem)] shadow-[0_-4px_20px_rgba(0,0,0,0.03)] sm:px-8">
          <button
            type="button"
            onClick={onClose}
            className="flex w-full items-center justify-center rounded-[12px] bg-[#2F221C] px-5 py-4 text-[15px] font-black uppercase tracking-[0.12em] text-white transition-all hover:bg-[#4A372D] active:scale-[0.98]"
          >
            Tôi đã hiểu
          </button>
        </div>
        
      </div>
    </div>
  );
}

// Tối ưu lại Media Frame tràn viền
function PromotionMediaFrame({ media, isActive = false }) {
  if (!media) {
    return (
      <div className="flex aspect-square sm:aspect-auto sm:h-[45vh] w-full flex-col items-center justify-center bg-neutral-100 text-[#C9A58D]">
        <Coffee size={40} strokeWidth={1.5} />
        <span className="mt-3 text-xs font-bold uppercase tracking-widest opacity-60">No Media</span>
      </div>
    );
  }

  if (media.type === "video") {
    return (
      <div className="relative aspect-square sm:aspect-auto sm:h-[45vh] w-full bg-black">
        <video
          src={media.url}
          controls
          muted={false}
          autoPlay={isActive}
          playsInline
          preload="metadata"
          className="h-full w-full object-cover"
        />
      </div>
    );
  }

  return (
    <div className="relative aspect-square sm:aspect-auto sm:h-[45vh] w-full bg-white">
      <img
        src={media.url}
        alt={media.name || "Banner"}
        loading="eager"
        className="h-full w-full object-cover"
      />
      {/* Lớp gradient mờ ở đáy ảnh để làm nổi bật dấu chấm phân trang */}
      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-black/50 to-transparent pointer-events-none" />
    </div>
  );
}

function InfoBadge({ label, value }) {
  return (
    <div className="flex items-center gap-2 rounded-full border border-neutral-200 bg-white px-3.5 py-1.5 shadow-sm">
      <CalendarDays size={14} className="text-[#C9A58D]" />
      <p className="text-[12px] font-medium text-[#2F221C]">
        <span className="font-bold mr-1 text-[#7CAEB8]">{label}:</span> 
        {value}
      </p>
    </div>
  );
}