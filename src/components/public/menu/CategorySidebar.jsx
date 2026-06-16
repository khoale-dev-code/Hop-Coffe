import { Coffee } from "lucide-react";
import { cn } from "./publicMenuUtils";

export default function CategorySidebar({
  categories = [],
  activeCategory,
  setActiveCategory,
  countMap = {},
  totalItems = 0,
}) {
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
      <section className="lg:hidden">
        <div className="sticky top-[64px] z-30 -mx-3 border-y border-neutral-200 bg-white/95 px-3 py-2.5 backdrop-blur-xl sm:-mx-6 sm:px-6">
          <div className="mb-2 flex items-center justify-between gap-2">
            <div className="flex min-w-0 items-center gap-2">
              <div className="grid h-8 w-8 shrink-0 place-items-center rounded-[8px] border border-neutral-200 bg-white text-[#6B4B3E] shadow-sm">
                <Coffee size={16} aria-hidden="true" />
              </div>

              <div className="min-w-0">
                <p className="text-sm font-black leading-5 text-[#2F221C]">
                  Danh mục
                </p>

                <p className="text-[11px] font-semibold leading-4 text-[#73584D]">
                  Lọc nhanh sản phẩm
                </p>
              </div>
            </div>

            <span className="shrink-0 rounded-full bg-neutral-100 px-2.5 py-1 text-[11px] font-black text-[#6B4B3E]">
              {totalItems} món
            </span>
          </div>

          <div
            className="hop-hide-scroll -mx-3 flex snap-x snap-mandatory gap-2 overflow-x-auto px-3 pb-1"
            role="tablist"
            aria-label="Danh mục sản phẩm"
          >
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
        <div className="sticky top-24 overflow-hidden rounded-[12px] border border-neutral-200 bg-white shadow-sm">
          <div className="flex items-center gap-3 border-b border-neutral-200 bg-white px-4 py-4">
            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-[9px] border border-neutral-200 bg-white text-[#6B4B3E] shadow-sm">
              <Coffee size={20} aria-hidden="true" />
            </div>

            <div className="min-w-0">
              <p className="font-black leading-5 text-[#2F221C]">Danh mục</p>

              <p className="mt-0.5 text-xs font-medium text-[#73584D]">
                Lọc theo nhóm sản phẩm
              </p>
            </div>
          </div>

          <div className="max-h-[calc(100dvh-190px)] space-y-2 overflow-y-auto p-3">
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
        "group flex min-h-11 w-full items-center justify-between gap-3 rounded-[9px] border px-3 py-2.5 text-left text-sm font-black transition",
        active
          ? "border-[#2F221C] bg-[#2F221C] text-white shadow-sm"
          : "border-neutral-200 bg-white text-[#6B4B3E] hover:border-[#C9A58D] hover:bg-neutral-50"
      )}
    >
      <span className="line-clamp-1 min-w-0">{label}</span>

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
      role="tab"
      aria-selected={active}
      className={cn(
        "inline-flex min-h-9 shrink-0 snap-start items-center gap-1.5 rounded-full border px-3 py-2 text-xs font-black transition active:scale-[0.98] min-[390px]:text-sm",
        active
          ? "border-[#2F221C] bg-[#2F221C] text-white shadow-sm"
          : "border-neutral-200 bg-white text-[#6B4B3E] shadow-sm hover:border-[#C9A58D]"
      )}
    >
      <span className="max-w-[118px] truncate min-[390px]:max-w-[145px] sm:max-w-[180px]">
        {label}
      </span>

      <span
        className={cn(
          "rounded-full px-1.5 py-0.5 text-[10px] font-black min-[390px]:px-2 min-[390px]:text-[11px]",
          active ? "bg-white/20 text-white" : "bg-neutral-100 text-[#73584D]"
        )}
      >
        {count}
      </span>
    </button>
  );
}