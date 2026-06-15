import { Coffee } from "lucide-react";
import { cn } from "./publicMenuUtils";

export default function CategorySidebar({
  categories,
  activeCategory,
  setActiveCategory,
  countMap,
  totalItems,
}) {
  const categoryItems = [
    {
      id: "all",
      name: "Tất cả sản phẩm",
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
      <section className="lg:hidden">
        <div className="sticky top-16 z-30 -mx-4 border-y border-neutral-200 bg-white/95 px-4 py-3 backdrop-blur-xl sm:-mx-6 sm:px-6">
          <div className="mb-3 flex items-center justify-between gap-3">
            <div className="flex min-w-0 items-center gap-2">
              <div className="grid h-9 w-9 shrink-0 place-items-center rounded-[8px] border border-neutral-200 bg-white text-[#6B4B3E] shadow-sm">
                <Coffee size={18} />
              </div>

              <div className="min-w-0">
                <p className="text-sm font-black text-[#2F221C]">Danh mục</p>
                <p className="text-xs font-medium text-[#73584D]">
                  Lọc nhanh sản phẩm
                </p>
              </div>
            </div>

            <span className="shrink-0 rounded-full bg-neutral-100 px-2.5 py-1 text-xs font-black text-[#6B4B3E]">
              {totalItems} món
            </span>
          </div>

          <div className="hop-hide-scroll flex gap-2 overflow-x-auto pb-1">
            {categoryItems.map((category) => (
              <MobileCategoryButton
                key={category.id}
                label={category.name}
                count={category.count}
                active={activeCategory === category.id}
                onClick={() => setActiveCategory(category.id)}
              />
            ))}
          </div>
        </div>
      </section>

      <aside className="hidden lg:block">
        <div className="sticky top-24 rounded-[10px] border border-neutral-200 bg-white p-4 shadow-sm">
          <div className="flex items-center gap-3 border-b border-neutral-200 pb-4">
            <div className="grid h-10 w-10 place-items-center rounded-[8px] border border-neutral-200 bg-white text-[#6B4B3E] shadow-sm">
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
            {categoryItems.map((category) => (
              <DesktopCategoryButton
                key={category.id}
                label={category.name}
                count={category.count}
                active={activeCategory === category.id}
                onClick={() => setActiveCategory(category.id)}
              />
            ))}
          </div>
        </div>
      </aside>
    </>
  );
}

function DesktopCategoryButton({ label, count, active, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex w-full items-center justify-between gap-3 rounded-[8px] border px-3 py-3 text-left text-sm font-black transition",
        active
          ? "border-[#2F221C] bg-[#2F221C] text-white shadow-sm"
          : "border-neutral-200 bg-white text-[#6B4B3E] hover:border-[#C9A58D] hover:bg-neutral-50"
      )}
    >
      <span className="line-clamp-1">{label}</span>

      <span
        className={cn(
          "shrink-0 rounded-full px-2 py-0.5 text-xs font-black",
          active ? "bg-white/20 text-white" : "bg-neutral-100 text-[#73584D]"
        )}
      >
        {count}
      </span>
    </button>
  );
}

function MobileCategoryButton({ label, count, active, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex shrink-0 items-center gap-2 rounded-full border px-3.5 py-2.5 text-sm font-black transition",
        active
          ? "border-[#2F221C] bg-[#2F221C] text-white shadow-sm"
          : "border-neutral-200 bg-white text-[#6B4B3E] shadow-sm hover:border-[#C9A58D]"
      )}
    >
      <span className="max-w-[150px] truncate">{label}</span>

      <span
        className={cn(
          "rounded-full px-2 py-0.5 text-[11px] font-black",
          active ? "bg-white/20 text-white" : "bg-neutral-100 text-[#73584D]"
        )}
      >
        {count}
      </span>
    </button>
  );
}