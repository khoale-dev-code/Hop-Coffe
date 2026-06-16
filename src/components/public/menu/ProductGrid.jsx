import { useEffect, useMemo, useRef, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Coffee,
  Eye,
  ImageIcon,
  Star,
  X,
} from "lucide-react";
import { cn, formatPrice } from "./publicMenuUtils";

// ─── Helpers ────────────────────────────────────────────────────────────────

function getItemImages(item) {
  if (Array.isArray(item.images) && item.images.length > 0) {
    return item.images
      .map((image, index) => {
        if (typeof image === "string") {
          return { url: image, name: `${item.name || "Sản phẩm"} ${index + 1}` };
        }
        return {
          url: image?.url || "",
          name: image?.name || `${item.name || "Sản phẩm"} ${index + 1}`,
        };
      })
      .filter((img) => img.url);
  }

  if (Array.isArray(item.imageUrls) && item.imageUrls.length > 0) {
    return item.imageUrls
      .map((url, index) => ({ url, name: `${item.name || "Sản phẩm"} ${index + 1}` }))
      .filter((img) => img.url);
  }

  if (item.imageUrl) {
    return [{ url: item.imageUrl, name: item.name || "Sản phẩm" }];
  }

  return [];
}

function getItemSizes(item) {
  if (Array.isArray(item.sizes) && item.sizes.length > 0) {
    return item.sizes.map((size, index) => ({
      id: size.id || `${size.name || "size"}-${index}`,
      name: size.name || size.label || `Size ${index + 1}`,
      price: Number(size.price || item.price || 0),
      oldPrice: Number(size.oldPrice || 0),
      description: size.description || "",
    }));
  }

  if (Array.isArray(item.variants) && item.variants.length > 0) {
    return item.variants.map((variant, index) => ({
      id: variant.id || `${variant.name || "variant"}-${index}`,
      name: variant.name || variant.label || `Variant ${index + 1}`,
      price: Number(variant.price || item.price || 0),
      oldPrice: Number(variant.oldPrice || 0),
      description: variant.description || "",
    }));
  }

  return [
    {
      id: "default",
      name: "Mặc định",
      price: Number(item.price || 0),
      oldPrice: Number(item.oldPrice || 0),
      description: "",
    },
  ];
}

function getMinSizePrice(item) {
  if (!Array.isArray(item.sizes) || item.sizes.length === 0) {
    return Number(item.price || 0);
  }
  const sizes = getItemSizes(item);
  return Math.min(...sizes.map((s) => Number(s.price || 0)));
}

// ─── ProductGrid ─────────────────────────────────────────────────────────────

export default function ProductGrid({ items, shop, emptyText }) {
  const [selectedItem, setSelectedItem] = useState(null);

  if (items.length === 0) {
    return (
      <div className="rounded-xl border border-neutral-200 bg-white px-5 py-12 text-center shadow-sm sm:p-12">
        <div className="mx-auto grid h-14 w-14 place-items-center rounded-xl bg-neutral-50 text-[#6B4B3E] ring-1 ring-neutral-200">
          <Coffee size={26} />
        </div>
        <h3 className="mt-5 text-lg font-bold text-[#2F221C] sm:text-xl">
          Không tìm thấy sản phẩm
        </h3>
        <p className="mt-2 text-sm leading-6 text-[#73584D]">
          {emptyText || "Hiện chưa có món nào phù hợp."}
        </p>
      </div>
    );
  }

  return (
    <>
      {/* Grid: 2 cột trên mọi kích thước, tăng lên 3-4 ở màn lớn */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 xl:grid-cols-4">
        {items.map((item, index) => (
          <ProductCard
            key={item.id}
            item={item}
            shop={shop}
            index={index}
            onOpen={() => setSelectedItem(item)}
          />
        ))}
      </div>

      <ProductDetailModal
        item={selectedItem}
        shop={shop}
        onClose={() => setSelectedItem(null)}
      />
    </>
  );
}

// ─── ProductCard ──────────────────────────────────────────────────────────────

function ProductCard({ item, shop, index, onOpen }) {
  const images = getItemImages(item);
  const firstImage = images[0];
  const sizes = getItemSizes(item);

  const isUnavailable = item.isAvailable === false;
  const hasSizes = Array.isArray(item.sizes) && item.sizes.length > 0;
  const displayPrice = hasSizes ? getMinSizePrice(item) : Number(item.price || 0);
  const hasSale = Number(item.oldPrice || 0) > Number(displayPrice || 0);
  const brandName = shop?.name || "Hớp Coffee";

  return (
    <button
      type="button"
      onClick={isUnavailable ? undefined : onOpen}
      style={{ animationDelay: `${Math.min(index, 10) * 34}ms` }}
      className={cn(
        // Bố cục: luôn đứng (flex-col) trên mọi breakpoint
        "hop-reveal group flex flex-col overflow-hidden rounded-xl border border-neutral-200 bg-white text-left",
        "transition-all duration-200",
        // Hover chỉ khi còn hàng
        !isUnavailable && [
          "cursor-pointer",
          "hover:-translate-y-0.5 hover:border-[#C9A58D] hover:shadow-[0_12px_28px_rgba(47,34,28,0.10)]",
          "active:scale-[0.98] active:shadow-none",
        ],
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7CAEB8] focus-visible:ring-offset-2",
        isUnavailable && "cursor-default opacity-50 grayscale"
      )}
    >
      {/* ── Ảnh ── */}
      <div className="relative bg-neutral-50">
        <div className="aspect-square w-full overflow-hidden">
          {firstImage?.url ? (
            <img
              src={firstImage.url}
              alt={firstImage.name || item.name}
              loading="lazy"
              className="h-full w-full object-contain p-3 transition-transform duration-500 group-hover:scale-[1.05] sm:p-4"
            />
          ) : (
            <div className="grid h-full w-full place-items-center text-[#C9A58D]">
              <Coffee size={36} />
            </div>
          )}
        </div>

        {/* Badges trên-trái */}
        <div className="absolute left-2 top-2 flex flex-wrap gap-1">
          {item.isFeatured && (
            <span className="inline-flex items-center gap-1 rounded-md bg-[#B22830] px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-white">
              <Star size={8} aria-hidden="true" />
              Hot
            </span>
          )}
          {hasSale && !isUnavailable && (
            <span className="rounded-md bg-white px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-[#B22830] shadow-sm ring-1 ring-red-100">
              Sale
            </span>
          )}
          {isUnavailable && (
            <span className="rounded-md bg-neutral-900 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-white">
              Tạm hết
            </span>
          )}
        </div>

        {/* Chips dưới-phải */}
        {(images.length > 1 || hasSizes) && (
          <div className="absolute bottom-2 right-2 flex items-center gap-1">
            {images.length > 1 && (
              <span className="inline-flex items-center gap-1 rounded-md bg-white/95 px-1.5 py-0.5 text-[9px] font-bold text-[#6B4B3E] shadow-sm ring-1 ring-neutral-200">
                <ImageIcon size={9} aria-hidden="true" />
                {images.length}
              </span>
            )}
            {hasSizes && (
              <span className="rounded-md bg-white/95 px-1.5 py-0.5 text-[9px] font-bold text-[#4E8791] shadow-sm ring-1 ring-neutral-200">
                {sizes.length} size
              </span>
            )}
          </div>
        )}
      </div>

      {/* ── Nội dung ── */}
      <div className="flex flex-1 flex-col px-3 pb-3 pt-2.5 sm:px-3.5 sm:pb-3.5">
        {/* Brand */}
        <p className="truncate text-[9px] font-bold uppercase tracking-[0.12em] text-[#9B7A68] sm:text-[10px]">
          {brandName}
        </p>

        {/* Tên sản phẩm — tối đa 2 dòng, chiều cao cố định để grid đều */}
        <h3 className="mt-1 line-clamp-2 min-h-[36px] text-[13px] font-bold leading-snug text-[#2F221C] sm:min-h-[40px] sm:text-sm">
          {item.name}
        </h3>

        {/* Giá + nút */}
        <div className="mt-auto pt-2.5">
          {hasSale && (
            <p className="mb-0.5 text-[11px] text-neutral-400 line-through">
              {formatPrice(item.oldPrice)}
            </p>
          )}
          <p className="text-sm font-bold text-[#B22830] sm:text-[15px]">
            {hasSizes ? `Từ ${formatPrice(displayPrice)}` : formatPrice(displayPrice)}
          </p>

          {/* CTA — touch target tối thiểu 44px */}
          <span
            className={cn(
              "mt-2.5 flex min-h-[40px] w-full items-center justify-center gap-1.5 rounded-lg border border-neutral-200 px-2 text-[10px] font-bold uppercase tracking-[0.07em] text-[#6B4B3E]",
              "transition-colors duration-200",
              !isUnavailable && "group-hover:border-[#2F221C] group-hover:bg-[#2F221C] group-hover:text-white"
            )}
          >
            <Eye size={12} aria-hidden="true" />
            Chi tiết
          </span>
        </div>
      </div>
    </button>
  );
}

// ─── ProductDetailModal ───────────────────────────────────────────────────────

function ProductDetailModal({ item, shop, onClose }) {
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [selectedSizeId, setSelectedSizeId] = useState("");
  // Ref để track touch swipe trên ảnh
  const touchStartX = useRef(null);
  const bodyRef = useRef(null);

  const images = useMemo(() => (item ? getItemImages(item) : []), [item]);
  const sizes = useMemo(() => (item ? getItemSizes(item) : []), [item]);

  const activeImage = images[activeImageIndex] || images[0];
  const selectedSize = sizes.find((s) => s.id === selectedSizeId) || sizes[0];
  const hasRealSizes = Array.isArray(item?.sizes) && item.sizes.length > 0;
  const hasSelectedSizeSale =
    Number(selectedSize?.oldPrice || 0) > Number(selectedSize?.price || 0);

  // Reset khi item thay đổi
  useEffect(() => {
    setActiveImageIndex(0);
    setSelectedSizeId("");
    // Scroll modal body về đầu
    if (bodyRef.current) bodyRef.current.scrollTop = 0;
  }, [item?.id]);

  // Khóa scroll body + phím Esc
  useEffect(() => {
    if (!item) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKey = (e) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") goPrev();
      if (e.key === "ArrowRight") goNext();
    };

    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [item, activeImageIndex, images.length]);

  if (!item) return null;

  function goPrev() {
    if (images.length <= 1) return;
    setActiveImageIndex((p) => (p === 0 ? images.length - 1 : p - 1));
  }

  function goNext() {
    if (images.length <= 1) return;
    setActiveImageIndex((p) => (p === images.length - 1 ? 0 : p + 1));
  }

  // Swipe trên ảnh
  function onTouchStart(e) {
    touchStartX.current = e.touches[0].clientX;
  }
  function onTouchEnd(e) {
    if (touchStartX.current === null) return;
    const delta = e.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(delta) > 40) delta < 0 ? goNext() : goPrev();
    touchStartX.current = null;
  }

  return (
    /* Backdrop */
    <div
      className="fixed inset-0 z-[100] flex flex-col justify-end bg-black/50 backdrop-blur-[2px] sm:items-center sm:justify-center sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-label={`Chi tiết: ${item.name}`}
    >
      {/* Click backdrop để đóng */}
      <button
        type="button"
        onClick={onClose}
        className="absolute inset-0 cursor-default"
        aria-label="Đóng"
        tabIndex={-1}
      />

      {/* Sheet */}
      <div className="relative z-10 flex max-h-[94dvh] w-full flex-col overflow-hidden rounded-t-2xl bg-white shadow-2xl sm:max-h-[90vh] sm:max-w-3xl sm:rounded-2xl">

        {/* ── Drag pill (mobile only) ── */}
        <div className="flex justify-center pb-1 pt-2 sm:hidden" aria-hidden="true">
          <div className="h-1 w-9 rounded-full bg-neutral-200" />
        </div>

        {/* ── Header sticky ── */}
        <div className="flex shrink-0 items-center gap-3 border-b border-neutral-100 bg-white px-4 py-2.5 sm:px-5 sm:py-3">
          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#9B7A68]">
              {shop?.name || "Hớp Coffee"}
            </p>
            <p className="mt-0.5 line-clamp-1 text-sm font-bold text-[#2F221C] sm:text-base">
              {item.name}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-neutral-100 text-[#2F221C] transition hover:bg-neutral-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7CAEB8]"
            aria-label="Đóng"
          >
            <X size={18} />
          </button>
        </div>

        {/* ── Scroll body ── */}
        <div ref={bodyRef} className="min-h-0 flex-1 overflow-y-auto overscroll-contain">

          {/* Layout: stack trên mobile, 2 cột trên lg */}
          <div className="lg:grid lg:grid-cols-[1fr_1.1fr]">

            {/* ── Cột ảnh ── */}
            <div className="border-b border-neutral-100 lg:border-b-0 lg:border-r">

              {/* Main image với swipe support */}
              <div
                className="relative select-none overflow-hidden bg-neutral-50"
                onTouchStart={onTouchStart}
                onTouchEnd={onTouchEnd}
              >
                <div className="flex h-[280px] items-center justify-center sm:h-[320px] lg:h-[420px]">
                  {activeImage?.url ? (
                    <img
                      key={activeImage.url}
                      src={activeImage.url}
                      alt={activeImage.name || item.name}
                      className="max-h-full max-w-full object-contain p-4 sm:p-6"
                    />
                  ) : (
                    <div className="grid h-full w-full place-items-center text-[#C9A58D]">
                      <Coffee size={52} />
                    </div>
                  )}
                </div>

                {/* Nav prev/next — chỉ hiện khi có nhiều ảnh */}
                {images.length > 1 && (
                  <>
                    <button
                      type="button"
                      onClick={goPrev}
                      className="absolute left-2 top-1/2 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-xl bg-white/90 text-[#6B4B3E] shadow-sm ring-1 ring-neutral-200 transition hover:bg-white"
                      aria-label="Ảnh trước"
                    >
                      <ChevronLeft size={18} />
                    </button>
                    <button
                      type="button"
                      onClick={goNext}
                      className="absolute right-2 top-1/2 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-xl bg-white/90 text-[#6B4B3E] shadow-sm ring-1 ring-neutral-200 transition hover:bg-white"
                      aria-label="Ảnh sau"
                    >
                      <ChevronRight size={18} />
                    </button>
                  </>
                )}
              </div>

              {/* Dot indicators — nhỏ gọn hơn thumbnail strip trên mobile */}
              {images.length > 1 && (
                <div className="flex items-center justify-center gap-1.5 py-3">
                  {images.map((_, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setActiveImageIndex(idx)}
                      aria-label={`Xem ảnh ${idx + 1}`}
                      className={cn(
                        "h-1.5 rounded-full transition-all duration-200",
                        activeImageIndex === idx
                          ? "w-5 bg-[#6B4B3E]"
                          : "w-1.5 bg-neutral-300 hover:bg-neutral-400"
                      )}
                    />
                  ))}
                </div>
              )}

              {/* Thumbnail strip — chỉ hiện khi có ≥ 3 ảnh */}
              {images.length >= 3 && (
                <div
                  className="hop-hide-scroll flex gap-2 overflow-x-auto px-4 pb-3 lg:px-5"
                  role="list"
                  aria-label="Tất cả ảnh sản phẩm"
                >
                  {images.map((img, idx) => (
                    <button
                      key={`${img.url}-${idx}`}
                      type="button"
                      role="listitem"
                      onClick={() => setActiveImageIndex(idx)}
                      aria-label={`Ảnh ${idx + 1}`}
                      aria-current={activeImageIndex === idx ? "true" : undefined}
                      className={cn(
                        "h-12 w-12 shrink-0 overflow-hidden rounded-lg border bg-white transition-all sm:h-14 sm:w-14",
                        activeImageIndex === idx
                          ? "border-[#6B4B3E] ring-2 ring-[#6B4B3E]/15"
                          : "border-neutral-200 hover:border-[#C9A58D]"
                      )}
                    >
                      <img
                        src={img.url}
                        alt={img.name || item.name}
                        className="h-full w-full object-contain p-1"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* ── Cột thông tin ── */}
            <div className="p-4 sm:p-5 lg:p-6">

              {/* Tên + badges — ẩn trên mobile (đã có ở header) */}
              <div className="hidden lg:block">
                <h2 className="text-2xl font-bold leading-snug tracking-tight text-[#2F221C]">
                  {item.name}
                </h2>
              </div>

              {/* Status badges */}
              <div className={cn("flex flex-wrap gap-2", "lg:mt-3")}>
                {item.isFeatured && (
                  <span className="inline-flex items-center gap-1 rounded-lg bg-[#B22830] px-2.5 py-1 text-[10px] font-bold uppercase text-white">
                    <Star size={10} aria-hidden="true" />
                    Nổi bật
                  </span>
                )}
                <span
                  className={cn(
                    "rounded-lg px-2.5 py-1 text-[10px] font-bold uppercase",
                    item.isAvailable === false
                      ? "bg-neutral-100 text-neutral-500"
                      : "bg-[#E7F2F4] text-[#4E8791]"
                  )}
                >
                  {item.isAvailable === false ? "Tạm hết" : "Còn bán"}
                </span>
                {hasRealSizes && (
                  <span className="rounded-lg bg-neutral-100 px-2.5 py-1 text-[10px] font-bold uppercase text-neutral-600">
                    {sizes.length} size
                  </span>
                )}
              </div>

              {/* ── Giá ── */}
              <div className="mt-4 rounded-xl border border-neutral-100 bg-neutral-50 p-3.5 sm:mt-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-bold text-[#73584D]">Giá sản phẩm</p>
                    {selectedSize?.name && (
                      <p className="mt-0.5 text-[11px] text-neutral-500">
                        {hasRealSizes ? selectedSize.name : "Giá mặc định"}
                      </p>
                    )}
                  </div>
                  <div className="shrink-0 text-right">
                    {hasSelectedSizeSale && (
                      <p className="text-xs text-neutral-400 line-through">
                        {formatPrice(selectedSize.oldPrice)}
                      </p>
                    )}
                    <p className="mt-0.5 text-2xl font-bold text-[#B22830] sm:text-3xl">
                      {formatPrice(selectedSize?.price || item.price)}
                    </p>
                  </div>
                </div>
              </div>

              {/* ── Size selector ── */}
              {hasRealSizes && (
                <div className="mt-4 sm:mt-5">
                  <p className="mb-3 text-sm font-bold text-[#2F221C]">
                    Size / lựa chọn ly
                  </p>

                  {/*
                    Grid 2 cột — không scroll ngang (người dùng mobile thường
                    không biết phải swipe ngang). Wrap tự nhiên khi nhiều size.
                  */}
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
                    {sizes.map((size) => {
                      const isActive = selectedSize?.id === size.id;
                      const hasSizeSale =
                        Number(size.oldPrice || 0) > Number(size.price || 0);

                      return (
                        <button
                          key={size.id}
                          type="button"
                          onClick={() => setSelectedSizeId(size.id)}
                          className={cn(
                            // Touch target tối thiểu 80px chiều cao
                            "flex min-h-[80px] flex-col justify-between rounded-xl border p-3 text-left transition-all duration-150 sm:p-3.5",
                            isActive
                              ? "border-[#6B4B3E] bg-[#FAF5F1] ring-2 ring-[#6B4B3E]/10"
                              : "border-neutral-200 bg-white hover:border-[#C9A58D]",
                            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7CAEB8]"
                          )}
                          aria-pressed={isActive}
                        >
                          <div className="min-w-0">
                            <p className="truncate text-[13px] font-bold text-[#2F221C]">
                              {size.name}
                            </p>
                            {size.description && (
                              <p className="mt-0.5 line-clamp-2 text-[11px] leading-5 text-[#73584D]">
                                {size.description}
                              </p>
                            )}
                          </div>
                          <div className="mt-2">
                            {hasSizeSale && (
                              <p className="text-[10px] text-neutral-400 line-through">
                                {formatPrice(size.oldPrice)}
                              </p>
                            )}
                            <p className="text-[13px] font-bold text-[#B22830]">
                              {formatPrice(size.price)}
                            </p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* ── Mô tả ── */}
              {item.description && (
                <div className="mt-4 rounded-xl border border-neutral-100 bg-neutral-50 p-3.5 sm:mt-5">
                  <p className="mb-2 text-xs font-bold uppercase tracking-[0.1em] text-[#9B7A68]">
                    Mô tả sản phẩm
                  </p>
                  <p className="whitespace-pre-line text-sm leading-7 text-[#73584D]">
                    {item.description}
                  </p>
                </div>
              )}

              {/* ── Tags ── */}
              {Array.isArray(item.tags) && item.tags.length > 0 && (
                <div className="mt-4 sm:mt-5">
                  <p className="mb-2 text-xs font-bold uppercase tracking-[0.1em] text-[#9B7A68]">
                    Tags
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {item.tags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded-lg bg-[#FAF5F1] px-2.5 py-1 text-xs font-bold text-[#6B4B3E]"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Padding cuối để không bị footer che khuất */}
              <div className="h-2" aria-hidden="true" />
            </div>
          </div>
        </div>

        {/* ── Footer sticky ── */}
        <div
          className="shrink-0 border-t border-neutral-100 bg-white px-4 py-3 sm:px-5"
          // Safe area cho home indicator iPhone
          style={{ paddingBottom: "max(12px, env(safe-area-inset-bottom))" }}
        >
          <button
            type="button"
            onClick={onClose}
            className="flex min-h-[48px] w-full items-center justify-center rounded-xl bg-[#2F221C] px-5 text-sm font-bold uppercase tracking-[0.1em] text-white transition hover:bg-[#6B4B3E] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7CAEB8] focus-visible:ring-offset-2 active:scale-[0.98]"
          >
            Đóng chi tiết
          </button>
        </div>
      </div>
    </div>
  );
}