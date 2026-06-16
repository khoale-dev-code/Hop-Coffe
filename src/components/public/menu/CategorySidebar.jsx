"use client";

import { Coffee } from "lucide-react";
import { useEffect, useRef } from "react";
import { cn } from "./publicMenuUtils";

export default function CategorySidebar({
  categories = [],
  activeCategory,
  setActiveCategory,
  countMap = {},
  totalItems = 0,
}) {
  const stickyRef = useRef(null);
  const scrollRef = useRef(null);

  useEffect(() => {
    const element = stickyRef.current;
    if (!element) return;

    function updateHeight() {
      document.documentElement.style.setProperty(
        "--category-bar-h",
        `${element.offsetHeight}px`
      );
    }

    updateHeight();

    if (typeof ResizeObserver === "undefined") return;

    const resizeObserver = new ResizeObserver(updateHeight);
    resizeObserver.observe(element);

    return () => resizeObserver.disconnect();
  }, []);

  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;

    const activeButton = container.querySelector('[data-active="true"]');
    if (!activeButton) return;

    const scrollTarget =
      activeButton.offsetLeft -
      container.clientWidth / 2 +
      activeButton.clientWidth / 2;

    container.scrollTo({
      left: scrollTarget,
      behavior: "smooth",
    });
  }, [activeCategory]);

  const categoryItems = [
    {
      id: "all",
      name: "Tất cả",
      count: totalItems,
    },
    ...categories.map((category) => ({
      id: category.id,
      name: category.name,
      count: countMap[category.id] || 0,
    })),
  ];

  return (
    <>
      {/* MOBILE VIEW */}
      {/* 1. Gộp lg:hidden vào chung thẻ sticky để tối ưu hiệu suất cuộn.
        2. Thêm max-w-full, min-w-0 và overflow-hidden để chốt chặt chiều ngang, chống lỗi phình to đẩy chữ ra khỏi màn hình.
      */}
      <div
        ref={stickyRef}
        className="sticky top-[64px] z-30 lg:hidden w-full max-w-full min-w-0 overflow-hidden border-b border-neutral-200 bg-white/95 backdrop-blur-xl"
      >
        <div className="flex w-full items-center justify-between gap-2 px-4 pb-2 pt-3">
          <div className="flex min-w-0 items-center gap-2">
            <div className="grid h-7 w-7 shrink-0 place-items-center rounded-[8px] border border-neutral-200 bg-white text-[#6B4B3E] shadow-sm">
              <Coffee size={14} aria-hidden="true" />
            </div>

            <div className="min-w-0">
              <p className="text-xs font-black leading-4 text-[#2F221C]">
                Danh mục
              </p>
              <p className="text-[10px] font-semibold leading-4 text-[#73584D]">
                Vuốt để xem thêm
              </p>
            </div>
          </div>

          <span className="shrink-0 rounded-full bg-[#2F221C] px-2.5 py-1 text-[10px] font-black text-white">
            {totalItems} món
          </span>
        </div>

        <div className="relative w-full max-w-full min-w-0">
          <div
            ref={scrollRef}
            className="relative flex w-full max-w-full min-w-0 gap-2 overflow-x-auto scroll-smooth px-4 pb-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            style={{ touchAction: "pan-x" }}
            aria-label="Lọc theo danh mục"
          >
            {categoryItems.map((category) => (
              <MobilePill
                key={category.id}
                label={category.name}
                count={category.count}
                active={activeCategory === category.id}
                onClick={() => setActiveCategory(category.id)}
              />
            ))}
            
            <div className="w-1 shrink-0" aria-hidden="true" />
          </div>

          <div className="pointer-events-none absolute inset-y-0 left-0 w-4 bg-gradient-to-r from-white/95 to-transparent" />
          <div className="pointer-events-none absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-white/95 to-transparent" />
        </div>
      </div>

      {/* DESKTOP VIEW */}
      <aside className="hidden lg:block">
        <div className="sticky top-24 overflow-hidden rounded-[14px] border border-neutral-200 bg-white shadow-sm">
          <div className="flex items-center gap-3 border-b border-neutral-200 px-4 py-4">
            <div className="grid h-9 w-9 shrink-0 place-items-center rounded-[10px] border border-neutral-200 bg-neutral-50 text-[#6B4B3E]">
              <Coffee size={18} aria-hidden="true" />
            </div>

            <div className="min-w-0">
              <p className="text-sm font-black leading-5 text-[#2F221C]">
                Danh mục
              </p>
              <p className="mt-0.5 text-[11px] font-medium text-[#73584D]">
                Lọc theo nhóm sản phẩm
              </p>
            </div>
          </div>

          <nav
            className="max-h-[calc(100dvh-200px)] space-y-1 overflow-y-auto p-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            aria-label="Danh mục sản phẩm"
          >
            {categoryItems.map((category) => (
              <DesktopButton
                key={category.id}
                label={category.name}
                count={category.count}
                active={activeCategory === category.id}
                onClick={() => setActiveCategory(category.id)}
              />
            ))}
          </nav>
        </div>
      </aside>
    </>
  );
}

function MobilePill({ label, count, active, onClick }) {
  return (
    <button
      type="button"
      aria-pressed={active}
      data-active={active ? "true" : "false"}
      onClick={onClick}
      className={cn(
        "inline-flex min-h-9 shrink-0 whitespace-nowrap touch-manipulation select-none items-center gap-1.5 rounded-full border",
        "px-3 py-1.5 text-xs font-black transition-all duration-150 active:scale-[0.97]",
        active
          ? "border-[#2F221C] bg-[#2F221C] text-white shadow-sm"
          : "border-neutral-200 bg-white text-[#6B4B3E] shadow-sm hover:border-[#C9A58D] hover:bg-[#FAF6F3]"
      )}
    >
      <span>{label}</span>

      <span
        className={cn(
          "rounded-full px-1.5 py-0.5 text-[10px] font-black",
          active ? "bg-white/20 text-white" : "bg-neutral-100 text-[#73584D]"
        )}
      >
        {count}
      </span>
    </button>
  );
}

function DesktopButton({ label, count, active, onClick }) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={cn(
        "group flex min-h-[40px] w-full items-center justify-between gap-2 rounded-[10px] border",
        "px-3 py-2 text-left text-sm font-black transition-all duration-150",
        active
          ? "border-[#2F221C] bg-[#2F221C] text-white"
          : "border-transparent bg-transparent text-[#6B4B3E] hover:border-neutral-200 hover:bg-[#FAF6F3]"
      )}
    >
      <span className="line-clamp-1 min-w-0">{label}</span>

      <span
        className={cn(
          "shrink-0 rounded-full px-2 py-0.5 text-[11px] font-black",
          active ? "bg-white/20 text-white" : "bg-neutral-100 text-[#73584D]"
        )}
      >
        {count}
      </span>
    </button>
  );
}