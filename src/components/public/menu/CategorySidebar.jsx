import { Coffee } from "lucide-react";
import { cn } from "./publicMenuUtils";

export default function CategorySidebar({
  categories,
  activeCategory,
  setActiveCategory,
  countMap,
  totalItems,
}) {
  return (
    <aside className="hidden lg:block">
      <div className="sticky top-24 rounded-[16px] border border-[#EEE3D8] bg-white p-4 shadow-sm">
        <div className="flex items-center gap-3 border-b border-[#EEE3D8] pb-4">
          <div className="grid h-10 w-10 place-items-center rounded-[10px] bg-[#F8F2EA] text-[#6B4B3E]">
            <Coffee size={20} />
          </div>

          <div>
            <p className="font-black text-[#2F221C]">Danh mục</p>
            <p className="text-xs font-medium text-[#73584D]">
              Lọc theo nhóm sản phẩm
            </p>
          </div>
        </div>

        <div className="mt-4 space-y-2">
          <CategoryButton
            label="Tất cả sản phẩm"
            count={totalItems}
            active={activeCategory === "all"}
            onClick={() => setActiveCategory("all")}
          />

          {categories.map((category) => (
            <CategoryButton
              key={category.id}
              label={category.name}
              count={countMap[category.id] || 0}
              active={activeCategory === category.id}
              onClick={() => setActiveCategory(category.id)}
            />
          ))}
        </div>
      </div>
    </aside>
  );
}

function CategoryButton({ label, count, active, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex w-full items-center justify-between gap-3 rounded-[10px] px-3 py-3 text-left text-sm font-black transition",
        active
          ? "bg-[#6B4B3E] text-white"
          : "bg-[#F8F2EA] text-[#6B4B3E] hover:bg-[#EEE3D8]"
      )}
    >
      <span className="line-clamp-1">{label}</span>

      <span
        className={cn(
          "rounded-full px-2 py-0.5 text-xs",
          active ? "bg-white/20 text-white" : "bg-white text-[#73584D]"
        )}
      >
        {count}
      </span>
    </button>
  );
}