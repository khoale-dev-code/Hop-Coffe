export function cn(...classes) {
  return classes.flat().filter(Boolean).join(" ");
}

export function formatPrice(value) {
  const numberValue = Number(value || 0);

  return numberValue.toLocaleString("vi-VN") + "đ";
}

export function inferMediaType(url = "", fallbackType = "image") {
  const cleanUrl = String(url).toLowerCase().split("?")[0];

  if (
    cleanUrl.endsWith(".mp4") ||
    cleanUrl.endsWith(".webm") ||
    cleanUrl.endsWith(".mov") ||
    cleanUrl.endsWith(".m4v") ||
    cleanUrl.endsWith(".ogg")
  ) {
    return "video";
  }

  return fallbackType === "video" ? "video" : "image";
}

export function isGifMedia(media) {
  const url = String(media?.url || "").toLowerCase().split("?")[0];
  const mimeType = String(media?.mimeType || "").toLowerCase();

  return url.endsWith(".gif") || mimeType === "image/gif";
}

export function isVideoMedia(media) {
  return media?.type === "video" || inferMediaType(media?.url || "") === "video";
}

export function normalizeMediaItem(media, index = 0, fallbackName = "Media") {
  if (!media) return null;

  if (typeof media === "string") {
    if (!media.trim()) return null;

    return {
      id: `media-${index}`,
      url: media.trim(),
      type: inferMediaType(media),
      name: `${fallbackName} ${index + 1}`,
      mimeType: "",
      size: 0,
      publicId: "",
    };
  }

  const url = media.url || "";

  if (!url) return null;

  return {
    id: media.id || media.localId || media.publicId || `media-${index}`,
    url,
    type: media.type || inferMediaType(url),
    name: media.name || `${fallbackName} ${index + 1}`,
    mimeType: media.mimeType || "",
    size: Number(media.size || 0),
    publicId: media.publicId || "",
    width: Number(media.width || 0),
    height: Number(media.height || 0),
  };
}

export function normalizeMediaList(mediaList = [], fallbackName = "Media") {
  if (!Array.isArray(mediaList)) return [];

  return mediaList
    .map((media, index) => normalizeMediaItem(media, index, fallbackName))
    .filter(Boolean);
}

export function getPromotionMedia(promotion) {
  const media = normalizeMediaList(
    promotion?.media || [],
    promotion?.title || "Khuyến mãi"
  );

  if (media.length > 0) return media;

  if (promotion?.imageUrl) {
    return [
      {
        id: "promotion-image-url",
        url: promotion.imageUrl,
        type: inferMediaType(promotion.imageUrl),
        name: promotion.title || "Khuyến mãi",
        mimeType: "",
        size: 0,
        publicId: "",
      },
    ];
  }

  return [];
}

export function getItemMedia(item) {
  const media = normalizeMediaList(item?.images || [], item?.name || "Sản phẩm");

  if (media.length > 0) return media;

  if (item?.imageUrl) {
    return [
      {
        id: "item-image-url",
        url: item.imageUrl,
        type: inferMediaType(item.imageUrl),
        name: item.name || "Sản phẩm",
        mimeType: "",
        size: 0,
        publicId: "",
      },
    ];
  }

  return [];
}

export function getPrimaryMedia(mediaList = []) {
  const media = normalizeMediaList(mediaList);

  return media.find((item) => item.type === "image") || media[0] || null;
}

export function getPrimaryItemMedia(item) {
  return getPrimaryMedia(getItemMedia(item));
}

export function getPrimaryItemImageUrl(item) {
  const primaryMedia = getPrimaryItemMedia(item);

  return primaryMedia?.url || "";
}

export function getCategoryCountMap(items = []) {
  return items.reduce((result, item) => {
    if (!item.categoryId) return result;

    result[item.categoryId] = (result[item.categoryId] || 0) + 1;

    return result;
  }, {});
}

export function getItemDisplayPrice(item) {
  const sizes = Array.isArray(item?.sizes) ? item.sizes : [];

  const sizePrices = sizes
    .map((size) => Number(size?.price || 0))
    .filter((price) => price > 0);

  if (sizePrices.length > 0) {
    return Math.min(...sizePrices);
  }

  return Number(item?.price || 0);
}

export function getItemDisplayOldPrice(item) {
  const sizes = Array.isArray(item?.sizes) ? item.sizes : [];

  const sizeOldPrices = sizes
    .map((size) => Number(size?.oldPrice || 0))
    .filter((price) => price > 0);

  if (sizeOldPrices.length > 0) {
    return Math.min(...sizeOldPrices);
  }

  return Number(item?.oldPrice || 0);
}

export function sortMenuItems(items = [], sortMode = "default") {
  const clonedItems = [...items];

  if (sortMode === "name-asc") {
    return clonedItems.sort((a, b) =>
      String(a.name || "").localeCompare(String(b.name || ""), "vi")
    );
  }

  if (sortMode === "name-desc") {
    return clonedItems.sort((a, b) =>
      String(b.name || "").localeCompare(String(a.name || ""), "vi")
    );
  }

  if (sortMode === "price-asc") {
    return clonedItems.sort(
      (a, b) => getItemDisplayPrice(a) - getItemDisplayPrice(b)
    );
  }

  if (sortMode === "price-desc") {
    return clonedItems.sort(
      (a, b) => getItemDisplayPrice(b) - getItemDisplayPrice(a)
    );
  }

  if (sortMode === "featured") {
    return clonedItems.sort((a, b) => {
      if (a.isFeatured === b.isFeatured) {
        return Number(a.order || 0) - Number(b.order || 0);
      }

      return a.isFeatured ? -1 : 1;
    });
  }

  return clonedItems.sort((a, b) => Number(a.order || 0) - Number(b.order || 0));
}