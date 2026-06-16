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

  const sizeOldPrices = sizes
    .map((size) => Number(size?.oldPrice || 0))
    .filter((price) => price > 0);

  if (sizeOldPrices.length > 0) return Math.min(...sizeOldPrices);

  return Number(item?.oldPrice || 0);
}

const PAGE_SIZE = 50;

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

  const sourceItems = canReorder ? sortedItems : filteredItems;

  const totalPages = Math.max(1, Math.ceil(sourceItems.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const startIndex = (safePage - 1) * PAGE_SIZE;
  const endIndex = startIndex + PAGE_SIZE;

  const paginatedItems = useMemo(() => {
    return sourceItems.slice(startIndex, endIndex);
  }, [sourceItems, startIndex, endIndex]);

  const paginatedItemIds = useMemo(() => {
    return paginatedItems.map((item) => item.id);
  }, [paginatedItems]);

  useEffect(() => {
    setPage(1);
  }, [searchText, categoryFilter, statusFilter]);

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
    <section className="overflow-hidden rounded-[16px] border border-neutral-200 bg-white shadow-sm">
      <div className="border-b border-neutral-200 bg-white p-3 sm:p-4 lg:p-5">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div className="min-w-0">
            <p className="text-[11px] font-black uppercase tracking-[0.16em] text-[#7CAEB8]">
              Product list
            </p>

            <h2 className="mt-1 text-lg font-black tracking-tight text-neutral-950 sm:text-2xl">
              Danh sách sản phẩm
            </h2>

            <p className="mt-1 max-w-2xl text-xs font-medium leading-5 text-neutral-500 sm:text-sm sm:leading-6">
              {canReorder
                ? "Kéo icon sắp xếp trên sản phẩm để đổi thứ tự hiển thị."
                : "Đang dùng tìm kiếm/lọc. Xóa bộ lọc để bật kéo thả."}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2 sm:flex sm:items-center">
            <StatBox
              label="Hiển thị"
              value={`${sourceItems.length}/${sortedItems.length}`}
            />
            <StatBox label="Trang" value={`${safePage}/${totalPages}`} />
          </div>
        </div>

        <div className="mt-3 grid gap-2 md:grid-cols-2 xl:grid-cols-[minmax(0,1fr)_220px_220px_120px]">
          <div className="relative min-w-0 md:col-span-2 xl:col-span-1">
            <Search
              size={17}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400"
            />

            <input
              value={searchText}
              onChange={(event) => setSearchText(event.target.value)}
              placeholder="Tìm kiếm sản phẩm..."
              className="h-10 w-full rounded-[10px] border border-neutral-200 bg-white pl-10 pr-3 text-sm font-bold text-neutral-900 outline-none transition placeholder:text-neutral-400 focus:border-neutral-950 sm:h-11"
            />
          </div>

          <select
            value={categoryFilter}
            onChange={(event) => setCategoryFilter(event.target.value)}
            className="h-10 rounded-[10px] border border-neutral-200 bg-white px-3 text-sm font-black text-neutral-900 outline-none transition focus:border-neutral-950 sm:h-11"
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
            className="h-10 rounded-[10px] border border-neutral-200 bg-white px-3 text-sm font-black text-neutral-900 outline-none transition focus:border-neutral-950 sm:h-11"
          >
            <option value="all">Tất cả sản phẩm</option>
            <option value="available">Còn bán</option>
            <option value="unavailable">Tạm hết</option>
            <option value="featured">Nổi bật</option>
          </select>

          <div className="flex h-10 items-center justify-center rounded-[10px] border border-neutral-200 bg-neutral-50 px-3 text-sm font-black text-neutral-600 sm:h-11">
            50/trang
          </div>
        </div>

        {!canReorder && (
          <div className="mt-3 flex flex-col gap-2 rounded-[10px] border border-amber-100 bg-amber-50 px-3 py-2.5 text-xs font-bold leading-5 text-amber-700 sm:flex-row sm:items-center sm:justify-between">
            <span className="inline-flex items-center gap-2">
              <Filter size={14} />
              Đang lọc danh sách nên tạm tắt kéo thả.
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

      <div className="p-2.5 sm:p-4 lg:p-5">
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

function StatBox({ label, value }) {
  return (
    <div className="rounded-[10px] bg-neutral-50 px-3 py-2 text-center ring-1 ring-neutral-200">
      <p className="text-[10px] font-bold text-neutral-400 sm:text-[11px]">
        {label}
      </p>

      <p className="text-sm font-black text-neutral-950">{value}</p>
    </div>
  );
}

function ProductGrid({ children }) {
  return (
    <div className="grid gap-2.5 sm:grid-cols-2 sm:gap-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
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

  function handleEditClick(event) {
    event.stopPropagation();
    onEdit(item);
  }

  return (
    <article
      className={cn(
        "group relative flex min-w-0 overflow-hidden rounded-[13px] border bg-white shadow-sm transition sm:block sm:rounded-[14px]",
        isDragging
          ? "z-50 scale-[1.01] border-neutral-950 shadow-2xl"
          : "border-neutral-200 hover:border-neutral-300 hover:shadow-md"
      )}
    >
      <div className="relative h-[112px] w-[112px] shrink-0 bg-neutral-50 min-[390px]:h-[124px] min-[390px]:w-[124px] sm:h-auto sm:w-full sm:aspect-square">
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
              className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.03]"
            />
          )
        ) : (
          <div className="grid h-full place-items-center text-neutral-400">
            <ImagePlus size={28} />
          </div>
        )}

        <div className="absolute left-1.5 top-1.5 flex flex-wrap gap-1 sm:left-2 sm:top-2">
          <span className="rounded-[7px] bg-black/70 px-1.5 py-0.5 text-[9px] font-black text-white backdrop-blur sm:px-2 sm:py-1 sm:text-[10px]">
            #{index + 1}
          </span>

          {firstMedia?.type === "video" && (
            <span className="inline-flex items-center gap-1 rounded-[7px] bg-black/70 px-1.5 py-0.5 text-[9px] font-black text-white backdrop-blur sm:px-2 sm:py-1 sm:text-[10px]">
              <Video size={10} />
              Video
            </span>
          )}

          {media.length > 1 && (
            <span className="rounded-[7px] bg-black/70 px-1.5 py-0.5 text-[9px] font-black text-white backdrop-blur sm:px-2 sm:py-1 sm:text-[10px]">
              +{media.length - 1}
            </span>
          )}
        </div>

        <div className="absolute right-1.5 top-1.5 flex gap-1 sm:right-2 sm:top-2 sm:gap-1.5">
          <IconButton
            onClick={handleEditClick}
            title="Sửa sản phẩm"
            className="bg-white/95 text-neutral-800 hover:bg-neutral-950 hover:text-white"
          >
            <Edit size={14} />
          </IconButton>

          <IconButton
            onClick={() => onToggleFeatured(item)}
            title="Đánh dấu nổi bật"
            className={
              isFeatured
                ? "bg-yellow-400 text-neutral-950 hover:bg-yellow-300"
                : "bg-white/95 text-neutral-500 hover:text-yellow-600"
            }
          >
            <Star size={14} fill={isFeatured ? "currentColor" : "none"} />
          </IconButton>
        </div>

        {dragHandleProps && (
          <button
            type="button"
            {...dragHandleProps}
            className="absolute bottom-1.5 left-1.5 grid h-8 w-8 cursor-grab touch-none place-items-center rounded-[8px] bg-white/95 text-neutral-700 shadow active:cursor-grabbing sm:bottom-2 sm:left-2 sm:h-9 sm:w-9 sm:rounded-[9px]"
            title="Kéo để sắp xếp"
          >
            <GripVertical size={16} />
          </button>
        )}
      </div>

      <div className="flex min-w-0 flex-1 flex-col justify-between gap-2 p-2.5 sm:block sm:space-y-2.5 sm:p-3">
        <div className="min-w-0">
          <p className="line-clamp-2 text-sm font-black leading-5 text-neutral-950 sm:min-h-[38px]">
            {item.name || "Chưa đặt tên"}
          </p>

          <p className="mt-0.5 truncate text-xs font-bold text-neutral-400 sm:mt-1">
            {categoryName}
          </p>
        </div>

        <div>
          <div className="flex flex-wrap items-baseline gap-1.5 sm:gap-2">
            <p className="text-sm font-black text-neutral-950 sm:text-base">
              {formatPrice(price)}
            </p>

            {hasSale && (
              <p className="text-[11px] font-bold text-neutral-400 line-through sm:text-xs">
                {formatPrice(oldPrice)}
              </p>
            )}
          </div>

          {Array.isArray(item.sizes) && item.sizes.length > 0 && (
            <p className="mt-0.5 text-[11px] font-bold text-neutral-400 sm:text-xs">
              {item.sizes.length} size/lựa chọn
            </p>
          )}
        </div>

        <div className="flex min-h-[22px] flex-wrap gap-1.5 sm:min-h-[24px]">
          <StatusBadge
            active={isAvailable}
            label={isAvailable ? "Còn bán" : "Tạm hết"}
          />

          {isFeatured && <StatusBadge active label="Nổi bật" tone="yellow" />}
        </div>

        <div className="grid grid-cols-3 gap-1.5 border-t border-neutral-100 pt-2 sm:pt-2.5">
          <IconActionButton
            onClick={handleEditClick}
            title="Sửa sản phẩm"
            className="bg-neutral-950 text-white hover:bg-neutral-800"
          >
            <Edit size={14} />
          </IconActionButton>

          <IconActionButton
            onClick={() => onToggleAvailable(item)}
            title={isAvailable ? "Tắt bán" : "Bật bán"}
            className={
              isAvailable
                ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                : "bg-neutral-100 text-neutral-500 hover:bg-neutral-200"
            }
          >
            {isAvailable ? <Eye size={14} /> : <EyeOff size={14} />}
          </IconActionButton>

          <IconActionButton
            onClick={() => onDelete(item.id)}
            title="Xóa sản phẩm"
            className="bg-red-50 text-red-600 hover:bg-red-100"
          >
            <Trash size={14} />
          </IconActionButton>
        </div>
      </div>
    </article>
  );
}

function IconButton({ children, onClick, title, className = "" }) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      aria-label={title}
      className={cn(
        "grid h-8 w-8 place-items-center rounded-[8px] shadow transition backdrop-blur sm:h-9 sm:w-9 sm:rounded-[9px]",
        className
      )}
    >
      {children}
    </button>
  );
}

function IconActionButton({ children, onClick, title, className = "" }) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      aria-label={title}
      className={cn(
        "inline-flex h-8 items-center justify-center rounded-[8px] text-xs font-black transition sm:h-9 sm:rounded-[9px]",
        className
      )}
    >
      {children}
    </button>
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
    <span
      className={cn(
        "rounded-[7px] px-2 py-1 text-[10px] font-black",
        className
      )}
    >
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
    if (i === 1 || i === totalPages || Math.abs(i - page) <= 1) {
      pages.push(i);
    }
  }

  const uniquePages = [...new Set(pages)];

  return (
    <div className="mt-4 flex flex-col gap-3 border-t border-neutral-200 pt-4 lg:flex-row lg:items-center lg:justify-between">
      <p className="text-center text-xs font-bold text-neutral-500 sm:text-sm lg:text-left">
        Hiển thị {Math.min(startIndex + 1, totalItems)}-
        {Math.min(endIndex, totalItems)} trong {totalItems} sản phẩm
      </p>

      <div className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-2">
        <button
          type="button"
          onClick={onPrev}
          disabled={page <= 1}
          className="inline-flex h-9 items-center justify-center gap-1 rounded-[8px] border border-neutral-200 bg-white px-3 text-xs font-black text-neutral-700 transition hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-40 sm:h-10 sm:text-sm"
        >
          <ChevronLeft size={15} />
          Trước
        </button>

        {uniquePages.map((pageNumber, index) => {
          const previousPage = uniquePages[index - 1];
          const showDots = previousPage && pageNumber - previousPage > 1;

          return (
            <span key={pageNumber} className="inline-flex items-center gap-1.5">
              {showDots && (
                <span className="px-0.5 text-sm font-black text-neutral-300">
                  ...
                </span>
              )}

              <button
                type="button"
                onClick={() => setPage(pageNumber)}
                className={cn(
                  "grid h-9 w-9 place-items-center rounded-[8px] text-xs font-black transition sm:h-10 sm:w-10 sm:text-sm",
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
          className="inline-flex h-9 items-center justify-center gap-1 rounded-[8px] border border-neutral-200 bg-white px-3 text-xs font-black text-neutral-700 transition hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-40 sm:h-10 sm:text-sm"
        >
          Sau
          <ChevronRight size={15} />
        </button>
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="rounded-[14px] border border-dashed border-neutral-200 bg-neutral-50 px-5 py-10 text-center sm:py-12">
      <PackageOpen size={36} className="mx-auto text-neutral-400" />

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
    <div className="grid gap-2.5 sm:grid-cols-2 sm:gap-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
      {Array.from({ length: 10 }).map((_, index) => (
        <div
          key={index}
          className="flex overflow-hidden rounded-[13px] border border-neutral-200 bg-white shadow-sm sm:block sm:rounded-[14px]"
        >
          <div className="h-[112px] w-[112px] shrink-0 animate-pulse bg-neutral-100 min-[390px]:h-[124px] min-[390px]:w-[124px] sm:aspect-square sm:h-auto sm:w-full" />

          <div className="min-w-0 flex-1 space-y-2 p-2.5 sm:space-y-3 sm:p-3">
            <div className="h-4 w-4/5 animate-pulse rounded bg-neutral-100" />
            <div className="h-3 w-1/2 animate-pulse rounded bg-neutral-100" />
            <div className="h-5 w-2/3 animate-pulse rounded bg-neutral-100" />

            <div className="grid grid-cols-3 gap-1.5">
              <div className="h-8 animate-pulse rounded-[8px] bg-neutral-100 sm:h-9" />
              <div className="h-8 animate-pulse rounded-[8px] bg-neutral-100 sm:h-9" />
              <div className="h-8 animate-pulse rounded-[8px] bg-neutral-100 sm:h-9" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}