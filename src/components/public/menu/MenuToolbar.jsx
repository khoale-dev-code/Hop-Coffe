import { Search, SlidersHorizontal, X } from "lucide-react";
import { cn } from "./publicMenuUtils";

export default function MenuToolbar({
  keyword,
  setKeyword,
  sortMode,
  setSortMode,
  categories,
  activeCategory,
  setActiveCategory,
}) {
  return (
    <div className="sticky top-16 z-40 -mx-4 border-y border-[#EEE3D8] bg-white/95 px-4 py-3 backdrop-blur sm:-mx-6 sm:px-6 lg:top-20 lg:-mx-0 lg:rounded-[14px] lg:border lg:px-4">
      <div className="grid gap-3 lg:grid-cols-[1fr_220px]">
        <div className="relative">
          <Search
            size={19}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8A6B5F]"
          />

          <input
            value={keyword}
            onChange={(event) => setKeyword(event.target.value)}
            placeholder="Tìm món, trà, cà phê, topping..."
            className="h-12 w-full rounded-[10px] bg-[#F8F2EA] pl-11 pr-11 text-sm font-bold text-[#2F221C] outline-none ring-1 ring-[#EEE3D8] transition focus:bg-white focus:ring-2 focus:ring-[#7CAEB8]"
          />

          {keyword && (
            <button
              type="button"
              onClick={() => setKeyword("")}
              className="absolute right-3 top-1/2 grid h-7 w-7 -translate-y-1/2 place-items-center rounded-[8px] bg-white text-[#6B4B3E]"
            >
              <X size={15} />
            </button>
          )}
        </div>

        <div className="relative">
          <SlidersHorizontal
            size={18}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8A6B5F]"
          />

          <select
            value={sortMode}
            onChange={(event) => setSortMode(event.target.value)}
            className="h-12 w-full appearance-none rounded-[10px] bg-[#F8F2EA] pl-11 pr-4 text-sm font-black text-[#6B4B3E] outline-none ring-1 ring-[#EEE3D8] focus:bg-white focus:ring-2 focus:ring-[#7CAEB8]"
          >
            <option value="default">Thứ tự mặc định</option>
            <option value="name-asc">Tên A → Z</option>
            <option value="name-desc">Tên Z → A</option>
            <option value="price-asc">Giá tăng dần</option>
            <option value="price-desc">Giá giảm dần</option>
            <option value="featured">Món nổi bật</option>
          </select>
        </div>
      </div>

      <div className="hop-hide-scroll mt-3 flex gap-2 overflow-x-auto pb-1 lg:hidden">
        <CategoryPill
          label="Tất cả"
          active={activeCategory === "all"}
          onClick={() => setActiveCategory("all")}
        />

        {categories.map((category) => (
          <CategoryPill
            key={category.id}
            label={category.name}
            active={activeCategory === category.id}
            onClick={() => setActiveCategory(category.id)}
          />
        ))}
      </div>
    </div>
  );
}

function CategoryPill({ label, active, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "shrink-0 rounded-full px-4 py-2.5 text-sm font-black transition",
        active
          ? "bg-[#6B4B3E] text-white"
          : "bg-[#F8F2EA] text-[#6B4B3E] ring-1 ring-[#EEE3D8]"
      )}
    >
      {label}
    </button>
  );
}