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

function cleanFileName(name) {
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

export async function getItems(shopId) {
  const q = query(
    collection(db, "shops", shopId, "items"),
    orderBy("order", "asc")
  );

  const snapshot = await getDocs(q);

  return snapshot.docs.map((itemDoc) => ({
    id: itemDoc.id,
    ...itemDoc.data(),
  }));
}

export async function uploadItemImage(shopId, file) {
  if (!file) return "";

  const fileName = `${Date.now()}-${cleanFileName(file.name)}`;
  const fileRef = ref(storage, `shops/${shopId}/items/${fileName}`);

  await uploadBytes(fileRef, file);

  return getDownloadURL(fileRef);
}

export async function createItem(shopId, payload) {
  const itemRef = collection(db, "shops", shopId, "items");

  return addDoc(itemRef, {
    name: payload.name.trim(),
    description: payload.description?.trim() || "",
    price: Number(payload.price || 0),
    oldPrice: Number(payload.oldPrice || 0),
    imageUrl: payload.imageUrl || "",
    categoryId: payload.categoryId || "",
    isAvailable: payload.isAvailable ?? true,
    isFeatured: payload.isFeatured ?? false,
    order: Number(payload.order || 1),
    tags: payload.tags || [],
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}

export async function updateItem(shopId, itemId, payload) {
  const itemRef = doc(db, "shops", shopId, "items", itemId);

  const cleanPayload = removeUndefined({
    name: payload.name !== undefined ? payload.name.trim() : undefined,
    description:
      payload.description !== undefined
        ? payload.description.trim()
        : undefined,
    price: payload.price !== undefined ? Number(payload.price || 0) : undefined,
    oldPrice:
      payload.oldPrice !== undefined ? Number(payload.oldPrice || 0) : undefined,
    imageUrl: payload.imageUrl,
    categoryId: payload.categoryId,
    isAvailable: payload.isAvailable,
    isFeatured: payload.isFeatured,
    order: payload.order !== undefined ? Number(payload.order || 1) : undefined,
    tags: payload.tags,
    updatedAt: serverTimestamp(),
  });

  await updateDoc(itemRef, cleanPayload);
}

export async function deleteItem(shopId, itemId) {
  const itemRef = doc(db, "shops", shopId, "items", itemId);
  await deleteDoc(itemRef);
}

export async function reorderItems(shopId, orderedItems) {
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