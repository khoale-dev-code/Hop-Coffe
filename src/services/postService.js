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
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";

import { db, storage } from "../lib/firebase";

function cleanFileName(name = "media") {
  return name
    .toLowerCase()
    .replaceAll(" ", "-")
    .replace(/[^a-z0-9-.]/g, "");
}

function getMediaType(file) {
  if (file?.type?.startsWith("video/")) return "video";
  return "image";
}

function normalizeMedia(media = []) {
  if (!Array.isArray(media)) return [];

  return media
    .map((item) => ({
      url: item?.url || "",
      type: item?.type || "image",
      name: item?.name || "Media",
      mimeType: item?.mimeType || "",
      size: Number(item?.size || 0),
    }))
    .filter((item) => item.url);
}

function normalizePost(postDoc, index = 0) {
  const data = postDoc.data();
  const media = normalizeMedia(data.media || []);

  const createdAt =
    typeof data.createdAt?.toDate === "function"
      ? data.createdAt.toDate().toISOString()
      : data.createdAt || "";

  const updatedAt =
    typeof data.updatedAt?.toDate === "function"
      ? data.updatedAt.toDate().toISOString()
      : data.updatedAt || "";

  return {
    id: postDoc.id,
    ...data,
    title: data.title || "",
    content: data.content || "",
    media,
    coverUrl: data.coverUrl || media[0]?.url || "",
    isPublished: data.isPublished ?? data.isActive ?? true,
    isActive: data.isActive ?? data.isPublished ?? true,
    isPinned: data.isPinned ?? false,
    order: Number(data.order ?? index + 1),
    createdAt: createdAt || new Date().toISOString(),
    updatedAt: updatedAt || "",
  };
}

function buildPostPayload(payload, options = {}) {
  const media = normalizeMedia(payload.media || []);
  const firstImage = media.find((item) => item.type === "image") || media[0];

  const content = payload.content?.trim() || "";
  const title =
    payload.title?.trim() ||
    content.slice(0, 80) ||
    "Bài viết mới";

  const data = {
    title,
    content,
    media,
    coverUrl: payload.coverUrl || firstImage?.url || "",
    isPublished: payload.isPublished ?? payload.isActive ?? true,
    isActive: payload.isActive ?? payload.isPublished ?? true,
    isPinned: payload.isPinned ?? false,
    order: Number(payload.order || 1),
    updatedAt: serverTimestamp(),
  };

  if (!options.forUpdate) {
    data.createdAt = serverTimestamp();
  }

  return data;
}

export async function getPosts(shopId) {
  if (!shopId) return [];

  const q = query(
    collection(db, "shops", shopId, "posts"),
    orderBy("createdAt", "desc")
  );

  const snapshot = await getDocs(q);

  return snapshot.docs.map((postDoc, index) => normalizePost(postDoc, index));
}

export async function getPublishedPosts(shopId) {
  const posts = await getPosts(shopId);

  return posts
    .filter((post) => post.isPublished !== false && post.isActive !== false)
    .sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;

      const dateA = new Date(a.createdAt || 0).getTime();
      const dateB = new Date(b.createdAt || 0).getTime();

      return dateB - dateA;
    });
}

export async function createPost(shopId, payload) {
  if (!shopId) throw new Error("Thiếu shopId khi tạo bài viết.");

  const postRef = collection(db, "shops", shopId, "posts");

  return addDoc(postRef, buildPostPayload(payload));
}

export async function updatePost(shopId, postId, payload) {
  if (!shopId || !postId) {
    throw new Error("Thiếu shopId hoặc postId khi cập nhật bài viết.");
  }

  const postRef = doc(db, "shops", shopId, "posts", postId);

  await updateDoc(postRef, {
    title: payload.title || "",
    content: payload.content?.trim() || "",
    media: payload.media || [],
    isPublished: payload.isPublished ?? true,
    isActive: payload.isActive ?? true,
    isPinned: payload.isPinned ?? false,
    order: Number(payload.order || 1),
    updatedAt: serverTimestamp(),
  });
}

export async function deletePost(shopId, postId) {
  if (!shopId || !postId) {
    throw new Error("Thiếu shopId hoặc postId khi xóa bài viết.");
  }

  const postRef = doc(db, "shops", shopId, "posts", postId);

  await deleteDoc(postRef);
}

export async function uploadPostMedia(shopId, files = []) {
  const uploadFiles = Array.from(files).filter(Boolean);

  if (!shopId || uploadFiles.length === 0) return [];

  const uploadedMedia = await Promise.all(
    uploadFiles.map(async (file, index) => {
      const mediaType = getMediaType(file);
      const safeName = cleanFileName(file.name || "media");
      const fileName = `${Date.now()}-${index}-${safeName}`;

      const fileRef = ref(
        storage,
        `shops/${shopId}/posts/${mediaType}s/${fileName}`
      );

      await uploadBytes(fileRef, file);

      const url = await getDownloadURL(fileRef);

      return {
        url,
        type: mediaType,
        name: file.name || fileName,
        size: file.size || 0,
        mimeType: file.type || "",
      };
    })
  );

  return uploadedMedia;
}