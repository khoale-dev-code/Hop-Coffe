const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

const DEFAULT_FOLDER = "hop-cafe";

const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/gif",
];

const ALLOWED_VIDEO_TYPES = [
  "video/mp4",
  "video/webm",
  "video/quicktime",
  "video/x-m4v",
];

const MAX_IMAGE_SIZE = 15 * 1024 * 1024;
const MAX_VIDEO_SIZE = 80 * 1024 * 1024;

function cleanFolderPath(folder = DEFAULT_FOLDER) {
  return String(folder || DEFAULT_FOLDER)
    .split("/")
    .map((part) =>
      part
        .trim()
        .toLowerCase()
        .replaceAll(" ", "-")
        .replace(/[^a-z0-9-_]/g, "")
    )
    .filter(Boolean)
    .join("/");
}

function isFileLike(file) {
  return (
    file &&
    typeof file === "object" &&
    typeof file.name === "string" &&
    typeof file.size === "number"
  );
}

function getFileExtension(fileName = "") {
  return String(fileName).toLowerCase().split(".").pop() || "";
}

function isGifFile(file) {
  return file?.type === "image/gif" || getFileExtension(file?.name) === "gif";
}

function isVideoFile(file) {
  const extension = getFileExtension(file?.name);

  return (
    file?.type?.startsWith("video/") ||
    ["mp4", "webm", "mov", "m4v"].includes(extension)
  );
}

function isImageFile(file) {
  const extension = getFileExtension(file?.name);

  return (
    file?.type?.startsWith("image/") ||
    ["jpg", "jpeg", "png", "webp", "gif"].includes(extension)
  );
}

function getMediaType(file, resourceType) {
  if (resourceType === "video") return "video";
  if (isVideoFile(file)) return "video";
  return "image";
}

function getResourceType(file) {
  if (isVideoFile(file)) return "video";
  return "image";
}

function getUploadEndpoint(file) {
  const resourceType = getResourceType(file);

  return `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/${resourceType}/upload`;
}

function validateCloudinaryConfig() {
  if (!CLOUD_NAME || !UPLOAD_PRESET) {
    throw new Error(
      "Thiếu VITE_CLOUDINARY_CLOUD_NAME hoặc VITE_CLOUDINARY_UPLOAD_PRESET trong .env.local"
    );
  }
}

function validateFile(file) {
  if (!isFileLike(file)) {
    throw new Error("File upload không hợp lệ.");
  }

  const isImage = isImageFile(file);
  const isVideo = isVideoFile(file);

  if (!isImage && !isVideo) {
    throw new Error(
      "Định dạng file không hỗ trợ. Vui lòng chọn JPG, PNG, WEBP, GIF, MP4, WEBM hoặc MOV."
    );
  }

  if (isImage && !ALLOWED_IMAGE_TYPES.includes(file.type) && file.type) {
    throw new Error("Định dạng ảnh không hỗ trợ.");
  }

  if (isVideo && !ALLOWED_VIDEO_TYPES.includes(file.type) && file.type) {
    throw new Error("Định dạng video không hỗ trợ.");
  }

  if (isImage && file.size > MAX_IMAGE_SIZE) {
    throw new Error("Ảnh quá lớn. Vui lòng chọn ảnh dưới 15MB.");
  }

  if (isVideo && file.size > MAX_VIDEO_SIZE) {
    throw new Error("Video quá lớn. Vui lòng chọn video dưới 80MB.");
  }
}

function normalizeCloudinaryResponse(data, file) {
  const mediaType = getMediaType(file, data.resource_type);

  return {
    url: data.secure_url || data.url || "",
    type: mediaType,
    name: file?.name || data.original_filename || "Media",
    mimeType: file?.type || "",
    size: Number(file?.size || data.bytes || 0),
    publicId: data.public_id || "",
    width: Number(data.width || 0),
    height: Number(data.height || 0),
    format: data.format || "",
    resourceType: data.resource_type || mediaType,
    isGif: isGifFile(file) || data.format === "gif",
    createdAt: data.created_at || "",
  };
}

export async function uploadMediaToCloudinary(file, folder = DEFAULT_FOLDER) {
  validateCloudinaryConfig();
  validateFile(file);

  const safeFolder = cleanFolderPath(folder);

  const formData = new FormData();

  formData.append("file", file);
  formData.append("upload_preset", UPLOAD_PRESET);

  if (safeFolder) {
    formData.append("folder", safeFolder);
  }

  const response = await fetch(getUploadEndpoint(file), {
    method: "POST",
    body: formData,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(
      data?.error?.message ||
        "Không thể upload lên Cloudinary. Vui lòng kiểm tra Upload preset."
    );
  }

  return normalizeCloudinaryResponse(data, file);
}

export async function uploadMediaFilesToCloudinary(
  files = [],
  folder = DEFAULT_FOLDER
) {
  const uploadFiles = Array.from(files).filter(Boolean);

  if (uploadFiles.length === 0) return [];

  const uploadedMedia = await Promise.all(
    uploadFiles.map((file) => uploadMediaToCloudinary(file, folder))
  );

  return uploadedMedia.filter((media) => media?.url);
}

export async function uploadImageToCloudinary(file, folder = DEFAULT_FOLDER) {
  const uploaded = await uploadMediaToCloudinary(file, folder);

  return uploaded?.url || "";
}

export async function uploadItemMediaToCloudinary(shopId, files = []) {
  return uploadMediaFilesToCloudinary(
    files,
    `hop-cafe/${shopId || "default-shop"}/items`
  );
}

export async function uploadPromotionMediaToCloudinary(shopId, files = []) {
  return uploadMediaFilesToCloudinary(
    files,
    `hop-cafe/${shopId || "default-shop"}/promotions`
  );
}

export async function uploadPostMediaToCloudinary(shopId, files = []) {
  return uploadMediaFilesToCloudinary(
    files,
    `hop-cafe/${shopId || "default-shop"}/posts`
  );
}

export async function uploadShopImageToCloudinary(
  shopId,
  file,
  type = "settings"
) {
  const uploaded = await uploadMediaToCloudinary(
    file,
    `hop-cafe/${shopId || "default-shop"}/${type}`
  );

  return uploaded?.url || "";
}