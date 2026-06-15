import { useEffect, useMemo, useState } from "react";
import { closestCenter, DndContext } from "@dnd-kit/core";
import {
  rectSortingStrategy,
  SortableContext,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  ChevronLeft,
  ChevronRight,
  Edit,
  Eye,
  EyeOff,
  Filter,
  GripVertical,
  ImagePlus,
  Loader2,
  PackageOpen,
  Search,
  Star,
  Trash,
  Video,
} from "lucide-react";

function cn(...classes) {
  return classes.filter(Boolean).join(" ");
}

function formatPrice(value) {
  return Number(value || 0).toLocaleString("vi-VN") + "đ";
}

function inferMediaType(url = "") {
  const cleanUrl = String(url).toLowerCase().split("?")[0];

  if (
    cleanUrl.endsWith(".mp4") ||
    cleanUrl.endsWith(".webm") ||
    cleanUrl.endsWith(".mov") ||
    cleanUrl.endsWith(".m4v")
  ) {
    return "video";
  }

  return "image";
}

function getItemMedia(item) {
  if (Array.isArray(item?.images) && item.images.length > 0) {
    return item.images
      .map((media, index) => {
        if (typeof media === "string") {
          return {
            url: media,
            type: inferMediaType(media),
            name: `${item.name || "Sản phẩm"} ${index + 1}`,
          };
        }

        return {
          url: media?.url || "",
          type: media?.type || inferMediaType(media?.url || ""),
          name: media?.name || `${item.name || "Sản phẩm"} ${index + 1}`,
        };
      })
      .filter((media) => media.url);
  }

  if (item?.imageUrl) {
    return [
      {
        url: item.imageUrl,
        type: inferMediaType(item.imageUrl),
        name: item.name || "Sản phẩm",
      },
    ];
  }

  return [];
}

function getDisplayPrice(item) {
  const sizes = Array.isArray(item?.sizes) ? item.sizes : [];

  const sizePrices = sizes
    .map((size) => Number(size?.price || 0))
    .filter((price) => price > 0);

  if (sizePrices.length > 0) return Math.min(...sizePrices);

  return Number(item?.price || 0);
}

function getDisplayOldPrice(item) {
  const sizes = Array.isArray(item?.sizes) ? item.sizes : [];

  const sizePrices = sizes
    .map((size) => Number(size?.oldPrice || 0))
    .filter((price) => price > 0);

  if (sizePrices.length > 0) return Math.min(...sizePrices);

  return Number(item?.oldPrice || 0);
}

const pageSizeOptions = [50];

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
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);

  const sourceItems = canReorder ? sortedItems : filteredItems;

  const totalPages = Math.max(1, Math.ceil(sourceItems.length / pageSize));

  const safePage = Math.min(page, totalPages);
  const startIndex = (safePage - 1) * pageSize;
  const endIndex = startIndex + pageSize;

  const paginatedItems = useMemo(() => {
    return sourceItems.slice(startIndex, endIndex);
  }, [sourceItems, startIndex, endIndex]);

  const paginatedItemIds = useMemo(() => {
    return paginatedItems.map((item) => item.id);
  }, [paginatedItems]);

  useEffect(() => {
    setPage(1);
  }, [searchText, categoryFilter, statusFilter, pageSize]);

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  function goPrev() {
    setPage((prev) => Math.max(1, prev - 1));
  }

  function goNext() {
    setPage((prev) => Math.min(totalPages, prev + 1));
  }

  function clearFilters() {
    setSearchText("");
    setCategoryFilter("all");
    setStatusFilter("all");
  }

  return (
    <section className="overflow-hidden rounded-[18px] border border-neutral-200 bg-white shadow-sm">
      <div className="border-b border-neutral-200 bg-[radial-gradient(circle_at_top_left,rgba(124,174,184,0.14),transparent_34%),radial-gradient(circle_at_top_right,rgba(0,0,0,0.05),transparent_30%)] p-4 sm:p-5">
        <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
          <div className="min-w-0">
            <p className="text-xs font-black uppercase tracking-[0.16em] text-[#7CAEB8]">
              Product list
            </p>

            <h2 className="mt-1 text-2xl font-black tracking-tight text-neutral-950">
              Danh sách sản phẩm
            </h2>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-neutral-500">
              {canReorder
                ? "Kéo biểu tượng trên từng sản phẩm để đổi thứ tự hiển thị trên menu khách hàng."
                : "Đang dùng tìm kiếm/lọc. Xóa bộ lọc để bật kéo thả sắp xếp thứ tự."}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2 sm:flex sm:items-center">
            <div className="rounded-[10px] bg-white px-3 py-2 text-center shadow-sm ring-1 ring-neutral-200">
              <p className="text-xs font-bold text-neutral-400">Đang hiển thị</p>
              <p className="text-sm font-black text-neutral-950">
                {sourceItems.length}/{sortedItems.length}
              </p>
            </div>

            <div className="rounded-[10px] bg-white px-3 py-2 text-center shadow-sm ring-1 ring-neutral-200">
              <p className="text-xs font-bold text-neutral-400">Trang</p>
              <p className="text-sm font-black text-neutral-950">
                {safePage}/{totalPages}
              </p>
            </div>
          </div>
        </div>

        <div className="mt-4 grid gap-3 lg:grid-cols-[minmax(0,1fr)_220px_220px_130px]">
          <div className="relative min-w-0">
            <Search
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400"
            />

            <input
              value={searchText}
              onChange={(event) => setSearchText(event.target.value)}
              placeholder="Tìm kiếm theo tên sản phẩm..."
              className="h-12 w-full rounded-[10px] border border-neutral-200 bg-white pl-11 pr-4 text-sm font-bold text-neutral-900 outline-none transition placeholder:text-neutral-400 focus:border-neutral-950"
            />
          </div>

          <select
            value={categoryFilter}
            onChange={(event) => setCategoryFilter(event.target.value)}
            className="h-12 rounded-[10px] border border-neutral-200 bg-white px-4 text-sm font-black text-neutral-900 outline-none transition focus:border-neutral-950"
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
            className="h-12 rounded-[10px] border border-neutral-200 bg-white px-4 text-sm font-black text-neutral-900 outline-none transition focus:border-neutral-950"
          >
            <option value="all">Tất cả sản phẩm</option>
            <option value="available">Còn bán</option>
            <option value="unavailable">Tạm hết</option>
            <option value="featured">Sản phẩm nổi bật</option>
          </select>

        <div className="flex h-12 items-center justify-center rounded-[10px] border border-neutral-200 bg-white px-4 text-sm font-black text-neutral-700">
        50/trang
        </div>
        </div>

        {!canReorder && (
          <div className="mt-3 flex flex-col gap-2 rounded-[10px] border border-amber-100 bg-amber-50 px-3 py-3 text-xs font-bold leading-5 text-amber-700 sm:flex-row sm:items-center sm:justify-between">
            <span className="inline-flex items-center gap-2">
              <Filter size={14} />
              Đang lọc danh sách nên tạm tắt kéo thả sắp xếp.
            </span>

            <button
              type="button"
              onClick={clearFilters}
              className="rounded-[8px] bg-white px-3 py-2 text-xs font-black text-amber-700 ring-1 ring-amber-100 transition hover:bg-amber-100"
            >
              Xóa bộ lọc
            </button>
          </div>
        )}
      </div>

      <div className="p-3 sm:p-5">
        {loading ? (
          <LoadingGrid />
        ) : sourceItems.length === 0 ? (
          <EmptyState />
        ) : canReorder ? (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={onDragEnd}
          >
            <SortableContext
              items={paginatedItemIds.length > 0 ? paginatedItemIds : itemIds}
              strategy={rectSortingStrategy}
            >
              <ProductGrid>
                {paginatedItems.map((item, index) => (
                  <SortableProductCard
                    key={item.id}
                    item={item}
                    index={startIndex + index}
                    categoryName={
                      categoryMap[item.categoryId]?.name || "Chưa có danh mục"
                    }
                    onEdit={onEditItem}
                    onDelete={onDeleteItem}
                    onToggleAvailable={onToggleAvailable}
                    onToggleFeatured={onToggleFeatured}
                  />
                ))}
              </ProductGrid>
            </SortableContext>
          </DndContext>
        ) : (
          <ProductGrid>
            {paginatedItems.map((item, index) => (
              <ProductCard
                key={item.id}
                item={item}
                index={startIndex + index}
                categoryName={
                  categoryMap[item.categoryId]?.name || "Chưa có danh mục"
                }
                onEdit={onEditItem}
                onDelete={onDeleteItem}
                onToggleAvailable={onToggleAvailable}
                onToggleFeatured={onToggleFeatured}
              />
            ))}
          </ProductGrid>
        )}

        {!loading && sourceItems.length > 0 && (
          <PaginationBar
            page={safePage}
            totalPages={totalPages}
            startIndex={startIndex}
            endIndex={endIndex}
            totalItems={sourceItems.length}
            onPrev={goPrev}
            onNext={goNext}
            setPage={setPage}
          />
        )}
      </div>
    </section>
  );
}

function ProductGrid({ children }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
      {children}
    </div>
  );
}

function SortableProductCard(props) {
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
    <div ref={setNodeRef} style={style} className="min-w-0">
      <ProductCard
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

function ProductCard({
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
  const media = getItemMedia(item);
  const firstMedia = media[0];
  const isAvailable = item.isAvailable !== false;
  const isFeatured = item.isFeatured === true;

  const price = getDisplayPrice(item);
  const oldPrice = getDisplayOldPrice(item);
  const hasSale = oldPrice > price && price > 0;

  return (
    <article
      className={cn(
        "group relative min-w-0 overflow-hidden rounded-[14px] border bg-white shadow-sm transition",
        isDragging
          ? "z-50 border-neutral-950 shadow-2xl"
          : "border-neutral-200 hover:border-neutral-300 hover:shadow-md"
      )}
    >
      <div className="relative aspect-square bg-neutral-50">
        {firstMedia ? (
          firstMedia.type === "video" ? (
            <video
              src={firstMedia.url}
              muted
              playsInline
              preload="metadata"
              className="h-full w-full object-cover"
            />
          ) : (
            <img
              src={firstMedia.url}
              alt={firstMedia.name || item.name}
              loading="lazy"
              className="h-full w-full object-cover"
            />
          )
        ) : (
          <div className="grid h-full place-items-center text-neutral-400">
            <ImagePlus size={34} />
          </div>
        )}

        <div className="absolute left-2 top-2 flex flex-wrap gap-1">
          <span className="rounded-[7px] bg-black/70 px-2 py-1 text-[10px] font-black text-white">
            #{index + 1}
          </span>

          {firstMedia?.type === "video" && (
            <span className="inline-flex items-center gap-1 rounded-[7px] bg-black/70 px-2 py-1 text-[10px] font-black text-white">
              <Video size={11} />
              Video
            </span>
          )}

          {media.length > 1 && (
            <span className="rounded-[7px] bg-black/70 px-2 py-1 text-[10px] font-black text-white">
              +{media.length - 1}
            </span>
          )}
        </div>

        {dragHandleProps && (
          <button
            type="button"
            {...dragHandleProps}
            className="absolute bottom-2 left-2 grid h-9 w-9 cursor-grab touch-none place-items-center rounded-[9px] bg-white/95 text-neutral-700 shadow active:cursor-grabbing"
            title="Kéo để sắp xếp"
          >
            <GripVertical size={17} />
          </button>
        )}

        <button
          type="button"
          onClick={() => onToggleFeatured(item)}
          className={cn(
            "absolute bottom-2 right-2 grid h-9 w-9 place-items-center rounded-[9px] shadow transition",
            isFeatured
              ? "bg-yellow-400 text-neutral-950"
              : "bg-white/95 text-neutral-500 hover:text-yellow-600"
          )}
          title="Đánh dấu nổi bật"
        >
          <Star size={17} fill={isFeatured ? "currentColor" : "none"} />
        </button>
      </div>

      <div className="space-y-3 p-3">
        <div className="min-w-0">
          <p className="line-clamp-2 min-h-[40px] text-sm font-black leading-5 text-neutral-950">
            {item.name || "Chưa đặt tên"}
          </p>

          <p className="mt-1 truncate text-xs font-bold text-neutral-400">
            {categoryName}
          </p>
        </div>

        <div>
          <div className="flex flex-wrap items-baseline gap-2">
            <p className="text-base font-black text-neutral-950">
              {formatPrice(price)}
            </p>

            {hasSale && (
              <p className="text-xs font-bold text-neutral-400 line-through">
                {formatPrice(oldPrice)}
              </p>
            )}
          </div>

          {Array.isArray(item.sizes) && item.sizes.length > 0 && (
            <p className="mt-1 text-xs font-bold text-neutral-400">
              {item.sizes.length} size/lựa chọn
            </p>
          )}
        </div>

        <div className="flex flex-wrap gap-1.5">
          <StatusBadge
            active={isAvailable}
            label={isAvailable ? "Còn bán" : "Tạm hết"}
          />

          {isFeatured && <StatusBadge active label="Nổi bật" tone="yellow" />}
        </div>

        <div className="grid grid-cols-3 gap-1.5 border-t border-neutral-100 pt-3">
          <button
            type="button"
            onClick={() => onEdit(item)}
            className="inline-flex h-9 items-center justify-center gap-1 rounded-[8px] bg-neutral-100 text-xs font-black text-neutral-700 transition hover:bg-neutral-200"
            title="Sửa sản phẩm"
          >
            <Edit size={14} />
          </button>

          <button
            type="button"
            onClick={() => onToggleAvailable(item)}
            className={cn(
              "inline-flex h-9 items-center justify-center gap-1 rounded-[8px] text-xs font-black transition",
              isAvailable
                ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                : "bg-neutral-100 text-neutral-500 hover:bg-neutral-200"
            )}
            title={isAvailable ? "Tắt bán" : "Bật bán"}
          >
            {isAvailable ? <Eye size={14} /> : <EyeOff size={14} />}
          </button>

          <button
            type="button"
            onClick={() => onDelete(item.id)}
            className="inline-flex h-9 items-center justify-center gap-1 rounded-[8px] bg-red-50 text-xs font-black text-red-600 transition hover:bg-red-100"
            title="Xóa sản phẩm"
          >
            <Trash size={14} />
          </button>
        </div>
      </div>
    </article>
  );
}

function StatusBadge({ active, label, tone = "green" }) {
  const className =
    tone === "yellow"
      ? "bg-yellow-50 text-yellow-700"
      : active
        ? "bg-emerald-50 text-emerald-700"
        : "bg-neutral-100 text-neutral-500";

  return (
    <span className={cn("rounded-[7px] px-2 py-1 text-[10px] font-black", className)}>
      {label}
    </span>
  );
}

function PaginationBar({
  page,
  totalPages,
  startIndex,
  endIndex,
  totalItems,
  onPrev,
  onNext,
  setPage,
}) {
  const pages = [];

  for (let i = 1; i <= totalPages; i += 1) {
    if (
      i === 1 ||
      i === totalPages ||
      Math.abs(i - page) <= 1
    ) {
      pages.push(i);
    }
  }

  const uniquePages = [...new Set(pages)];

  return (
    <div className="mt-5 flex flex-col gap-3 border-t border-neutral-200 pt-4 lg:flex-row lg:items-center lg:justify-between">
      <p className="text-center text-sm font-bold text-neutral-500 lg:text-left">
        Hiển thị {Math.min(startIndex + 1, totalItems)}-
        {Math.min(endIndex, totalItems)} trong {totalItems} sản phẩm
      </p>

      <div className="flex flex-wrap items-center justify-center gap-2">
        <button
          type="button"
          onClick={onPrev}
          disabled={page <= 1}
          className="inline-flex h-10 items-center justify-center gap-1 rounded-[8px] border border-neutral-200 bg-white px-3 text-sm font-black text-neutral-700 transition hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <ChevronLeft size={16} />
          Trước
        </button>

        {uniquePages.map((pageNumber, index) => {
          const previousPage = uniquePages[index - 1];
          const showDots = previousPage && pageNumber - previousPage > 1;

          return (
            <span key={pageNumber} className="inline-flex items-center gap-2">
              {showDots && (
                <span className="px-1 text-sm font-black text-neutral-300">
                  ...
                </span>
              )}

              <button
                type="button"
                onClick={() => setPage(pageNumber)}
                className={cn(
                  "grid h-10 w-10 place-items-center rounded-[8px] text-sm font-black transition",
                  page === pageNumber
                    ? "bg-neutral-950 text-white"
                    : "border border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-50"
                )}
              >
                {pageNumber}
              </button>
            </span>
          );
        })}

        <button
          type="button"
          onClick={onNext}
          disabled={page >= totalPages}
          className="inline-flex h-10 items-center justify-center gap-1 rounded-[8px] border border-neutral-200 bg-white px-3 text-sm font-black text-neutral-700 transition hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Sau
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="rounded-[14px] border border-dashed border-neutral-200 bg-neutral-50 px-5 py-12 text-center">
      <PackageOpen size={38} className="mx-auto text-neutral-400" />

      <p className="mt-3 text-base font-black text-neutral-800">
        Không tìm thấy sản phẩm
      </p>

      <p className="mx-auto mt-1 max-w-sm text-sm leading-6 text-neutral-500">
        Thử đổi từ khóa tìm kiếm, danh mục hoặc bộ lọc trạng thái.
      </p>
    </div>
  );
}

function LoadingGrid() {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
      {Array.from({ length: 10 }).map((_, index) => (
        <div
          key={index}
          className="overflow-hidden rounded-[14px] border border-neutral-200 bg-white shadow-sm"
        >
          <div className="aspect-square animate-pulse bg-neutral-100" />

          <div className="space-y-3 p-3">
            <div className="h-4 w-4/5 animate-pulse rounded bg-neutral-100" />
            <div className="h-3 w-1/2 animate-pulse rounded bg-neutral-100" />
            <div className="h-5 w-2/3 animate-pulse rounded bg-neutral-100" />
            <div className="grid grid-cols-3 gap-1.5">
              <div className="h-9 animate-pulse rounded-[8px] bg-neutral-100" />
              <div className="h-9 animate-pulse rounded-[8px] bg-neutral-100" />
              <div className="h-9 animate-pulse rounded-[8px] bg-neutral-100" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}