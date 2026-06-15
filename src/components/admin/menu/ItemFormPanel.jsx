import { useEffect, useMemo, useState } from "react";
import {
  BadgeCheck,
  Film,
  ImagePlus,
  Link2,
  Loader2,
  Plus,
  Save,
  Sparkles,
  Trash,
  Upload,
  X,
} from "lucide-react";

function createLocalId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function inferMediaType(url = "") {
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

function getFileType(file) {
  if (file?.type?.startsWith("video/")) return "video";
  return "image";
}

function getFileKindLabel(file) {
  if (file?.type === "image/gif") return "GIF";
  if (file?.type?.startsWith("video/")) return "Video";
  return "Ảnh";
}

function normalizeMediaList(itemForm) {
  const list = Array.isArray(itemForm.images) ? itemForm.images : [];

  const normalized = list
    .map((media, index) => {
      if (typeof media === "string") {
        return {
          id: `url-${index}`,
          url: media,
          type: inferMediaType(media),
          name: `Media ${index + 1}`,
        };
      }

      return {
        id: media.id || media.localId || `url-${index}`,
        url: media.url || "",
        type: media.type || inferMediaType(media.url || ""),
        name: media.name || `Media ${index + 1}`,
      };
    })
    .filter((media) => media.url);

  if (
    itemForm.imageUrl &&
    !normalized.some((media) => media.url === itemForm.imageUrl)
  ) {
    normalized.unshift({
      id: "primary-image-url",
      url: itemForm.imageUrl,
      type: inferMediaType(itemForm.imageUrl),
      name: "Ảnh chính",
    });
  }

  return normalized;
}

function getSelectedFiles(imageFile) {
  if (Array.isArray(imageFile)) return imageFile.filter(Boolean);
  if (imageFile) return [imageFile];
  return [];
}

export default function ItemFormPanel({
  categories,
  itemForm,
  updateItemForm,
  editingItemId,
  imageFile,
  setImageFile,
  imagePreviewUrl,
  itemSubmitting,
  onSubmit,
  onReset,
  onAddSize,
  onUpdateSize,
  onRemoveSize,
}) {
  const [urlInput, setUrlInput] = useState("");
  const [urlType, setUrlType] = useState("image");
  const [localPreviews, setLocalPreviews] = useState([]);

  const selectedFiles = useMemo(() => getSelectedFiles(imageFile), [imageFile]);
  const savedMedia = useMemo(() => normalizeMediaList(itemForm), [itemForm]);

  useEffect(() => {
    const previews = selectedFiles.map((file, index) => ({
      id: `${file.name}-${file.size}-${index}`,
      url: URL.createObjectURL(file),
      type: getFileType(file),
      name: file.name,
      file,
      source: "file",
      fileIndex: index,
    }));

    setLocalPreviews(previews);

    return () => {
      previews.forEach((preview) => URL.revokeObjectURL(preview.url));
    };
  }, [selectedFiles]);

  const previewItems = [
    ...localPreviews,
    ...savedMedia.map((media) => ({
      ...media,
      source: "url",
    })),
  ];

  const primaryPreview =
    localPreviews[0] ||
    savedMedia[0] ||
    (imagePreviewUrl
      ? {
          id: "legacy-preview",
          url: imagePreviewUrl,
          type: inferMediaType(imagePreviewUrl),
          name: "Preview",
          source: "url",
        }
      : null);

  function setSelectedFiles(nextFiles) {
    if (!nextFiles || nextFiles.length === 0) {
      setImageFile(null);
      return;
    }

    setImageFile(nextFiles.length === 1 ? nextFiles[0] : nextFiles);
  }

  function handlePickFiles(event) {
    const files = Array.from(event.target.files || []);

    if (files.length === 0) return;

    const currentFiles = getSelectedFiles(imageFile);
    setSelectedFiles([...currentFiles, ...files]);

    updateItemForm("imageUrl", "");

    event.target.value = "";
  }

  function removeSelectedFile(index) {
    const nextFiles = selectedFiles.filter((_, fileIndex) => fileIndex !== index);
    setSelectedFiles(nextFiles);
  }

  function addUrlMedia() {
    const url = urlInput.trim();

    if (!url) return;

    const currentMedia = normalizeMediaList(itemForm);

    const newMedia = {
      id: createLocalId(),
      url,
      type: urlType || inferMediaType(url),
      name: url.includes(".gif") ? "GIF media" : "Media URL",
    };

    const nextMedia = [...currentMedia, newMedia];

    updateItemForm("images", nextMedia);
    updateItemForm(
      "imageUrl",
      nextMedia.find((media) => media.type === "image")?.url ||
        nextMedia[0]?.url ||
        ""
    );

    setUrlInput("");
    setUrlType("image");
  }

  function removeSavedMedia(mediaUrl) {
    const nextMedia = normalizeMediaList(itemForm).filter(
      (media) => media.url !== mediaUrl
    );

    updateItemForm("images", nextMedia);
    updateItemForm(
      "imageUrl",
      nextMedia.find((media) => media.type === "image")?.url ||
        nextMedia[0]?.url ||
        ""
    );
  }

  function clearAllMedia() {
    setImageFile(null);
    updateItemForm("imageUrl", "");
    updateItemForm("images", []);
  }

  return (
    <section className="overflow-hidden rounded-[16px] border border-neutral-200 bg-white shadow-sm">
      <div className="border-b border-neutral-200 bg-[radial-gradient(circle_at_top_left,rgba(124,174,184,0.18),transparent_34%),radial-gradient(circle_at_top_right,rgba(178,40,48,0.08),transparent_32%)] p-4 sm:p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs font-black uppercase tracking-[0.16em] text-[#7CAEB8]">
              Menu item
            </p>

            <h2 className="mt-1 text-2xl font-black tracking-tight text-neutral-950">
              {editingItemId ? "Sửa món" : "Thêm món mới"}
            </h2>

            <p className="mt-2 max-w-xl text-sm leading-6 text-neutral-500">
              Nhập thông tin món, thêm nhiều ảnh, GIF hoặc video để hiển thị sản
              phẩm sinh động hơn trên menu.
            </p>
          </div>

          {editingItemId && (
            <button
              type="button"
              onClick={onReset}
              className="grid h-10 w-10 shrink-0 place-items-center rounded-[10px] bg-white text-neutral-700 shadow-sm ring-1 ring-neutral-200 transition hover:bg-neutral-100"
              aria-label="Hủy sửa món"
            >
              <X size={18} />
            </button>
          )}
        </div>
      </div>

      <form onSubmit={onSubmit} className="space-y-4 p-3 sm:p-5">
        <FormSection title="Thông tin cơ bản" icon={BadgeCheck}>
          <FormInput
            label="Tên món"
            value={itemForm.name}
            onChange={(value) => updateItemForm("name", value)}
            placeholder="Bạc xỉu đá"
            required
          />

          <div>
            <label className="text-sm font-black text-neutral-800">
              Danh mục
            </label>

            <select
              value={itemForm.categoryId}
              onChange={(event) =>
                updateItemForm("categoryId", event.target.value)
              }
              className="mt-2 h-12 w-full rounded-[10px] border border-neutral-200 bg-white px-4 text-sm font-bold text-neutral-900 outline-none transition focus:border-neutral-950"
              required
            >
              <option value="">Chọn danh mục</option>

              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          <div className="grid gap-3 min-[430px]:grid-cols-2">
            <FormInput
              label="Giá mặc định"
              type="number"
              value={itemForm.price}
              onChange={(value) => updateItemForm("price", value)}
              placeholder="Dùng khi món không có size"
            />

            <FormInput
              label="Giá cũ"
              type="number"
              value={itemForm.oldPrice}
              onChange={(value) => updateItemForm("oldPrice", value)}
              placeholder="30000"
            />
          </div>
        </FormSection>

        <SizeEditor
          sizes={itemForm.sizes || []}
          onAddSize={onAddSize}
          onUpdateSize={onUpdateSize}
          onRemoveSize={onRemoveSize}
        />

        <FormSection title="Mô tả và media sản phẩm" icon={ImagePlus}>
          <div>
            <label className="text-sm font-black text-neutral-800">Mô tả</label>

            <textarea
              value={itemForm.description}
              onChange={(event) =>
                updateItemForm("description", event.target.value)
              }
              rows={4}
              placeholder="Mô tả ngắn về món..."
              className="mt-2 w-full resize-none rounded-[10px] border border-neutral-200 bg-white px-4 py-3 text-sm font-medium text-neutral-900 outline-none transition placeholder:text-neutral-400 focus:border-neutral-950"
            />
          </div>

          <div className="overflow-hidden rounded-[14px] border border-neutral-200 bg-neutral-50">
            <div className="flex flex-col gap-3 border-b border-neutral-200 bg-white p-3 sm:flex-row sm:items-start sm:justify-between sm:p-4">
              <div>
                <p className="text-sm font-black text-neutral-950">
                  Hình ảnh / video / GIF
                </p>

                <p className="mt-1 max-w-xl text-xs leading-5 text-neutral-500">
                  Thêm nhiều ảnh, GIF hoặc video. File từ máy sẽ được upload
                  lên Cloudinary khi bấm lưu món.
                </p>
              </div>

              {previewItems.length > 0 && (
                <button
                  type="button"
                  onClick={clearAllMedia}
                  className="inline-flex items-center justify-center gap-1.5 rounded-[8px] bg-red-50 px-3 py-2 text-xs font-black uppercase tracking-[0.06em] text-red-600 transition hover:bg-red-100"
                >
                  <Trash size={14} />
                  Xóa tất cả
                </button>
              )}
            </div>

            <div className="space-y-4 p-3 sm:p-4">
              <div className="overflow-hidden rounded-[12px] border border-neutral-200 bg-white">
                <div className="grid aspect-[16/10] min-h-[190px] place-items-center bg-white sm:aspect-[16/8]">
                  {primaryPreview ? (
                    <MediaPreview media={primaryPreview} large />
                  ) : (
                    <div className="text-center text-neutral-400">
                      <ImagePlus size={42} className="mx-auto" />
                      <p className="mt-2 text-xs font-bold">Chưa có media</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="grid gap-3 xl:grid-cols-2">
                <div className="rounded-[12px] border border-neutral-200 bg-white p-3">
                  <p className="text-sm font-black text-neutral-950">
                    Link media chính
                  </p>

                  <p className="mt-1 text-xs leading-5 text-neutral-400">
                    Dán link ảnh, GIF hoặc video nếu đã có URL sẵn.
                  </p>

                  <input
                    value={itemForm.imageUrl || ""}
                    onChange={(event) => {
                      const value = event.target.value;

                      setImageFile(null);
                      updateItemForm("imageUrl", value);
                      updateItemForm(
                        "images",
                        value
                          ? [
                              {
                                id: "primary-url",
                                url: value,
                                type: inferMediaType(value),
                                name: "Media chính",
                              },
                            ]
                          : []
                      );
                    }}
                    placeholder="Dán link ảnh / GIF / video..."
                    className="mt-3 h-12 w-full rounded-[10px] border border-neutral-200 bg-white px-4 text-sm font-bold text-neutral-900 outline-none transition placeholder:text-neutral-400 focus:border-neutral-950"
                  />
                </div>

                <label className="flex min-h-[150px] cursor-pointer flex-col items-center justify-center rounded-[12px] border border-dashed border-neutral-300 bg-white p-4 text-center transition hover:border-neutral-400 hover:bg-neutral-50">
                  <Upload className="text-neutral-400" size={32} />

                  <p className="mt-3 text-sm font-black text-neutral-950">
                    Chọn nhiều file từ máy
                  </p>

                  <p className="mt-1 max-w-md text-xs leading-5 text-neutral-400">
                    Hỗ trợ JPG, PNG, WEBP, GIF, MP4, WEBM, MOV. Có thể chọn
                    nhiều file cùng lúc.
                  </p>

                  <span className="mt-3 inline-flex items-center justify-center rounded-[8px] bg-neutral-950 px-4 py-2.5 text-xs font-black uppercase tracking-[0.08em] text-white">
                    Chọn file
                  </span>

                  <input
                    type="file"
                    accept="image/*,video/*,.gif"
                    multiple
                    onChange={handlePickFiles}
                    className="hidden"
                  />
                </label>
              </div>

              <div className="rounded-[12px] border border-neutral-200 bg-white p-3">
                <div className="flex items-center gap-2">
                  <Link2 size={17} className="text-neutral-500" />
                  <p className="text-sm font-black text-neutral-950">
                    Thêm media bằng URL
                  </p>
                </div>

                <div className="mt-3 grid gap-2 sm:grid-cols-[1fr_120px]">
                  <input
                    value={urlInput}
                    onChange={(event) => setUrlInput(event.target.value)}
                    placeholder="Dán link ảnh, GIF hoặc video..."
                    className="h-11 rounded-[8px] border border-neutral-200 bg-white px-3 text-sm font-bold outline-none focus:border-neutral-950"
                  />

                  <select
                    value={urlType}
                    onChange={(event) => setUrlType(event.target.value)}
                    className="h-11 rounded-[8px] border border-neutral-200 bg-white px-3 text-sm font-black outline-none focus:border-neutral-950"
                  >
                    <option value="image">Ảnh / GIF</option>
                    <option value="video">Video</option>
                  </select>
                </div>

                <button
                  type="button"
                  onClick={addUrlMedia}
                  className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-[8px] bg-neutral-950 px-4 py-3 text-sm font-black text-white transition hover:bg-neutral-800"
                >
                  <Plus size={16} />
                  Thêm URL
                </button>
              </div>
            </div>

            {previewItems.length > 0 && (
              <div className="border-t border-neutral-200 bg-white p-3 sm:p-4">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <p className="text-sm font-black text-neutral-950">
                    Media đã thêm
                  </p>

                  <p className="text-xs font-bold text-neutral-400">
                    {previewItems.length} mục
                  </p>
                </div>

                <div className="grid gap-3 min-[430px]:grid-cols-2">
                  {previewItems.map((media, index) => (
                    <MediaCard
                      key={`${media.source}-${media.url}-${index}`}
                      media={media}
                      index={index}
                      onRemove={() => {
                        if (media.source === "file") {
                          removeSelectedFile(media.fileIndex);
                        } else {
                          removeSavedMedia(media.url);
                        }
                      }}
                    />
                  ))}
                </div>
              </div>
            )}

            {selectedFiles.length > 0 && (
              <div className="border-t border-emerald-100 bg-emerald-50 px-3 py-2 text-xs font-bold leading-5 text-emerald-700 sm:px-4">
                Đã chọn {selectedFiles.length} file mới. Khi bấm lưu, các file
                này sẽ được upload lên Cloudinary và lưu vào món.
              </div>
            )}
          </div>

          <FormInput
            label="Tags"
            value={itemForm.tagsText}
            onChange={(value) => updateItemForm("tagsText", value)}
            placeholder="best seller, đá xay, topping"
          />
        </FormSection>

        <FormSection title="Trạng thái hiển thị" icon={Sparkles}>
          <div className="grid gap-3 min-[430px]:grid-cols-2">
            <ToggleCard
              label="Món còn bán"
              description="Khách vẫn nhìn thấy và có thể chọn món này."
              checked={itemForm.isAvailable}
              onChange={(checked) => updateItemForm("isAvailable", checked)}
            />

            <ToggleCard
              label="Món nổi bật"
              description="Hiển thị trong khu vực sản phẩm nổi bật."
              checked={itemForm.isFeatured}
              onChange={(checked) => updateItemForm("isFeatured", checked)}
            />
          </div>
        </FormSection>

        <div className="sticky bottom-3 z-10 rounded-[12px] bg-white/95 pt-2 backdrop-blur sm:static sm:bg-transparent sm:pt-0">
          <button
            type="submit"
            disabled={itemSubmitting}
            className="inline-flex w-full items-center justify-center gap-2 rounded-[10px] bg-neutral-950 px-4 py-4 text-sm font-black uppercase tracking-[0.08em] text-white shadow-[0_12px_26px_rgba(0,0,0,0.16)] transition hover:bg-neutral-800 disabled:opacity-60 sm:py-3 sm:shadow-none"
          >
            {itemSubmitting ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <Save size={18} />
            )}

            {itemSubmitting
              ? selectedFiles.length > 0
                ? "Đang upload Cloudinary..."
                : "Đang lưu..."
              : editingItemId
                ? "Cập nhật món"
                : "Thêm món vào menu"}
          </button>
        </div>
      </form>
    </section>
  );
}

function MediaPreview({ media, large = false }) {
  if (media.type === "video") {
    return (
      <video
        src={media.url}
        controls={large}
        muted={!large}
        playsInline
        preload="metadata"
        className="h-full w-full object-contain p-2"
      />
    );
  }

  return (
    <img
      src={media.url}
      alt={media.name || "Media"}
      className="h-full w-full object-contain p-2"
    />
  );
}

function MediaCard({ media, index, onRemove }) {
  return (
    <div className="overflow-hidden rounded-[12px] border border-neutral-200 bg-white shadow-sm">
      <div className="relative grid aspect-square place-items-center bg-neutral-50">
        <MediaPreview media={media} />

        <span className="absolute left-2 top-2 rounded-[6px] bg-black/70 px-2 py-1 text-[10px] font-black uppercase text-white">
          #{index + 1}
        </span>

        <span className="absolute bottom-2 left-2 inline-flex items-center gap-1 rounded-[6px] bg-white/95 px-2 py-1 text-[10px] font-black uppercase text-neutral-700 shadow">
          {media.type === "video" ? <Film size={12} /> : <ImagePlus size={12} />}
          {media.type === "video" ? "Video" : "Ảnh/GIF"}
        </span>

        <button
          type="button"
          onClick={onRemove}
          className="absolute right-2 top-2 grid h-8 w-8 place-items-center rounded-[8px] bg-white text-red-600 shadow transition hover:bg-red-50"
          aria-label="Xóa media"
        >
          <X size={15} />
        </button>
      </div>

      <div className="p-3">
        <p className="truncate text-xs font-black text-neutral-700">
          {media.name || "Media"}
        </p>

        <p className="mt-1 text-xs font-bold text-neutral-400">
          {media.source === "file"
            ? `${getFileKindLabel(media.file)} · Chờ upload`
            : "URL / đã lưu"}
        </p>
      </div>
    </div>
  );
}

function FormSection({ title, icon: Icon, children }) {
  return (
    <div className="rounded-[14px] border border-neutral-200 bg-white p-3 sm:p-4">
      <div className="mb-4 flex items-center gap-2 border-b border-neutral-100 pb-3">
        {Icon && <Icon size={18} className="text-[#7CAEB8]" />}
        <p className="text-sm font-black text-neutral-950">{title}</p>
      </div>

      <div className="space-y-4">{children}</div>
    </div>
  );
}

function SizeEditor({ sizes, onAddSize, onUpdateSize, onRemoveSize }) {
  return (
    <div className="rounded-[14px] border border-neutral-200 bg-neutral-50 p-3 sm:p-4">
      <div className="flex flex-col gap-3 min-[430px]:flex-row min-[430px]:items-start min-[430px]:justify-between">
        <div>
          <p className="text-sm font-black text-neutral-950">
            Size và giá từng size
          </p>

          <p className="mt-1 text-xs leading-5 text-neutral-500">
            Không bắt buộc. Nếu món có nhiều size, thêm từng size và nhập giá
            riêng cho từng ly.
          </p>
        </div>

        <button
          type="button"
          onClick={onAddSize}
          className="inline-flex w-full shrink-0 items-center justify-center gap-2 rounded-[8px] bg-neutral-950 px-3 py-2.5 text-xs font-black uppercase tracking-[0.08em] text-white transition hover:bg-neutral-800 min-[430px]:w-auto"
        >
          <Plus size={14} />
          Thêm size
        </button>
      </div>

      {sizes.length === 0 ? (
        <div className="mt-4 rounded-[10px] border border-dashed border-neutral-300 bg-white p-4 text-sm leading-6 text-neutral-500">
          Chưa thêm size. Món sẽ dùng giá mặc định bên trên.
        </div>
      ) : (
        <div className="mt-4 space-y-3">
          {sizes.map((size, index) => (
            <div
              key={size.id}
              className="rounded-[12px] border border-neutral-200 bg-white p-3 shadow-sm"
            >
              <div className="mb-3 flex items-center justify-between gap-3 border-b border-neutral-100 pb-3">
                <p className="text-xs font-black uppercase tracking-[0.12em] text-neutral-400">
                  Size {index + 1}
                </p>

                <button
                  type="button"
                  onClick={() => onRemoveSize(size.id)}
                  className="grid h-9 w-9 place-items-center rounded-[8px] bg-red-50 text-red-600 transition hover:bg-red-100"
                  aria-label="Xóa size"
                >
                  <Trash size={14} />
                </button>
              </div>

              <div className="grid gap-3 min-[430px]:grid-cols-2">
                <Field
                  label="Tên size"
                  value={size.name}
                  onChange={(value) => onUpdateSize(size.id, "name", value)}
                  placeholder="M, L, XL..."
                />

                <Field
                  label="Giá size"
                  type="number"
                  value={size.price}
                  onChange={(value) => onUpdateSize(size.id, "price", value)}
                  placeholder="29000"
                />

                <Field
                  label="Giá cũ của size"
                  type="number"
                  value={size.oldPrice}
                  onChange={(value) => onUpdateSize(size.id, "oldPrice", value)}
                  placeholder="35000"
                />

                <Field
                  label="Ghi chú size"
                  value={size.description}
                  onChange={(value) =>
                    onUpdateSize(size.id, "description", value)
                  }
                  placeholder="500ml, 700ml..."
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function ToggleCard({ label, description, checked, onChange }) {
  return (
    <label className="flex cursor-pointer items-start gap-3 rounded-[12px] border border-neutral-200 bg-white p-3 transition hover:border-neutral-300">
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="mt-0.5 h-5 w-5 shrink-0"
      />

      <span>
        <span className="block text-sm font-black text-neutral-950">
          {label}
        </span>

        <span className="mt-1 block text-xs leading-5 text-neutral-500">
          {description}
        </span>
      </span>
    </label>
  );
}

function Field({ label, value, onChange, placeholder, type = "text" }) {
  return (
    <div>
      <label className="text-xs font-black text-neutral-600">{label}</label>

      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="mt-1.5 h-11 w-full rounded-[8px] border border-neutral-200 bg-white px-3 text-sm font-bold text-neutral-900 outline-none transition placeholder:text-neutral-400 focus:border-neutral-950"
      />
    </div>
  );
}

function FormInput({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  required = false,
}) {
  return (
    <div>
      <label className="text-sm font-black text-neutral-800">{label}</label>

      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        required={required}
        className="mt-2 h-12 w-full rounded-[10px] border border-neutral-200 bg-white px-4 text-sm font-bold text-neutral-900 outline-none transition placeholder:text-neutral-400 focus:border-neutral-950"
      />
    </div>
  );
}