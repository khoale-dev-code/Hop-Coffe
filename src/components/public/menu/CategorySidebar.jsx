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

  // Ghi chiều cao thực vào CSS var để MenuToolbar tính top offset
  useEffect(() => {
    const el = stickyRef.current;
    if (!el) return;
    const update = () =>
      document.documentElement.style.setProperty(
        "--category-bar-h",
        `${el.offsetHeight}px`
      );
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Scroll pill active vào giữa khi activeCategory thay đổi,
  // KHÔNG để browser tự scroll (tránh giật trang).
  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;
    const active = container.querySelector('[data-active="true"]');
    if (!active) return;
    // scrollIntoView chỉ trong container, không ảnh hưởng window
    const containerRect = container.getBoundingClientRect();
    const activeRect = active.getBoundingClientRect();
    const offset =
      activeRect.left -
      containerRect.left -
      containerRect.width / 2 +
      activeRect.width / 2;
    container.scrollBy({ left: offset, behavior: "smooth" });
  }, [activeCategory]);

  const categoryItems = [
    { id: "all", name: "Tất cả", count: totalItems },
    ...categories.map((cat) => ({
      id: cat.id,
      name: cat.name,
      count: countMap[cat.id] || 0,
    })),
  ];

  return (
    <>
      {/* ── Mobile: sticky horizontal scroll bar ── */}
      {/*
        Dùng <div> thay <section> để tránh tạo thêm block context
        làm layout shift khi re-render.
      */}
      <div className="lg:hidden">
        <div
          ref={stickyRef}
          className="sticky top-[64px] z-30 -mx-3 border-b border-neutral-200 bg-white/95 backdrop-blur-md sm:-mx-6"
        >
          {/* Header row */}
          <div className="flex items-center justify-between gap-2 px-3 pb-2 pt-3 sm:px-6">
            <div className="flex min-w-0 items-center gap-2">
              <div className="grid h-7 w-7 shrink-0 place-items-center rounded-lg border border-neutral-200 bg-white text-[#6B4B3E] shadow-sm">
                <Coffee size={14} aria-hidden="true" />
              </div>
              <p className="text-xs font-bold text-[#2F221C]">Danh mục</p>
            </div>
            <span className="shrink-0 rounded-full bg-[#2F221C] px-2.5 py-1 text-[10px] font-bold text-white">
              {totalItems} món
            </span>
          </div>

          {/* Pill scroll row */}
          <div className="relative">
            <div
              ref={scrollRef}
              // KHÔNG dùng role="tablist" ở đây vì nó khiến Safari
              // tự scroll aria-selected element vào view (gây giật trang).
              // Accessibility vẫn ổn vì mỗi button có aria-pressed.
              className="hop-hide-scroll flex snap-x snap-mandatory gap-2 overflow-x-auto px-3 pb-3 sm:px-6"
              aria-label="Lọc theo danh mục"
            >
              {categoryItems.map((cat) => (
                <MobilePill
                  key={cat.id}
                  label={cat.name}
                  count={cat.count}
                  active={activeCategory === cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                />
              ))}
              <span className="shrink-0 select-none opacity-0" aria-hidden="true">
                .
              </span>
            </div>
            <div className="pointer-events-none absolute inset-y-0 right-0 w-10 bg-gradient-to-r from-transparent to-white/90" />
          </div>
        </div>
      </div>

      {/* ── Desktop: sticky left sidebar ── */}
      <aside className="hidden lg:block">
        <div className="sticky top-24 overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm">
          <div className="flex items-center gap-3 border-b border-neutral-200 px-4 py-4">
            <div className="grid h-9 w-9 shrink-0 place-items-center rounded-[10px] border border-neutral-200 bg-neutral-50 text-[#6B4B3E]">
              <Coffee size={18} aria-hidden="true" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-bold leading-5 text-[#2F221C]">Danh mục</p>
              <p className="mt-0.5 text-[11px] font-medium text-[#73584D]">
                Lọc theo nhóm sản phẩm
              </p>
            </div>
          </div>
          <nav
            className="max-h-[calc(100dvh-200px)] space-y-1 overflow-y-auto p-2"
            aria-label="Danh mục sản phẩm"
          >
            {categoryItems.map((cat) => (
              <DesktopButton
                key={cat.id}
                label={cat.name}
                count={cat.count}
                active={activeCategory === cat.id}
                onClick={() => setActiveCategory(cat.id)}
              />
            ))}
          </nav>
        </div>
      </aside>
    </>
  );
}

/* ─────────────────────────────────────────
   Mobile pill chip
───────────────────────────────────────── */
function MobilePill({ label, count, active, onClick }) {
  return (
    <button
      type="button"
      // aria-pressed thay vì role="tab" + aria-selected
      // → không trigger auto-scroll của browser
      aria-pressed={active}
      data-active={active}
      onClick={onClick}
      className={cn(
        "inline-flex shrink-0 snap-start items-center gap-1.5 rounded-full border",
        "px-3 py-1.5 text-xs font-bold transition-all duration-150 active:scale-[0.97]",
        active
          ? "border-[#2F221C] bg-[#2F221C] text-white shadow-sm"
          : "border-neutral-200 bg-white text-[#6B4B3E] shadow-sm hover:border-[#C9A58D] hover:bg-[#FAF6F3]"
      )}
    >
      <span className="max-w-[120px] truncate sm:max-w-[160px]">{label}</span>
      <span
        className={cn(
          "rounded-full px-1.5 py-0.5 text-[10px] font-bold",
          active ? "bg-white/20 text-white" : "bg-neutral-100 text-[#73584D]"
        )}
      >
        {count}
      </span>
    </button>
  );
}

/* ─────────────────────────────────────────
   Desktop sidebar button
───────────────────────────────────────── */
function DesktopButton({ label, count, active, onClick }) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={cn(
        "group flex min-h-[40px] w-full items-center justify-between gap-2 rounded-[10px] border",
        "px-3 py-2 text-left text-sm font-bold transition-all duration-150",
        active
          ? "border-[#2F221C] bg-[#2F221C] text-white"
          : "border-transparent bg-transparent text-[#6B4B3E] hover:border-neutral-200 hover:bg-[#FAF6F3]"
      )}
    >
      <span className="line-clamp-1 min-w-0">{label}</span>
      <span
        className={cn(
          "shrink-0 rounded-full px-2 py-0.5 text-[11px] font-bold",
          active ? "bg-white/20 text-white" : "bg-neutral-100 text-[#73584D]"
        )}
      >
        {count}
      </span>
    </button>
  );
}   