import { Search, SlidersHorizontal, X, ChevronDown } from "lucide-react";
import { cn } from "./publicMenuUtils";

const SORT_OPTIONS = [
  { value: "default",    label: "Mặc định" },
  { value: "name-asc",   label: "Tên A → Z" },
  { value: "name-desc",  label: "Tên Z → A" },
  { value: "price-asc",  label: "Giá tăng dần" },
  { value: "price-desc", label: "Giá giảm dần" },
  { value: "featured",   label: "Món nổi bật" },
];

/**
 * MenuToolbar
 *
 * Trên mobile: sticky ngay bên dưới CategorySidebar.
 * CategorySidebar ghi chiều cao thực của nó vào CSS var --category-bar-h
 * bằng ResizeObserver. MenuToolbar đọc var đó để tính top offset.
 *
 * Trên desktop (lg+): sidebar là cột riêng nên chỉ cần top-20.
 */
export default function MenuToolbar({ keyword, setKeyword, sortMode, setSortMode }) {
  const trimmed = keyword.trim();

  return (
    <div
      // Mobile: sticky dưới category bar (64px navbar + chiều cao bar thực tế)
      // Desktop: Tailwind lg:top-20 được apply qua className, inline style
      //          chỉ chạy trên mobile vì lg breakpoint ghi đè.
      className="z-20 space-y-2 lg:sticky lg:top-20"
      style={{
        // Chỉ có hiệu lực dưới lg vì trên lg Tailwind sticky + top-20 thắng
        position: "sticky",
        top: "calc(64px + var(--category-bar-h, 0px))",
      }}
    >
      <div className="rounded-2xl border border-[#EEE3D8] bg-white p-2 shadow-sm sm:p-2.5">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">

          {/* ── Search ── */}
          <div className="relative min-w-0 flex-1">
            <Search
              size={17}
              className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8A6B5F]"
              aria-hidden="true"
            />
            <input
              type="search"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="Tìm món, cà phê, topping..."
              aria-label="Tìm kiếm món"
              className={cn(
                "h-11 w-full rounded-[11px] border border-[#EEE3D8] bg-[#F8F2EA]",
                "pl-10 pr-10 text-sm font-semibold text-[#2F221C]",
                "outline-none placeholder:font-normal placeholder:text-[#9A7B70]",
                "transition-all duration-150",
                "focus:border-[#7CAEB8] focus:bg-white focus:ring-2 focus:ring-[#7CAEB8]/20"
              )}
            />
            {keyword && (
              <button
                type="button"
                onClick={() => setKeyword("")}
                aria-label="Xóa từ khóa"
                className="absolute right-2.5 top-1/2 grid h-7 w-7 -translate-y-1/2 place-items-center rounded-lg border border-[#EEE3D8] bg-white text-[#6B4B3E] transition hover:bg-neutral-50 active:scale-95"
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Divider — desktop only */}
          <div className="hidden h-7 w-px bg-[#EEE3D8] sm:block" aria-hidden="true" />

          {/* ── Sort ── */}
          <div className="relative w-full sm:w-52">
            <SlidersHorizontal
              size={16}
              className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8A6B5F]"
              aria-hidden="true"
            />
            <select
              value={sortMode}
              onChange={(e) => setSortMode(e.target.value)}
              aria-label="Sắp xếp sản phẩm"
              className={cn(
                "h-11 w-full appearance-none rounded-[11px]",
                "border border-[#EEE3D8] bg-[#F8F2EA] sm:border-transparent sm:bg-transparent",
                "pl-10 pr-8 text-sm font-semibold text-[#6B4B3E]",
                "outline-none transition-all duration-150 cursor-pointer",
                "focus:border-[#7CAEB8] focus:bg-white focus:ring-2 focus:ring-[#7CAEB8]/20 sm:focus:ring-0"
              )}
            >
              {SORT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
            <ChevronDown
              size={15}
              className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#8A6B5F]"
              aria-hidden="true"
            />
          </div>
        </div>
      </div>

      {/* Active keyword badge */}
      {trimmed && (
        <div className="flex items-center gap-2 px-1">
          <span className="text-xs font-medium text-[#73584D]">Đang lọc:</span>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-[#C4DDE2] bg-[#EDF6F8] py-1 pl-3 pr-1.5 text-xs font-bold text-[#1E5B68]">
            <span className="max-w-[180px] truncate italic">{trimmed}</span>
            <button
              type="button"
              onClick={() => setKeyword("")}
              aria-label="Xóa từ khóa"
              className="grid h-4 w-4 place-items-center rounded-full bg-[#1E5B68]/15 text-[#1E5B68] transition hover:bg-[#1E5B68]/25"
            >
              <X size={10} />
            </button>
          </span>
        </div>
      )}
    </div>
  );
}   