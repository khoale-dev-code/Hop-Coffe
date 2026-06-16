import { Search, SlidersHorizontal, X } from "lucide-react";

export default function MenuToolbar({
  keyword,
  setKeyword,
  sortMode,
  setSortMode,
}) {
  return (
    <div className="rounded-[14px] border border-[#EEE3D8] bg-white p-2.5 shadow-sm sm:p-3 lg:sticky lg:top-20 lg:z-30 lg:p-4">
      <div className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_220px]">
        <div className="relative min-w-0">
          <Search
            size={17}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8A6B5F]"
            aria-hidden="true"
          />

          <input
            value={keyword}
            onChange={(event) => setKeyword(event.target.value)}
            placeholder="Tìm món, cà phê, topping..."
            className="h-10 w-full rounded-[10px] bg-[#F8F2EA] pl-10 pr-10 text-sm font-bold text-[#2F221C] outline-none ring-1 ring-[#EEE3D8] transition placeholder:text-[#9A7B70] focus:bg-white focus:ring-2 focus:ring-[#7CAEB8] sm:h-11"
          />

          {keyword && (
            <button
              type="button"
              onClick={() => setKeyword("")}
              className="absolute right-2.5 top-1/2 grid h-7 w-7 -translate-y-1/2 place-items-center rounded-[8px] bg-white text-[#6B4B3E] shadow-sm ring-1 ring-[#EEE3D8] transition hover:bg-neutral-50 active:scale-95"
              aria-label="Xóa từ khóa tìm kiếm"
            >
              <X size={14} />
            </button>
          )}
        </div>

        <div className="relative min-w-0">
          <SlidersHorizontal
            size={17}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8A6B5F]"
            aria-hidden="true"
          />

          <select
            value={sortMode}
            onChange={(event) => setSortMode(event.target.value)}
            className="h-10 w-full appearance-none rounded-[10px] bg-[#F8F2EA] pl-10 pr-8 text-sm font-black text-[#6B4B3E] outline-none ring-1 ring-[#EEE3D8] transition focus:bg-white focus:ring-2 focus:ring-[#7CAEB8] sm:h-11"
            aria-label="Sắp xếp sản phẩm"
          >
            <option value="default">Mặc định</option>
            <option value="name-asc">Tên A → Z</option>
            <option value="name-desc">Tên Z → A</option>
            <option value="price-asc">Giá tăng dần</option>
            <option value="price-desc">Giá giảm dần</option>
            <option value="featured">Món nổi bật</option>
          </select>

          <span className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-black text-[#8A6B5F]">
            ▾
          </span>
        </div>
      </div>
    </div>
  );
}