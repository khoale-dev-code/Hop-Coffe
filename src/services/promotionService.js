import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  serverTimestamp,
  updateDoc,
  writeBatch,
} from "firebase/firestore";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { db, storage } from "../lib/firebase";

function cleanFileName(name = "media") {
  return name
    .toLowerCase()
    .replaceAll(" ", "-")
    .replace(/[^a-z0-9-.]/g, "");
}

function removeUndefined(data) {
  return Object.fromEntries(
    Object.entries(data).filter(([, value]) => value !== undefined)
  );
}

function getTodayString() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function getMediaType(file) {
  if (file?.type?.startsWith("video/")) return "video";
  return "image";
}

function inferMediaTypeFromUrl(url = "") {
  const cleanUrl = url.toLowerCase().split("?")[0];

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

function getNameFromUrl(url = "") {
  try {
    const pathname = new URL(url).pathname;
    return pathname.split("/").filter(Boolean).pop() || "Media URL";
  } catch {
    return "Media URL";
  }
}

export function normalizePromotionMedia(promotionOrMedia, fallbackImageUrl = "") {
  const mediaList = Array.isArray(promotionOrMedia)
    ? promotionOrMedia
    : promotionOrMedia?.media;

  if (Array.isArray(mediaList) && mediaList.length > 0) {
    return mediaList
      .map((media, index) => {
        if (typeof media === "string") {
          return {
            url: media,
            type: inferMediaTypeFromUrl(media),
            name: getNameFromUrl(media) || `Media ${index + 1}`,
            size: 0,
            mimeType: "",
          };
        }

        return {
          url: media?.url || "",
          type: media?.type || inferMediaTypeFromUrl(media?.url || ""),
          name:
            media?.name ||
            getNameFromUrl(media?.url || "") ||
            `Media ${index + 1}`,
          size: media?.size || 0,
          mimeType: media?.mimeType || "",
        };
      })
      .filter((media) => media.url);
  }

  const imageUrl =
    fallbackImageUrl ||
    promotionOrMedia?.imageUrl ||
    promotionOrMedia?.url ||
    "";

  if (!imageUrl) return [];

  return [
    {
      url: imageUrl,
      type: inferMediaTypeFromUrl(imageUrl),
      name: promotionOrMedia?.title || getNameFromUrl(imageUrl),
      size: 0,
      mimeType: "",
    },
  ];
}

function isPromotionVisible(promotion) {
  if (promotion.isActive === false) return false;

  const today = getTodayString();

  if (promotion.startAt && promotion.startAt > today) return false;
  if (promotion.endAt && promotion.endAt < today) return false;

  return true;
}

function buildPromotionPayload(payload, options = {}) {
  const media =
    payload.media !== undefined
      ? normalizePromotionMedia(payload.media, payload.imageUrl)
      : undefined;

  const firstImage =
    media?.find((item) => item.type === "image") || media?.[0] || null;

  if (options.forUpdate) {
    return removeUndefined({
      title: payload.title !== undefined ? payload.title.trim() : undefined,
      subtitle:
        payload.subtitle !== undefined ? payload.subtitle.trim() : undefined,
      description:
        payload.description !== undefined
          ? payload.description.trim()
          : undefined,
      media,
      imageUrl:
        payload.imageUrl !== undefined || payload.media !== undefined
          ? payload.imageUrl || firstImage?.url || ""
          : undefined,
      buttonText:
        payload.buttonText !== undefined
          ? payload.buttonText.trim() || "Xem chi tiết"
          : undefined,
      terms: payload.terms !== undefined ? payload.terms.trim() : undefined,
      startAt: payload.startAt,
      endAt: payload.endAt,
      isActive: payload.isActive,
      order:
        payload.order !== undefined ? Number(payload.order || 1) : undefined,
      updatedAt: serverTimestamp(),
    });
  }

  const createMedia = normalizePromotionMedia(payload.media, payload.imageUrl);
  const createFirstImage =
    createMedia.find((item) => item.type === "image") || createMedia[0] || null;

  return {
    title: payload.title?.trim() || "",
    subtitle: payload.subtitle?.trim() || "",
    description: payload.description?.trim() || "",
    media: createMedia,
    imageUrl: payload.imageUrl || createFirstImage?.url || "",
    buttonText: payload.buttonText?.trim() || "Xem chi tiết",
    terms: payload.terms?.trim() || "",
    startAt: payload.startAt || "",
    endAt: payload.endAt || "",
    isActive: payload.isActive ?? true,
    order: Number(payload.order || 1),
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };
}

export async function getPromotions(shopId) {
  if (!shopId) return [];

  const snapshot = await getDocs(collection(db, "shops", shopId, "promotions"));

  return snapshot.docs
    .map((promotionDoc, index) => {
      const data = promotionDoc.data();

      return {
        id: promotionDoc.id,
        ...data,
        media: normalizePromotionMedia(data),
        imageUrl: data.imageUrl || normalizePromotionMedia(data)[0]?.url || "",
        isActive: data.isActive ?? true,
        order: Number(data.order ?? index + 1),
      };
    })
    .sort((a, b) => Number(a.order || 0) - Number(b.order || 0));
}

export async function getActivePromotions(shopId) {
  const promotions = await getPromotions(shopId);
  return promotions.filter(isPromotionVisible);
}

export async function uploadPromotionMedia(shopId, files = []) {
  const uploadFiles = Array.from(files).filter(Boolean);

  if (!shopId || uploadFiles.length === 0) return [];

  const uploadedMedia = await Promise.all(
    uploadFiles.map(async (file, index) => {
      const mediaType = getMediaType(file);
      const fileName = `${Date.now()}-${index}-${cleanFileName(file.name)}`;

      const fileRef = ref(
        storage,
        `shops/${shopId}/promotions/${mediaType}s/${fileName}`
      );

      await uploadBytes(fileRef, file);

      const url = await getDownloadURL(fileRef);

      return {
        url,
        type: mediaType,
        name: file.name,
        size: file.size,
        mimeType: file.type,
      };
    })
  );

  return uploadedMedia;
}

export async function createPromotion(shopId, payload) {
  const promotionRef = collection(db, "shops", shopId, "promotions");
  return addDoc(promotionRef, buildPromotionPayload(payload));
}

export async function updatePromotion(shopId, promotionId, payload) {
  const promotionRef = doc(db, "shops", shopId, "promotions", promotionId);

  await updateDoc(
    promotionRef,
    buildPromotionPayload(payload, {
      forUpdate: true,
    })
  );
}

export async function deletePromotion(shopId, promotionId) {
  const promotionRef = doc(db, "shops", shopId, "promotions", promotionId);
  await deleteDoc(promotionRef);
}

export async function reorderPromotions(shopId, orderedPromotions) {
  const batch = writeBatch(db);

  orderedPromotions.forEach((promotion, index) => {
    const promotionRef = doc(db, "shops", shopId, "promotions", promotion.id);

    batch.update(promotionRef, {
      order: index + 1,
      updatedAt: serverTimestamp(),
    });
  });

  await batch.commit();
}