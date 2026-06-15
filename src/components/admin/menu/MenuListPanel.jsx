import { DndContext, closestCenter } from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Edit, Filter, GripVertical, Search, Trash } from "lucide-react";

import { cn, formatPrice } from "../../../utils/admin/menuItemUtils";

export default function MenuListPanel({
  loading,
  sortedItems,
  filteredItems,
  itemIds,
  categoryMap,
  searchText,
  setSearchText,
  categoryFilter,
  setCategoryFilter,
  statusFilter,
  setStatusFilter,
  categories,
  canReorder,
  sensors,
  onDragEnd,
  onEditItem,
  onDeleteItem,
  onToggleAvailable,
  onToggleFeatured,
}) {
  return (
    <section className="rounded-[12px] border border-neutral-200 bg-white p-3 shadow-sm sm:p-5">
      <div className="flex flex-col gap-3 border-b border-neutral-200 pb-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h2 className="text-xl font-black text-neutral-950">
            Danh sách món
          </h2>

          <p className="mt-1 text-sm leading-6 text-neutral-500">
            {canReorder
              ? "Kéo biểu tượng để đổi vị trí món trên menu public."
              : "Đang lọc danh sách, kéo thả tạm ẩn để tránh sai thứ tự."}
          </p>
        </div>

        <div className="inline-flex w-fit rounded-[8px] bg-neutral-100 px-3 py-1.5 text-sm font-black text-neutral-600">
          {filteredItems.length}/{sortedItems.length} món
        </div>
      </div>

      <div className="mt-4 rounded-[12px] border border-neutral-200 bg-neutral-50 p-3">
        <div className="grid gap-3 lg:grid-cols-[1fr_190px_180px]">
          <div className="relative">
            <Search
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400"
            />

            <input
              value={searchText}
              onChange={(event) => setSearchText(event.target.value)}
              placeholder="Tìm món theo tên, mô tả, tag hoặc size..."
              className="h-12 w-full rounded-[8px] border border-neutral-200 bg-white pl-11 pr-4 text-sm font-bold text-neutral-900 outline-none transition placeholder:text-neutral-400 focus:border-neutral-950"
            />
          </div>

          <select
            value={categoryFilter}
            onChange={(event) => setCategoryFilter(event.target.value)}
            className="h-12 w-full rounded-[8px] border border-neutral-200 bg-white px-4 text-sm font-bold text-neutral-900 outline-none transition focus:border-neutral-950"
          >
            <option value="all">Tất cả danh mục</option>

            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            className="h-12 w-full rounded-[8px] border border-neutral-200 bg-white px-4 text-sm font-bold text-neutral-900 outline-none transition focus:border-neutral-950"
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="available">Còn bán</option>
            <option value="unavailable">Tạm hết</option>
            <option value="featured">Nổi bật</option>
          </select>
        </div>
      </div>

      {!canReorder && (
        <div className="mt-3 flex items-start gap-2 rounded-[8px] border border-amber-100 bg-amber-50 px-3 py-2 text-xs font-bold leading-5 text-amber-700">
          <Filter size={14} className="mt-0.5 shrink-0" />
          <span>Xóa tìm kiếm/lọc để bật kéo thả sắp xếp thứ tự.</span>
        </div>
      )}

      {loading ? (
        <LoadingList />
      ) : (
        <div className="mt-4 sm:mt-5">
          {filteredItems.length === 0 && (
            <div className="rounded-[12px] border border-dashed border-neutral-200 bg-neutral-50 p-6 text-center">
              <p className="text-sm font-bold text-neutral-500">
                Không tìm thấy món nào phù hợp.
              </p>
            </div>
          )}

          {canReorder ? (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={onDragEnd}
            >
              <SortableContext
                items={itemIds}
                strategy={verticalListSortingStrategy}
              >
                <div className="space-y-3">
                  {sortedItems.map((item, index) => (
                    <SortableMenuItem
                      key={item.id}
                      item={item}
                      index={index}
                      categoryName={
                        categoryMap[item.categoryId]?.name || "Chưa có danh mục"
                      }
                      onEdit={onEditItem}
                      onDelete={onDeleteItem}
                      onToggleAvailable={onToggleAvailable}
                      onToggleFeatured={onToggleFeatured}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          ) : (
            <div className="space-y-3">
              {filteredItems.map((item, index) => (
                <MenuItemCard
                  key={item.id}
                  item={item}
                  index={index}
                  categoryName={
                    categoryMap[item.categoryId]?.name || "Chưa có danh mục"
                  }
                  onEdit={onEditItem}
                  onDelete={onDeleteItem}
                  onToggleAvailable={onToggleAvailable}
                  onToggleFeatured={onToggleFeatured}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </section>
  );
}

function SortableMenuItem(props) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: props.item.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style}>
      <MenuItemCard
        {...props}
        isDragging={isDragging}
        dragHandleProps={{
          ...attributes,
          ...listeners,
        }}
      />
    </div>
  );
}

function MenuItemCard({
  item,
  index,
  categoryName,
  onEdit,
  onDelete,
  onToggleAvailable,
  onToggleFeatured,
  dragHandleProps,
  isDragging = false,
}) {
  const hasSale = Number(item.oldPrice || 0) > Number(item.price || 0);
  const isAvailable = item.isAvailable !== false;
  const canDrag = Boolean(dragHandleProps);
  const sizeCount = Array.isArray(item.sizes) ? item.sizes.length : 0;
  const imageUrl = getItemImageUrl(item);

  return (
    <article
      className={cn(
        "rounded-[12px] border border-neutral-200 bg-white p-3 shadow-sm transition",
        "hover:border-neutral-300 hover:shadow-md",
        isDragging && "relative z-50 scale-[1.01] shadow-2xl"
      )}
    >
      <div className="mb-3 flex items-center justify-between gap-3 border-b border-neutral-100 pb-3 md:hidden">
        <div className="flex min-w-0 items-center gap-2">
          <DragHandle
            canDrag={canDrag}
            index={index}
            dragHandleProps={dragHandleProps}
            mobile
          />

          <div className="min-w-0">
            <p className="line-clamp-1 text-sm font-black text-neutral-950">
              #{index + 1} · {item.name}
            </p>

            <p className="line-clamp-1 text-xs font-bold text-neutral-400">
              {categoryName}
            </p>
          </div>
        </div>

        <ActionButtons item={item} onEdit={onEdit} onDelete={onDelete} />
      </div>

      <div className="grid gap-3 md:grid-cols-[44px_116px_1fr]">
        <div className="hidden md:block">
          <DragHandle
            canDrag={canDrag}
            index={index}
            dragHandleProps={dragHandleProps}
          />
        </div>

        <div className="grid grid-cols-[92px_1fr] gap-3 md:contents">
          <div className="h-[92px] overflow-hidden rounded-[10px] border border-neutral-200 bg-neutral-50 md:h-full md:min-h-[116px]">
            {imageUrl ? (
              <img
                src={imageUrl}
                alt={item.name}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="grid h-full w-full place-items-center px-2 text-center text-xs font-bold text-neutral-400">
                No image
              </div>
            )}
          </div>

          <div className="min-w-0 md:hidden">
            <MobileItemSummary
              item={item}
              sizeCount={sizeCount}
              hasSale={hasSale}
            />
          </div>
        </div>

        <div className="min-w-0">
          <div className="hidden justify-between gap-3 md:flex lg:items-start">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-neutral-950 text-xs font-bold text-white">
                  {index + 1}
                </span>

                <h3 className="line-clamp-1 font-black text-neutral-950">
                  {item.name}
                </h3>
              </div>

              <p className="mt-1 text-sm font-medium text-neutral-500">
                {categoryName}
              </p>
            </div>

            <ActionButtons item={item} onEdit={onEdit} onDelete={onDelete} />
          </div>

          {item.description && (
            <p className="mt-3 line-clamp-2 text-sm leading-6 text-neutral-500 md:mt-2">
              {item.description}
            </p>
          )}

          {sizeCount > 0 && (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {item.sizes.slice(0, 3).map((size) => (
                <span
                  key={size.id}
                  className="rounded-[7px] bg-blue-50 px-2 py-1 text-[11px] font-black text-blue-700"
                >
                  {size.name}: {formatPrice(size.price)}
                </span>
              ))}

              {sizeCount > 3 && (
                <span className="rounded-[7px] bg-neutral-100 px-2 py-1 text-[11px] font-black text-neutral-500">
                  +{sizeCount - 3} size
                </span>
              )}
            </div>
          )}

          <div className="mt-3 flex flex-wrap items-center gap-2">
            <span className="rounded-[8px] bg-neutral-950 px-3 py-1.5 text-sm font-black text-white">
              {sizeCount > 0
                ? `Từ ${formatPrice(item.price)}`
                : formatPrice(item.price)}
            </span>

            {sizeCount > 0 && (
              <span className="rounded-[8px] bg-blue-50 px-3 py-1.5 text-xs font-black text-blue-700">
                {sizeCount} size
              </span>
            )}

            {hasSale && (
              <span className="rounded-[8px] bg-neutral-100 px-3 py-1.5 text-sm font-bold text-neutral-400 line-through">
                {formatPrice(item.oldPrice)}
              </span>
            )}

            <button
              type="button"
              onClick={() => onToggleAvailable(item)}
              className={cn(
                "rounded-[8px] px-3 py-1.5 text-xs font-black transition",
                isAvailable
                  ? "bg-green-50 text-green-700 hover:bg-green-100"
                  : "bg-neutral-100 text-neutral-500 hover:bg-neutral-200"
              )}
            >
              {isAvailable ? "Còn bán" : "Tạm hết"}
            </button>

            <button
              type="button"
              onClick={() => onToggleFeatured(item)}
              className={cn(
                "rounded-[8px] px-3 py-1.5 text-xs font-black transition",
                item.isFeatured
                  ? "bg-amber-50 text-amber-700 hover:bg-amber-100"
                  : "bg-neutral-100 text-neutral-500 hover:bg-neutral-200"
              )}
            >
              {item.isFeatured ? "Nổi bật" : "Không nổi bật"}
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}

function DragHandle({ canDrag, index, dragHandleProps, mobile = false }) {
  return (
    <button
      type="button"
      {...(dragHandleProps || {})}
      disabled={!canDrag}
      className={cn(
        "touch-none select-none rounded-[8px] text-neutral-400 transition",
        mobile
          ? "grid h-10 w-10 shrink-0 place-items-center"
          : "flex h-full min-h-[116px] w-11 items-center justify-center",
        canDrag
          ? "cursor-grab bg-neutral-100 hover:bg-neutral-200 active:cursor-grabbing"
          : "cursor-default bg-neutral-50"
      )}
      aria-label={canDrag ? "Kéo để sắp xếp món" : `Vị trí ${index + 1}`}
    >
      {canDrag ? (
        <GripVertical size={20} />
      ) : (
        <span className="text-xs font-black">#{index + 1}</span>
      )}
    </button>
  );
}

function ActionButtons({ item, onEdit, onDelete }) {
  return (
    <div className="flex shrink-0 gap-2">
      <button
        type="button"
        onClick={() => onEdit(item)}
        className="grid h-10 w-10 place-items-center rounded-[8px] bg-neutral-100 text-neutral-700 transition hover:bg-neutral-200"
        aria-label="Sửa món"
      >
        <Edit size={16} />
      </button>

      <button
        type="button"
        onClick={() => onDelete(item.id)}
        className="grid h-10 w-10 place-items-center rounded-[8px] bg-red-50 text-red-600 transition hover:bg-red-100"
        aria-label="Xóa món"
      >
        <Trash size={16} />
      </button>
    </div>
  );
}

function MobileItemSummary({ item, sizeCount, hasSale }) {
  return (
    <div className="flex h-full min-w-0 flex-col">
      <p className="line-clamp-1 text-xs font-bold text-neutral-400">
        {sizeCount > 0 ? `${sizeCount} size` : "Giá mặc định"}
      </p>

      <p className="mt-1 line-clamp-2 text-sm font-black leading-5 text-neutral-950">
        {item.name}
      </p>

      <div className="mt-auto pt-2">
        {hasSale && (
          <p className="text-xs font-bold text-neutral-400 line-through">
            {formatPrice(item.oldPrice)}
          </p>
        )}

        <p className="text-base font-black text-neutral-950">
          {sizeCount > 0
            ? `Từ ${formatPrice(item.price)}`
            : formatPrice(item.price)}
        </p>
      </div>
    </div>
  );
}

function getItemImageUrl(item) {
  if (item.imageUrl) return item.imageUrl;

  if (Array.isArray(item.images) && item.images.length > 0) {
    const firstImage = item.images[0];

    if (typeof firstImage === "string") return firstImage;

    return firstImage?.url || "";
  }

  return "";
}

function LoadingList() {
  return (
    <div className="mt-5 space-y-3">
      {Array.from({ length: 5 }).map((_, index) => (
        <div
          key={index}
          className="rounded-[12px] border border-neutral-200 bg-white p-3 shadow-sm"
        >
          <div className="grid grid-cols-[92px_1fr] gap-3 md:grid-cols-[44px_116px_1fr]">
            <div className="hidden h-28 animate-pulse rounded-[8px] bg-neutral-100 md:block" />
            <div className="h-[92px] animate-pulse rounded-[10px] bg-neutral-100 md:h-28" />
            <div className="space-y-3">
              <div className="h-4 w-2/3 animate-pulse rounded bg-neutral-100" />
              <div className="h-4 w-full animate-pulse rounded bg-neutral-100" />
              <div className="h-4 w-1/2 animate-pulse rounded bg-neutral-100" />
              <div className="flex gap-2">
                <div className="h-7 w-20 animate-pulse rounded-[8px] bg-neutral-100" />
                <div className="h-7 w-20 animate-pulse rounded-[8px] bg-neutral-100" />
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}