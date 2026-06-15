import {
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  query,
  serverTimestamp,
  setDoc,
  where,
} from "firebase/firestore";
import { db } from "../lib/firebase";

export const DEFAULT_SHOP_ID =
  import.meta.env.VITE_DEFAULT_SHOP_ID || "demo-shop";

function removeUndefined(data) {
  return Object.fromEntries(
    Object.entries(data).filter(([, value]) => value !== undefined)
  );
}

export async function getShopById(shopId = DEFAULT_SHOP_ID) {
  const shopRef = doc(db, "shops", shopId);
  const snapshot = await getDoc(shopRef);

  if (!snapshot.exists()) {
    return null;
  }

  return {
    id: snapshot.id,
    ...snapshot.data(),
  };
}

export async function getShopBySlug(slug) {
  const q = query(
    collection(db, "shops"),
    where("slug", "==", slug),
    where("isPublished", "==", true),
    limit(1)
  );

  const snapshot = await getDocs(q);

  if (snapshot.empty) {
    return null;
  }

  const shopDoc = snapshot.docs[0];

  return {
    id: shopDoc.id,
    ...shopDoc.data(),
  };
}

export async function saveShopSettings(shopId = DEFAULT_SHOP_ID, payload) {
  const shopRef = doc(db, "shops", shopId);

  const cleanPayload = removeUndefined({
    name: payload.name?.trim(),
    slug: payload.slug?.trim(),
    description: payload.description?.trim(),
    address: payload.address?.trim(),
    phone: payload.phone?.trim(),
    zaloUrl: payload.zaloUrl?.trim(),
    facebookUrl: payload.facebookUrl?.trim(),
    googleMapUrl: payload.googleMapUrl?.trim(),
    logoUrl: payload.logoUrl?.trim(),
    coverUrl: payload.coverUrl?.trim(),
    isPublished: Boolean(payload.isPublished),
    theme: payload.theme || "light",
    updatedAt: serverTimestamp(),
    createdAt: payload.createdAt,
    ownerUid: payload.ownerUid,
  });

  await setDoc(shopRef, cleanPayload, { merge: true });
}