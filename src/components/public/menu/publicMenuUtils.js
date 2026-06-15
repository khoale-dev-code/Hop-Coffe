export function cn(...classes) {
  return classes.filter(Boolean).join(" ");
}

export function formatPrice(value) {
  return Number(value || 0).toLocaleString("vi-VN") + "đ";
}

export function getPromotionMedia(promotion) {
  if (Array.isArray(promotion?.media) && promotion.media.length > 0) {
    return promotion.media.filter((media) => media?.url);
  }

  if (promotion?.imageUrl) {
    return [
      {
        url: promotion.imageUrl,
        type: "image",
        name: promotion.title || "Khuyến mãi",
      },
    ];
  }

  return [];
}

export function getCategoryCountMap(items = []) {
  return items.reduce((result, item) => {
    if (!item.categoryId) return result;

    result[item.categoryId] = (result[item.categoryId] || 0) + 1;
    return result;
  }, {});
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
      (a, b) => Number(a.price || 0) - Number(b.price || 0)
    );
  }

  if (sortMode === "price-desc") {
    return clonedItems.sort(
      (a, b) => Number(b.price || 0) - Number(a.price || 0)
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