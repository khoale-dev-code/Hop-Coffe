import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
} from "firebase/firestore";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { db, storage } from "../lib/firebase";

export async function getPosts(shopId) {
  if (!shopId) return [];

  const q = query(
    collection(db, "shops", shopId, "posts"),
    orderBy("createdAt", "desc")
  );

  const snapshot = await getDocs(q);

  return snapshot.docs.map((postDoc) => {
    const data = postDoc.data();
    return {
      id: postDoc.id,
      ...data,
      media: data.media || [], // Mảng chứa ảnh/video
      createdAt: data.createdAt?.toDate()?.toISOString() || new Date().toISOString(),
    };
  });
}

export async function createPost(shopId, payload) {
  const postRef = collection(db, "shops", shopId, "posts");

  return addDoc(postRef, {
    content: payload.content?.trim() || "",
    media: payload.media || [], // [{ url, type }]
    isActive: payload.isActive ?? true,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}

export async function deletePost(shopId, postId) {
  const postRef = doc(db, "shops", shopId, "posts", postId);
  await deleteDoc(postRef);
}

// Upload nhiều file ảnh/video lên Storage
export async function uploadPostMedia(shopId, files = []) {
  const uploadedMedia = await Promise.all(
    Array.from(files).map(async (file) => {
      const safeName = file.name.replace(/[^a-z0-9-.]/gi, "");
      const fileName = `${Date.now()}-${safeName}`;
      const fileRef = ref(storage, `shops/${shopId}/posts/${fileName}`);

      await uploadBytes(fileRef, file);
      const url = await getDownloadURL(fileRef);

      return {
        url,
        type: file.type.startsWith("video/") ? "video" : "image",
      };
    })
  );

  return uploadedMedia;
}