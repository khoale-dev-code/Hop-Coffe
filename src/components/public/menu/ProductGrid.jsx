import { useEffect, useMemo, useState } from "react";
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

function getItemImages(item) {
  if (Array.isArray(item.images) && item.images.length > 0) {
    return item.images
      .map((image, index) => {
        if (typeof image === "string") {
          return {
            url: image,
            name: `${item.name || "Sản phẩm"} ${index + 1}`,
          };
        }

        return {
          url: image?.url || "",
          name: image?.name || `${item.name || "Sản phẩm"} ${index + 1}`,
        };
      })
      .filter((image) => image.url);
  }

  if (Array.isArray(item.imageUrls) && item.imageUrls.length > 0) {
    return item.imageUrls
      .map((url, index) => ({
        url,
        name: `${item.name || "Sản phẩm"} ${index + 1}`,
      }))
      .filter((image) => image.url);
  }

  if (item.imageUrl) {
    return [
      {
        url: item.imageUrl,
        name: item.name || "Sản phẩm",
      },
    ];
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
      name: variant.name || variant.label || `Size ${index + 1}`,
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
  return Math.min(...sizes.map((size) => Number(size.price || 0)));
}

export default function ProductGrid({ items, shop, emptyText }) {
  const [selectedItem, setSelectedItem] = useState(null);

  if (items.length === 0) {
    return (
      <div className="rounded-[8px] border border-neutral-200 bg-white px-5 py-10 text-center shadow-sm sm:p-10">
        <div className="mx-auto grid h-14 w-14 place-items-center rounded-[8px] bg-neutral-50 text-[#6B4B3E] ring-1 ring-neutral-200">
          <Coffee size={28} />
        </div>

        <h3 className="mt-5 text-xl font-black text-[#2F221C] sm:text-2xl">
          Không tìm thấy sản phẩm
        </h3>

        <p className="mt-2 text-sm font-medium leading-6 text-[#73584D] sm:text-base">
          {emptyText || "Hiện chưa có món nào phù hợp."}
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 gap-3 min-[430px]:grid-cols-2 sm:gap-4 md:grid-cols-3 xl:grid-cols-4">
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
      onClick={onOpen}
      style={{ animationDelay: `${Math.min(index, 10) * 34}ms` }}
      className={cn(
        "hop-reveal group overflow-hidden rounded-[8px] border border-neutral-200 bg-white text-left shadow-sm transition duration-300",
        "hover:-translate-y-0.5 hover:border-[#C9A58D] hover:shadow-[0_16px_36px_rgba(47,34,28,0.10)]",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7CAEB8]",
        "grid grid-cols-[116px_1fr] min-[430px]:block",
        isUnavailable && "opacity-55 grayscale"
      )}
    >
      <div className="relative border-r border-neutral-100 bg-white min-[430px]:border-b min-[430px]:border-r-0">
        <div className="aspect-square w-full overflow-hidden">
          {firstImage?.url ? (
            <img
              src={firstImage.url}
              alt={firstImage.name || item.name}
              loading="lazy"
              className="h-full w-full object-contain p-2.5 transition duration-500 group-hover:scale-[1.04] min-[430px]:p-4 sm:p-5"
            />
          ) : (
            <div className="grid h-full w-full place-items-center bg-neutral-50 text-[#6B4B3E]">
              <Coffee size={38} />
            </div>
          )}
        </div>

        <div className="absolute left-1.5 top-1.5 flex flex-wrap gap-1 min-[430px]:left-2 min-[430px]:top-2 min-[430px]:gap-1.5">
          {item.isFeatured && (
            <span className="inline-flex items-center gap-1 rounded-[4px] bg-[#B22830] px-1.5 py-0.5 text-[8px] font-black uppercase text-white shadow-sm min-[430px]:px-2 min-[430px]:py-1 min-[430px]:text-[9px]">
              <Star size={9} />
              Hot
            </span>
          )}

          {hasSale && !isUnavailable && (
            <span className="rounded-[4px] bg-white px-1.5 py-0.5 text-[8px] font-black uppercase text-[#B22830] shadow-sm ring-1 ring-red-100 min-[430px]:px-2 min-[430px]:py-1 min-[430px]:text-[9px]">
              Sale
            </span>
          )}

          {isUnavailable && (
            <span className="rounded-[4px] bg-neutral-900 px-1.5 py-0.5 text-[8px] font-black uppercase text-white min-[430px]:px-2 min-[430px]:py-1 min-[430px]:text-[9px]">
              Tạm hết
            </span>
          )}
        </div>

        <div className="absolute bottom-1.5 right-1.5 flex items-center gap-1 min-[430px]:bottom-2 min-[430px]:right-2">
          {images.length > 1 && (
            <span className="inline-flex items-center gap-1 rounded-[4px] bg-white/95 px-1.5 py-0.5 text-[9px] font-black text-[#6B4B3E] shadow-sm ring-1 ring-neutral-200 min-[430px]:px-2 min-[430px]:py-1 min-[430px]:text-[10px]">
              <ImageIcon size={10} />
              {images.length}
            </span>
          )}

          {hasSizes && (
            <span className="hidden rounded-[4px] bg-white/95 px-2 py-1 text-[10px] font-black text-[#4E8791] shadow-sm ring-1 ring-neutral-200 min-[430px]:inline-flex">
              {sizes.length} size
            </span>
          )}
        </div>
      </div>

      <div className="flex min-h-[116px] flex-col px-3 py-3 min-[430px]:min-h-[158px] min-[430px]:px-3 min-[430px]:pb-3 min-[430px]:pt-3 min-[430px]:text-center sm:min-h-[166px] sm:px-4 sm:pb-4">
        <p className="line-clamp-1 text-[9px] font-black uppercase tracking-[0.12em] text-[#9B7A68] min-[430px]:text-[10px]">
          {brandName}
        </p>

        <h3 className="mt-1.5 line-clamp-2 min-h-[36px] text-sm font-black leading-snug text-[#2F221C] min-[430px]:mt-2 min-[430px]:min-h-[40px] sm:min-h-[44px] sm:text-[15px]">
          {item.name}
        </h3>

        {hasSizes && (
          <p className="mt-1 line-clamp-1 text-[11px] font-bold text-neutral-400">
            {sizes.length} size
          </p>
        )}

        <div className="mt-auto pt-2 min-[430px]:pt-3">
          {hasSale && (
            <p className="mb-0.5 text-xs font-bold text-neutral-400 line-through">
              {formatPrice(item.oldPrice)}
            </p>
          )}

          <p className="text-[15px] font-black text-[#B22830] sm:text-lg">
            {hasSizes ? `Từ ${formatPrice(displayPrice)}` : formatPrice(displayPrice)}
          </p>

          <span className="mt-2 inline-flex w-full items-center justify-center gap-1.5 rounded-[6px] border border-neutral-200 bg-white px-2.5 py-2 text-[10px] font-black uppercase tracking-[0.06em] text-[#6B4B3E] transition group-hover:border-[#6B4B3E] group-hover:bg-[#2F221C] group-hover:text-white min-[430px]:mt-3 min-[430px]:gap-2 min-[430px]:px-3 min-[430px]:py-2.5 min-[430px]:text-[11px]">
            <Eye size={12} />
            Chi tiết
          </span>
        </div>
      </div>
    </button>
  );
}

function ProductDetailModal({ item, shop, onClose }) {
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [selectedSizeId, setSelectedSizeId] = useState("");

  const images = useMemo(() => {
    if (!item) return [];
    return getItemImages(item);
  }, [item]);

  const sizes = useMemo(() => {
    if (!item) return [];
    return getItemSizes(item);
  }, [item]);

  const activeImage = images[activeImageIndex] || images[0];
  const selectedSize =
    sizes.find((size) => size.id === selectedSizeId) || sizes[0];

  const hasRealSizes = Array.isArray(item?.sizes) && item.sizes.length > 0;

  const hasSelectedSizeSale =
    Number(selectedSize?.oldPrice || 0) > Number(selectedSize?.price || 0);

  useEffect(() => {
    setActiveImageIndex(0);
    setSelectedSizeId("");
  }, [item?.id]);

  useEffect(() => {
    if (!item) return;

    const previousOverflow = document.body.style.overflow;

    function handleKeyDown(event) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [item, onClose]);

  if (!item) return null;

  function goPrevImage() {
    if (images.length <= 1) return;

    setActiveImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  }

  function goNextImage() {
    if (images.length <= 1) return;

    setActiveImageIndex((prev) =>
      prev === images.length - 1 ? 0 : prev + 1
    );
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center bg-black/55 px-0 py-0 backdrop-blur-sm sm:grid sm:place-items-center sm:px-5 sm:py-6">
      <button
        type="button"
        onClick={onClose}
        className="absolute inset-0 cursor-default"
        aria-label="Đóng chi tiết sản phẩm"
      />

      <div className="relative z-10 flex max-h-[92dvh] w-full flex-col overflow-hidden rounded-t-[16px] bg-white shadow-2xl sm:max-h-[92vh] sm:max-w-5xl sm:rounded-[10px]">
        <div className="sticky top-0 z-20 flex items-center justify-between border-b border-neutral-200 bg-white/95 px-4 py-3 backdrop-blur-xl">
          <div className="min-w-0">
            <p className="text-[10px] font-black uppercase tracking-[0.14em] text-[#9B7A68]">
              {shop?.name || "Hớp Coffee"}
            </p>

            <p className="line-clamp-1 text-sm font-black text-[#2F221C] sm:text-base">
              {item.name}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="ml-3 grid h-9 w-9 shrink-0 place-items-center rounded-[8px] bg-neutral-100 text-[#2F221C] transition hover:bg-neutral-200"
            aria-label="Đóng"
          >
            <X size={19} />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto">
          <div className="grid lg:grid-cols-[0.9fr_1.1fr]">
            <div className="border-b border-neutral-200 bg-white p-3 lg:border-b-0 lg:border-r lg:p-5">
              <div className="relative overflow-hidden rounded-[8px] border border-neutral-200 bg-white">
               <div className="grid h-[360px] place-items-center overflow-hidden bg-white min-[430px]:h-[350px] sm:h-[390px] lg:h-[520px]">
                {activeImage?.url ? (
                    <img
                    src={activeImage.url}
                    alt={activeImage.name || item.name}
                    className="max-h-full max-w-full object-contain p-3 sm:p-6"
                    />
                ) : (
                    <div className="grid h-full w-full place-items-center bg-neutral-50 text-[#6B4B3E]">
                    <Coffee size={56} />
                    </div>
                )}
                </div>

                {images.length > 1 && (
                  <>
                    <button
                      type="button"
                      onClick={goPrevImage}
                      className="absolute left-2 top-1/2 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-[6px] bg-white/95 text-[#6B4B3E] shadow ring-1 ring-neutral-200 transition hover:bg-neutral-50"
                      aria-label="Ảnh trước"
                    >
                      <ChevronLeft size={20} />
                    </button>

                    <button
                      type="button"
                      onClick={goNextImage}
                      className="absolute right-2 top-1/2 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-[6px] bg-white/95 text-[#6B4B3E] shadow ring-1 ring-neutral-200 transition hover:bg-neutral-50"
                      aria-label="Ảnh sau"
                    >
                      <ChevronRight size={20} />
                    </button>
                  </>
                )}
              </div>

              {images.length > 1 && (
                <div className="hop-hide-scroll mt-3 flex gap-2 overflow-x-auto pb-1">
                  {images.map((image, index) => (
                    <button
                      key={`${image.url}-${index}`}
                      type="button"
                      onClick={() => setActiveImageIndex(index)}
                      className={cn(
                        "h-14 w-14 shrink-0 overflow-hidden rounded-[6px] border bg-white transition sm:h-16 sm:w-16",
                        activeImageIndex === index
                          ? "border-[#6B4B3E] ring-2 ring-[#6B4B3E]/15"
                          : "border-neutral-200 hover:border-[#C9A58D]"
                      )}
                    >
                      <img
                        src={image.url}
                        alt={image.name || item.name}
                        className="h-full w-full object-contain p-1"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-white p-4 pb-4 sm:p-6 lg:p-7">
              <div className="hidden lg:block">
                <p className="text-xs font-black uppercase tracking-[0.16em] text-[#9B7A68]">
                  {shop?.name || "Hớp Coffee"}
                </p>

                <h2 className="mt-2 pr-8 text-3xl font-black leading-tight tracking-tight text-[#2F221C]">
                  {item.name}
                </h2>
              </div>

              <div className="flex flex-wrap gap-2 lg:mt-3">
                {item.isFeatured && (
                  <span className="inline-flex items-center gap-1 rounded-[4px] bg-[#B22830] px-2.5 py-1 text-[10px] font-black uppercase text-white">
                    <Star size={11} />
                    Nổi bật
                  </span>
                )}

                <span
                  className={cn(
                    "rounded-[4px] px-2.5 py-1 text-[10px] font-black uppercase",
                    item.isAvailable === false
                      ? "bg-neutral-100 text-neutral-500"
                      : "bg-[#E7F2F4] text-[#4E8791]"
                  )}
                >
                  {item.isAvailable === false ? "Tạm hết" : "Còn bán"}
                </span>

                {hasRealSizes && (
                  <span className="rounded-[4px] bg-neutral-100 px-2.5 py-1 text-[10px] font-black uppercase text-neutral-600">
                    {sizes.length} size
                  </span>
                )}
              </div>

              <div className="mt-4 rounded-[8px] border border-neutral-200 bg-white p-4 shadow-sm sm:mt-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-black text-[#73584D]">
                      Giá sản phẩm
                    </p>

                    {selectedSize?.name && (
                      <p className="mt-1 text-sm font-bold text-neutral-500">
                        {hasRealSizes ? selectedSize.name : "Giá mặc định"}
                      </p>
                    )}
                  </div>

                  <div className="shrink-0 text-right">
                    {hasSelectedSizeSale && (
                      <p className="text-sm font-bold text-neutral-400 line-through">
                        {formatPrice(selectedSize.oldPrice)}
                      </p>
                    )}

                    <p className="mt-1 text-2xl font-black text-[#B22830] sm:text-3xl">
                      {formatPrice(selectedSize?.price || item.price)}
                    </p>
                  </div>
                </div>
              </div>

              {hasRealSizes && (
                <div className="mt-4 sm:mt-5">
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-black text-[#2F221C]">
                      Size / lựa chọn ly
                    </p>

                    <p className="text-xs font-bold text-neutral-400 sm:hidden">
                      Lướt ngang
                    </p>
                  </div>

                  <div className="hop-hide-scroll mt-3 flex snap-x snap-mandatory gap-2 overflow-x-auto pb-2 sm:grid sm:snap-none sm:grid-cols-2 sm:overflow-visible sm:pb-0 lg:grid-cols-1 xl:grid-cols-2">
                    {sizes.map((size) => {
                      const active = selectedSize?.id === size.id;
                      const hasSizeSale =
                        Number(size.oldPrice || 0) > Number(size.price || 0);

                      return (
                        <button
                          key={size.id}
                          type="button"
                          onClick={() => setSelectedSizeId(size.id)}
                          className={cn(
                            "min-h-[92px] w-[150px] shrink-0 snap-start rounded-[8px] border p-3 text-left transition sm:w-auto sm:p-4",
                            active
                              ? "border-[#6B4B3E] bg-white shadow-sm ring-2 ring-[#6B4B3E]/10"
                              : "border-neutral-200 bg-white hover:border-[#C9A58D]"
                          )}
                        >
                          <div className="flex h-full flex-col justify-between gap-3">
                            <div className="min-w-0">
                              <p className="line-clamp-1 font-black text-[#2F221C]">
                                {size.name}
                              </p>

                              {size.description && (
                                <p className="mt-1 line-clamp-2 text-xs leading-5 text-[#73584D]">
                                  {size.description}
                                </p>
                              )}
                            </div>

                            <div>
                              {hasSizeSale && (
                                <p className="text-xs font-bold text-neutral-400 line-through">
                                  {formatPrice(size.oldPrice)}
                                </p>
                              )}

                              <p className="text-sm font-black text-[#B22830]">
                                {formatPrice(size.price)}
                              </p>
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {item.description && (
                <div className="mt-4 rounded-[8px] border border-neutral-200 bg-white p-4 sm:mt-5">
                  <p className="font-black text-[#2F221C]">Mô tả sản phẩm</p>

                  <p className="mt-2 whitespace-pre-line text-sm leading-7 text-[#73584D]">
                    {item.description}
                  </p>
                </div>
              )}

              {Array.isArray(item.tags) && item.tags.length > 0 && (
                <div className="mt-4 sm:mt-5">
                  <p className="font-black text-[#2F221C]">Tags</p>

                  <div className="mt-2 flex flex-wrap gap-2">
                    {item.tags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded-[5px] bg-neutral-100 px-2.5 py-1 text-xs font-bold text-[#73584D]"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="sticky bottom-0 z-20 border-t border-neutral-200 bg-white/95 p-3 backdrop-blur-xl sm:p-4">
          <button
            type="button"
            onClick={onClose}
            className="w-full rounded-[8px] bg-[#2F221C] px-5 py-4 text-sm font-black uppercase tracking-[0.1em] text-white transition hover:bg-[#6B4B3E]"
          >
            Đóng chi tiết
          </button>
        </div>
      </div>
    </div>
  );
}