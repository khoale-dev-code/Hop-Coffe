import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  writeBatch,
} from "firebase/firestore";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";

import { db, storage } from "../lib/firebase";

function cleanFileName(name = "image") {
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

function createLocalId() {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function normalizeTags(tags) {
  if (!Array.isArray(tags)) return [];

  return tags
    .map((tag) => String(tag || "").trim())
    .filter(Boolean);
}

function normalizeImages(images) {
  if (!Array.isArray(images)) return [];

  return images
    .map((image, index) => {
      if (typeof image === "string") {
        return {
          url: image,
          name: `Ảnh ${index + 1}`,
          order: index + 1,
        };
      }

      return {
        url: image?.url || "",
        name: image?.name || `Ảnh ${index + 1}`,
        order: Number(image?.order || index + 1),
      };
    })
    .filter((image) => image.url);
}

export function normalizeItemSizes(sizes = []) {
  if (!Array.isArray(sizes)) return [];

  return sizes
    .map((size, index) => {
      const name = String(size?.name || size?.label || "").trim();
      const description = String(size?.description || "").trim();
      const price = Number(size?.price || 0);
      const oldPrice = Number(size?.oldPrice || 0);

      const hasAnyValue = name || description || price > 0 || oldPrice > 0;

      if (!hasAnyValue) return null;

      return {
        id: size?.id || createLocalId(),
        name: name || `Size ${index + 1}`,
        price,
        oldPrice,
        description,
        order: Number(size?.order || index + 1),
      };
    })
    .filter(Boolean)
    .filter((size) => size.price > 0)
    .sort((a, b) => Number(a.order || 0) - Number(b.order || 0));
}

function getDisplayPrice(payload) {
  const sizes = normalizeItemSizes(payload.sizes || []);

  if (sizes.length > 0) {
    return Math.min(...sizes.map((size) => Number(size.price || 0)));
  }

  return Number(payload.price || 0);
}

function getDisplayOldPrice(payload) {
  const sizes = normalizeItemSizes(payload.sizes || []);

  if (sizes.length > 0) {
    const oldPrices = sizes
      .map((size) => Number(size.oldPrice || 0))
      .filter((price) => price > 0);

    return oldPrices.length > 0 ? Math.min(...oldPrices) : 0;
  }

  return Number(payload.oldPrice || 0);
}

function buildItemPayload(payload, options = {}) {
  const sizes =
    payload.sizes !== undefined ? normalizeItemSizes(payload.sizes) : undefined;

  const images =
    payload.images !== undefined ? normalizeImages(payload.images) : undefined;

  const imageUrl =
    payload.imageUrl !== undefined
      ? payload.imageUrl || images?.[0]?.url || ""
      : undefined;

  if (options.forUpdate) {
    return removeUndefined({
      name: payload.name !== undefined ? payload.name.trim() : undefined,
      description:
        payload.description !== undefined
          ? payload.description.trim()
          : undefined,
      price:
        payload.price !== undefined || payload.sizes !== undefined
          ? getDisplayPrice(payload)
          : undefined,
      oldPrice:
        payload.oldPrice !== undefined || payload.sizes !== undefined
          ? getDisplayOldPrice(payload)
          : undefined,
      imageUrl,
      images,
      categoryId: payload.categoryId,
      isAvailable: payload.isAvailable,
      isFeatured: payload.isFeatured,
      order:
        payload.order !== undefined ? Number(payload.order || 1) : undefined,
      tags: payload.tags !== undefined ? normalizeTags(payload.tags) : undefined,
      sizes,
      updatedAt: serverTimestamp(),
    });
  }

  const createImages = normalizeImages(payload.images || []);
  const createSizes = normalizeItemSizes(payload.sizes || []);

  return {
    name: payload.name?.trim() || "",
    description: payload.description?.trim() || "",
    price: getDisplayPrice({
      ...payload,
      sizes: createSizes,
    }),
    oldPrice: getDisplayOldPrice({
      ...payload,
      sizes: createSizes,
    }),
    imageUrl: payload.imageUrl || createImages[0]?.url || "",
    images: createImages,
    categoryId: payload.categoryId || "",
    isAvailable: payload.isAvailable ?? true,
    isFeatured: payload.isFeatured ?? false,
    order: Number(payload.order || 1),
    tags: normalizeTags(payload.tags || []),
    sizes: createSizes,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };
}

export async function getItems(shopId) {
  if (!shopId) return [];

  const q = query(
    collection(db, "shops", shopId, "items"),
    orderBy("order", "asc")
  );

  const snapshot = await getDocs(q);

  return snapshot.docs.map((itemDoc) => {
    const data = itemDoc.data();

    return {
      id: itemDoc.id,
      ...data,
      price: Number(data.price || 0),
      oldPrice: Number(data.oldPrice || 0),
      images: normalizeImages(data.images || []),
      sizes: normalizeItemSizes(data.sizes || []),
      tags: Array.isArray(data.tags) ? data.tags : [],
      isAvailable: data.isAvailable ?? true,
      isFeatured: data.isFeatured ?? false,
      order: Number(data.order || 1),
    };
  });
}

export async function uploadItemImage(shopId, file) {
  if (!shopId || !file) return "";

  const fileName = `${Date.now()}-${cleanFileName(file.name)}`;
  const fileRef = ref(storage, `shops/${shopId}/items/${fileName}`);

  await uploadBytes(fileRef, file);

  return getDownloadURL(fileRef);
}

export async function uploadItemImages(shopId, files = []) {
  const uploadFiles = Array.from(files).filter(Boolean);

  if (!shopId || uploadFiles.length === 0) return [];

  const uploadedImages = await Promise.all(
    uploadFiles.map(async (file, index) => {
      const fileName = `${Date.now()}-${index}-${cleanFileName(file.name)}`;
      const fileRef = ref(storage, `shops/${shopId}/items/${fileName}`);

      await uploadBytes(fileRef, file);

      const url = await getDownloadURL(fileRef);

      return {
        url,
        name: file.name,
        order: index + 1,
      };
    })
  );

  return uploadedImages;
}

export async function createItem(shopId, payload) {
  if (!shopId) {
    throw new Error("Thiếu shopId khi tạo món.");
  }

  const itemRef = collection(db, "shops", shopId, "items");

  return addDoc(itemRef, buildItemPayload(payload));
}

export async function updateItem(shopId, itemId, payload) {
  if (!shopId || !itemId) {
    throw new Error("Thiếu shopId hoặc itemId khi cập nhật món.");
  }

  const itemRef = doc(db, "shops", shopId, "items", itemId);

  await updateDoc(
    itemRef,
    buildItemPayload(payload, {
      forUpdate: true,
    })
  );
}

export async function deleteItem(shopId, itemId) {
  if (!shopId || !itemId) {
    throw new Error("Thiếu shopId hoặc itemId khi xóa món.");
  }

  const itemRef = doc(db, "shops", shopId, "items", itemId);

  await deleteDoc(itemRef);
}

export async function reorderItems(shopId, orderedItems) {
  if (!shopId || !Array.isArray(orderedItems)) return;

  const batch = writeBatch(db);

  orderedItems.forEach((item, index) => {
    const itemRef = doc(db, "shops", shopId, "items", item.id);

    batch.update(itemRef, {
      order: index + 1,
      updatedAt: serverTimestamp(),
    });
  });

  await batch.commit();
}