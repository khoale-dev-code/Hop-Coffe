import {
  DndContext,
  closestCenter,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  Edit,
  Filter,
  GripVertical,
  Search,
  Trash,
} from "lucide-react";

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
    <section className="rounded-[16px] border border-neutral-200 bg-white p-5 shadow-sm">
      <div className="flex flex-col justify-between gap-3 xl:flex-row xl:items-end">
        <div>
          <h2 className="text-xl font-black">Danh sách món</h2>

          <p className="mt-1 text-sm text-neutral-500">
            {canReorder
              ? "Kéo biểu tượng bên trái để đổi vị trí món trên menu public."
              : "Đang lọc danh sách, kéo thả tạm ẩn để tránh sai thứ tự."}
          </p>
        </div>

        <p className="text-sm font-bold text-neutral-400">
          {filteredItems.length}/{sortedItems.length} món
        </p>
      </div>

      <div className="mt-4 grid gap-3 xl:grid-cols-[1fr_180px_170px]">
        <div className="relative">
          <Search
            size={18}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400"
          />

          <input
            value={searchText}
            onChange={(event) => setSearchText(event.target.value)}
            placeholder="Tìm món theo tên, mô tả, tag hoặc size..."
            className="h-12 w-full rounded-[10px] border border-neutral-200 bg-neutral-50 pl-11 pr-4 text-sm font-medium outline-none transition focus:border-neutral-950 focus:bg-white"
          />
        </div>

        <select
          value={categoryFilter}
          onChange={(event) => setCategoryFilter(event.target.value)}
          className="h-12 rounded-[10px] border border-neutral-200 bg-neutral-50 px-4 text-sm font-bold outline-none focus:border-neutral-950 focus:bg-white"
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
          className="h-12 rounded-[10px] border border-neutral-200 bg-neutral-50 px-4 text-sm font-bold outline-none focus:border-neutral-950 focus:bg-white"
        >
          <option value="all">Tất cả trạng thái</option>
          <option value="available">Còn bán</option>
          <option value="unavailable">Tạm hết</option>
          <option value="featured">Nổi bật</option>
        </select>
      </div>

      {!canReorder && (
        <div className="mt-3 inline-flex items-center gap-2 rounded-[10px] bg-amber-50 px-3 py-2 text-xs font-bold text-amber-700">
          <Filter size={14} />
          Xóa tìm kiếm/lọc để bật kéo thả sắp xếp thứ tự.
        </div>
      )}

      {loading ? (
        <LoadingList />
      ) : (
        <div className="mt-5">
          {filteredItems.length === 0 && (
            <p className="rounded-[12px] bg-neutral-50 p-5 text-center text-sm text-neutral-500">
              Không tìm thấy món nào phù hợp.
            </p>
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
  const imageUrl = item.imageUrl || item.images?.[0]?.url || "";

  return (
    <article
      className={cn(
        "rounded-[14px] border border-neutral-200 bg-white p-3 shadow-sm transition",
        "grid gap-3 md:grid-cols-[44px_116px_1fr]",
        isDragging && "relative z-50 scale-[1.01] shadow-2xl"
      )}
    >
      <button
        type="button"
        {...dragHandleProps}
        disabled={!canDrag}
        className={cn(
          "flex h-10 w-full items-center justify-center rounded-[10px] text-neutral-400 md:h-full md:w-11",
          canDrag
            ? "cursor-grab bg-neutral-100 active:cursor-grabbing"
            : "cursor-default bg-neutral-50"
        )}
      >
        {canDrag ? (
          <GripVertical size={20} />
        ) : (
          <span className="text-xs font-black">#{index + 1}</span>
        )}
      </button>

      <div className="h-28 overflow-hidden rounded-[12px] bg-neutral-100 md:h-full">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={item.name}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="grid h-full w-full place-items-center text-xs font-medium text-neutral-400">
            No image
          </div>
        )}
      </div>

      <div className="min-w-0">
        <div className="flex flex-col justify-between gap-3 lg:flex-row lg:items-start">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="hidden h-7 w-7 place-items-center rounded-full bg-neutral-950 text-xs font-bold text-white md:grid">
                {index + 1}
              </span>

              <h3 className="line-clamp-1 font-black">{item.name}</h3>
            </div>

            <p className="mt-1 text-sm font-medium text-neutral-500">
              {categoryName}
            </p>
          </div>

          <div className="flex shrink-0 gap-2">
            <button
              type="button"
              onClick={() => onEdit(item)}
              className="grid h-9 w-9 place-items-center rounded-[9px] bg-neutral-100 text-neutral-700"
            >
              <Edit size={16} />
            </button>

            <button
              type="button"
              onClick={() => onDelete(item.id)}
              className="grid h-9 w-9 place-items-center rounded-[9px] bg-red-50 text-red-600"
            >
              <Trash size={16} />
            </button>
          </div>
        </div>

        {item.description && (
          <p className="mt-2 line-clamp-2 text-sm leading-6 text-neutral-500">
            {item.description}
          </p>
        )}

        {sizeCount > 0 && (
          <div className="mt-2 flex flex-wrap gap-1.5">
            {item.sizes.slice(0, 4).map((size) => (
              <span
                key={size.id}
                className="rounded-[7px] bg-blue-50 px-2 py-1 text-[11px] font-black text-blue-700"
              >
                {size.name}: {formatPrice(size.price)}
              </span>
            ))}

            {sizeCount > 4 && (
              <span className="rounded-[7px] bg-neutral-100 px-2 py-1 text-[11px] font-black text-neutral-500">
                +{sizeCount - 4} size
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
              "rounded-[8px] px-3 py-1.5 text-xs font-black",
              isAvailable
                ? "bg-green-50 text-green-700"
                : "bg-neutral-100 text-neutral-500"
            )}
          >
            {isAvailable ? "Còn bán" : "Tạm hết"}
          </button>

          <button
            type="button"
            onClick={() => onToggleFeatured(item)}
            className={cn(
              "rounded-[8px] px-3 py-1.5 text-xs font-black",
              item.isFeatured
                ? "bg-amber-50 text-amber-700"
                : "bg-neutral-100 text-neutral-500"
            )}
          >
            {item.isFeatured ? "Nổi bật" : "Không nổi bật"}
          </button>
        </div>
      </div>
    </article>
  );
}

function LoadingList() {
  return (
    <div className="mt-5 space-y-3">
      {Array.from({ length: 5 }).map((_, index) => (
        <div
          key={index}
          className="h-32 animate-pulse rounded-[14px] bg-neutral-100"
        />
      ))}
    </div>
  );
}