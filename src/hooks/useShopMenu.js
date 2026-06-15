import { useCallback, useEffect, useState } from "react";

import { getShopBySlug } from "../services/shopService";
import { getCategories } from "../services/categoryService";
import { getItems } from "../services/itemService";
import { getActivePromotions } from "../services/promotionService";
import { getPublishedPosts } from "../services/postService";

function inferMediaTypeFromUrl(url = "", fallbackType = "image") {
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

function normalizeMediaItem(media, index = 0, fallbackName = "Media") {
  if (!media) return null;

  if (typeof media === "string") {
    const url = media.trim();

    if (!url) return null;

    return {
      id: `media-${index}`,
      url,
      type: inferMediaTypeFromUrl(url),
      name: `${fallbackName} ${index + 1}`,
      mimeType: "",
      size: 0,
      publicId: "",
      width: 0,
      height: 0,
    };
  }

  const url = media.url || "";

  if (!url) return null;

  return {
    id: media.id || media.localId || media.publicId || `media-${index}`,
    url,
    type: media.type || inferMediaTypeFromUrl(url),
    name: media.name || `${fallbackName} ${index + 1}`,
    mimeType: media.mimeType || "",
    size: Number(media.size || 0),
    publicId: media.publicId || "",
    width: Number(media.width || 0),
    height: Number(media.height || 0),
  };
}

function normalizeMediaList(mediaList = [], fallbackName = "Media") {
  if (!Array.isArray(mediaList)) return [];

  return mediaList
    .map((media, index) => normalizeMediaItem(media, index, fallbackName))
    .filter(Boolean);
}

function getPrimaryMediaUrl(mediaList = []) {
  const normalizedMedia = normalizeMediaList(mediaList);

  return (
    normalizedMedia.find((media) => media.type === "image")?.url ||
    normalizedMedia[0]?.url ||
    ""
  );
}

function normalizeItem(item) {
  const mediaFromImages = normalizeMediaList(
    item.images || [],
    item.name || "Sản phẩm"
  );

  const media =
    mediaFromImages.length > 0
      ? mediaFromImages
      : item.imageUrl
        ? [
            {
              id: "item-image-url",
              url: item.imageUrl,
              type: inferMediaTypeFromUrl(item.imageUrl),
              name: item.name || "Sản phẩm",
              mimeType: "",
              size: 0,
              publicId: "",
              width: 0,
              height: 0,
            },
          ]
        : [];

  return {
    ...item,
    images: media,
    media,
    imageUrl: item.imageUrl || getPrimaryMediaUrl(media),
  };
}

function normalizePromotion(promotion) {
  const mediaFromList = normalizeMediaList(
    promotion.media || [],
    promotion.title || "Khuyến mãi"
  );

  const media =
    mediaFromList.length > 0
      ? mediaFromList
      : promotion.imageUrl
        ? [
            {
              id: "promotion-image-url",
              url: promotion.imageUrl,
              type: inferMediaTypeFromUrl(promotion.imageUrl),
              name: promotion.title || "Khuyến mãi",
              mimeType: "",
              size: 0,
              publicId: "",
              width: 0,
              height: 0,
            },
          ]
        : [];

  return {
    ...promotion,
    media,
    imageUrl: promotion.imageUrl || getPrimaryMediaUrl(media),
  };
}

function normalizePost(post) {
  const media = normalizeMediaList(post.media || [], post.title || "Bài viết");

  return {
    ...post,
    media,
    coverUrl: post.coverUrl || getPrimaryMediaUrl(media),
  };
}

export function useShopMenu(shopSlug) {
  const [shop, setShop] = useState(null);
  const [categories, setCategories] = useState([]);
  const [items, setItems] = useState([]);
  const [promotions, setPromotions] = useState([]);
  const [posts, setPosts] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadMenu = useCallback(async () => {
    if (!shopSlug) {
      setShop(null);
      setCategories([]);
      setItems([]);
      setPromotions([]);
      setPosts([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError("");

      const shopData = await getShopBySlug(shopSlug);

      if (!shopData) {
        setShop(null);
        setCategories([]);
        setItems([]);
        setPromotions([]);
        setPosts([]);
        return;
      }

      const [categoryData, itemData, promotionData, postData] =
        await Promise.all([
          getCategories(shopData.id),
          getItems(shopData.id),
          getActivePromotions(shopData.id).catch((err) => {
            console.error("Không thể tải khuyến mãi:", err);
            return [];
          }),
          getPublishedPosts(shopData.id).catch((err) => {
            console.error("Không thể tải bài viết:", err);
            return [];
          }),
        ]);

      setShop(shopData);

      setCategories(
        categoryData.filter((category) => category.isActive !== false)
      );

      setItems(
        itemData
          .filter((item) => item.isAvailable !== false)
          .map((item) => normalizeItem(item))
      );

      setPromotions(
        promotionData
          .filter((promotion) => promotion.isActive !== false)
          .map((promotion) => normalizePromotion(promotion))
      );

      setPosts(
        postData
          .filter((post) => post.isPublished !== false && post.isActive !== false)
          .map((post) => normalizePost(post))
      );

      console.log("SHOP CLIENT ĐANG ĐỌC:", shopData.id);
      console.log("ITEMS CLIENT NHẬN:", itemData);
      console.log("PROMOTIONS CLIENT NHẬN:", promotionData);
      console.log("POSTS CLIENT NHẬN:", postData);
    } catch (err) {
      console.error(err);
      setError("Không thể tải menu. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  }, [shopSlug]);

  useEffect(() => {
    loadMenu();
  }, [loadMenu]);

  return {
    shop,
    categories,
    items,
    promotions,
    posts,
    loading,
    error,
    refresh: loadMenu,
  };
}