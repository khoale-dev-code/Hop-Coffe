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
} from "firebase/firestore";
import { db } from "../lib/firebase";

export async function getCategories(shopId) {
  const q = query(
    collection(db, "shops", shopId, "categories"),
    orderBy("order", "asc")
  );

  const snapshot = await getDocs(q);

  return snapshot.docs.map((categoryDoc) => ({
    id: categoryDoc.id,
    ...categoryDoc.data(),
  }));
}

export async function createCategory(shopId, payload) {
  const categoryRef = collection(db, "shops", shopId, "categories");

  return addDoc(categoryRef, {
    name: payload.name.trim(),
    order: Number(payload.order || 1),
    isActive: payload.isActive ?? true,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}

export async function updateCategory(shopId, categoryId, payload) {
  const categoryRef = doc(db, "shops", shopId, "categories", categoryId);

  await updateDoc(categoryRef, {
    ...payload,
    updatedAt: serverTimestamp(),
  });
}

export async function deleteCategory(shopId, categoryId) {
  const categoryRef = doc(db, "shops", shopId, "categories", categoryId);
  await deleteDoc(categoryRef);
}