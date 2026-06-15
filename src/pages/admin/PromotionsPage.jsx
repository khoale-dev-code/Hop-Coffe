import { useEffect, useState } from "react";
import {
  closestCenter,
  DndContext,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  rectSortingStrategy,
  SortableContext,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  Edit,
  GripVertical,
  ImagePlus,
  Link2,
  Megaphone,
  Play,
  RefreshCw,
  Save,
  Trash,
  Upload,
  X,
} from "lucide-react";

import { DEFAULT_SHOP_ID } from "../../services/shopService";
import {
  createPromotion,
  deletePromotion,
  getPromotions,
  updatePromotion,
  uploadPromotionMedia,
} from "../../services/promotionService";

const emptyForm = {
  title: "",
  subtitle: "",
  description: "",
  media: [],
  imageUrl: "",
  buttonText: "Xem chi tiết",
  terms: "",
  startAt: "",
  endAt: "",
  isActive: true,
};

const emptyUrlForm = {
  url: "",
  type: "image",
  name: "",
};

function createLocalId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function getFileType(file) {
  if (file.type.startsWith("video/")) return "video";
  return "image";
}

function inferTypeFromUrl(url) {
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

function getNameFromUrl(url) {
  try {
    const pathname = new URL(url).pathname;
    const fileName = pathname.split("/").filter(Boolean).pop();

    return fileName || "Media URL";
  } catch {
    return "Media URL";
  }
}

function normalizePromotionMedia(promotion) {
  if (Array.isArray(promotion.media) && promotion.media.length > 0) {
    return promotion.media;
  }

  if (promotion.imageUrl) {
    return [
      {
        url: promotion.imageUrl,
        type: "image",
        name: "Ảnh khuyến mãi",
        mimeType: "image/*",
      },
    ];
  }

  return [];
}

function promotionToMediaDrafts(promotion) {
  return normalizePromotionMedia(promotion).map((media, index) => ({
    localId: createLocalId(),
    source: "existing",
    url: media.url,
    type: media.type || inferTypeFromUrl(media.url),
    name: media.name || `Media ${index + 1}`,
    mimeType: media.mimeType || "",
    size: media.size || 0,
  }));
}

export default function PromotionsPage() {
  const [promotions, setPromotions] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [urlForm, setUrlForm] = useState(emptyUrlForm);
  const [mediaDrafts, setMediaDrafts] = useState([]);
  const [editingId, setEditingId] = useState(null);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 6,
      },
    })
  );

  async function loadPromotions() {
    try {
      setLoading(true);
      setError("");

      const data = await getPromotions(DEFAULT_SHOP_ID);
      setPromotions(data);
    } catch (err) {
      console.error(err);
      setError("Không thể tải danh sách khuyến mãi.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadPromotions();
  }, []);

  function updateField(name, value) {
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  function updateUrlField(name, value) {
    setUrlForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  function getNextOrder() {
    if (promotions.length === 0) return 1;

    const maxOrder = Math.max(
      ...promotions.map((promotion) => Number(promotion.order || 0))
    );

    return maxOrder + 1;
  }

  function resetForm() {
    setForm(emptyForm);
    setUrlForm(emptyUrlForm);
    setMediaDrafts([]);
    setEditingId(null);
  }

  function handleEdit(promotion) {
    setEditingId(promotion.id);
    setUrlForm(emptyUrlForm);
    setMediaDrafts(promotionToMediaDrafts(promotion));

    setForm({
      title: promotion.title || "",
      subtitle: promotion.subtitle || "",
      description: promotion.description || "",
      media: normalizePromotionMedia(promotion),
      imageUrl: promotion.imageUrl || "",
      buttonText: promotion.buttonText || "Xem chi tiết",
      terms: promotion.terms || "",
      startAt: promotion.startAt || "",
      endAt: promotion.endAt || "",
      isActive: promotion.isActive ?? true,
    });

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  function handlePickFiles(files) {
    const selectedFiles = Array.from(files || []);

    if (selectedFiles.length === 0) return;

    const newDrafts = selectedFiles.map((file) => ({
      localId: createLocalId(),
      source: "file",
      file,
      url: URL.createObjectURL(file),
      type: getFileType(file),
      name: file.name,
      size: file.size,
      mimeType: file.type,
    }));

    setMediaDrafts((prev) => [...prev, ...newDrafts]);
  }

  function handleAddUrlMedia() {
    const url = urlForm.url.trim();

    if (!url) {
      setError("Vui lòng nhập link URL ảnh hoặc video.");
      return;
    }

    const type = urlForm.type || inferTypeFromUrl(url);
    const name = urlForm.name.trim() || getNameFromUrl(url);

    setMediaDrafts((prev) => [
      ...prev,
      {
        localId: createLocalId(),
        source: "url",
        url,
        type,
        name,
        mimeType: type === "video" ? "video/*" : "image/*",
        size: 0,
      },
    ]);

    setUrlForm(emptyUrlForm);
    setError("");
  }

  function handleRemoveMedia(localId) {
    setMediaDrafts((prev) =>
      prev.filter((mediaDraft) => mediaDraft.localId !== localId)
    );
  }

  function handleDragEnd(event) {
    const { active, over } = event;

    if (!over || active.id === over.id) return;

    setMediaDrafts((prev) => {
      const oldIndex = prev.findIndex((item) => item.localId === active.id);
      const newIndex = prev.findIndex((item) => item.localId === over.id);

      if (oldIndex === -1 || newIndex === -1) return prev;

      return arrayMove(prev, oldIndex, newIndex);
    });
  }

  async function buildFinalMedia() {
    const finalMedia = [];

    for (const draft of mediaDrafts) {
      if (draft.source === "file") {
        const uploaded = await uploadPromotionMedia(DEFAULT_SHOP_ID, [
          draft.file,
        ]);

        if (uploaded[0]) {
          finalMedia.push(uploaded[0]);
        }

        continue;
      }

      finalMedia.push({
        url: draft.url,
        type: draft.type,
        name: draft.name || "Media",
        mimeType: draft.mimeType || "",
        size: draft.size || 0,
      });
    }

    return finalMedia;
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (!form.title.trim()) {
      setError("Vui lòng nhập tiêu đề chương trình khuyến mãi.");
      return;
    }

    try {
      setSubmitting(true);
      setMessage("");
      setError("");

      const finalMedia = await buildFinalMedia();

      const firstImage =
        finalMedia.find((media) => media.type === "image") || finalMedia[0];

      const payload = {
        ...form,
        media: finalMedia,
        imageUrl: firstImage?.url || "",
      };

      if (editingId) {
        await updatePromotion(DEFAULT_SHOP_ID, editingId, payload);
        setMessage("Đã cập nhật chương trình khuyến mãi.");
      } else {
        await createPromotion(DEFAULT_SHOP_ID, {
          ...payload,
          order: getNextOrder(),
        });
        setMessage("Đã thêm chương trình khuyến mãi.");
      }

      resetForm();
      await loadPromotions();
    } catch (err) {
      console.error(err);
      setError("Không thể lưu chương trình khuyến mãi.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleToggleActive(promotion) {
    try {
      await updatePromotion(DEFAULT_SHOP_ID, promotion.id, {
        isActive: !promotion.isActive,
      });

      await loadPromotions();
    } catch (err) {
      console.error(err);
      setError("Không thể cập nhật trạng thái khuyến mãi.");
    }
  }

  async function handleDelete(promotionId) {
    const ok = window.confirm("Bạn có chắc muốn xóa chương trình này?");

    if (!ok) return;

    try {
      await deletePromotion(DEFAULT_SHOP_ID, promotionId);
      setMessage("Đã xóa chương trình khuyến mãi.");
      await loadPromotions();
    } catch (err) {
      console.error(err);
      setError("Không thể xóa chương trình khuyến mãi.");
    }
  }

  return (
    <div>
      <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wider text-neutral-400">
            Promotions
          </p>

          <h1 className="mt-1 text-3xl font-black">
            Quản lý banner khuyến mãi
          </h1>

          <p className="mt-2 text-neutral-500">
            Có thể upload file, thêm ảnh/video bằng link URL và kéo thả để đổi
            thứ tự hiển thị trong popup khuyến mãi.
          </p>
        </div>

        <button
          onClick={loadPromotions}
          className="inline-flex items-center justify-center gap-2 rounded-[5px] border border-neutral-200 bg-white px-4 py-3 text-sm font-semibold"
        >
          <RefreshCw size={18} />
          Tải lại
        </button>
      </div>

      {message && (
        <div className="mt-5 rounded-[5px] bg-green-50 px-4 py-3 text-sm font-medium text-green-700">
          {message}
        </div>
      )}

      {error && (
        <div className="mt-5 rounded-[5px] bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          {error}
        </div>
      )}

      <div className="mt-6 grid gap-6 lg:grid-cols-[440px_1fr]">
        <section className="rounded-[10px] bg-white p-5 shadow-sm">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="text-xl font-black">
                {editingId ? "Sửa khuyến mãi" : "Thêm khuyến mãi"}
              </h2>

              <p className="mt-1 text-sm text-neutral-500">
                Media đầu tiên sẽ là media hiển thị chính ngoài banner.
              </p>
            </div>

            {editingId && (
              <button
                type="button"
                onClick={resetForm}
                className="grid h-10 w-10 place-items-center rounded-[5px] bg-neutral-100"
              >
                <X size={18} />
              </button>
            )}
          </div>

          <form onSubmit={handleSubmit} className="mt-5 space-y-4">
            <Input
              label="Tiêu đề"
              value={form.title}
              onChange={(value) => updateField("title", value)}
              placeholder="Mua 2 tặng 1"
              required
            />

            <Input
              label="Mô tả ngắn"
              value={form.subtitle}
              onChange={(value) => updateField("subtitle", value)}
              placeholder="Áp dụng cho trà trái cây size L"
            />

            <div>
              <label className="text-sm font-semibold">Nội dung chi tiết</label>
              <textarea
                value={form.description}
                onChange={(event) =>
                  updateField("description", event.target.value)
                }
                rows={4}
                placeholder="Nhập chi tiết chương trình khuyến mãi..."
                className="mt-2 w-full rounded-[5px] border border-neutral-200 px-4 py-3 outline-none focus:border-neutral-950"
              />
            </div>

            <Input
              label="Nút hiển thị"
              value={form.buttonText}
              onChange={(value) => updateField("buttonText", value)}
              placeholder="Xem chi tiết"
            />

            <label className="block cursor-pointer rounded-[5px] border border-dashed border-neutral-300 bg-neutral-50 p-5 text-center hover:bg-neutral-100">
              <Upload className="mx-auto text-neutral-400" />
              <p className="mt-2 text-sm font-semibold">
                Upload ảnh hoặc video
              </p>
              <p className="mt-1 text-xs text-neutral-400">
                Hỗ trợ nhiều file: JPG, PNG, WEBP, MP4, WEBM
              </p>
              <input
                type="file"
                accept="image/*,video/*"
                multiple
                onChange={(event) => handlePickFiles(event.target.files)}
                className="hidden"
              />
            </label>

            <div className="rounded-[8px] border border-neutral-200 bg-neutral-50 p-4">
              <div className="flex items-center gap-2">
                <Link2 size={18} className="text-neutral-500" />
                <p className="text-sm font-black">Thêm bằng link URL</p>
              </div>

              <div className="mt-3 space-y-3">
                <input
                  value={urlForm.url}
                  onChange={(event) => updateUrlField("url", event.target.value)}
                  placeholder="Dán link ảnh hoặc video..."
                  className="w-full rounded-[5px] border border-neutral-200 bg-white px-4 py-3 text-sm outline-none focus:border-neutral-950"
                />

                <div className="grid gap-3 sm:grid-cols-[1fr_130px]">
                  <input
                    value={urlForm.name}
                    onChange={(event) =>
                      updateUrlField("name", event.target.value)
                    }
                    placeholder="Tên media, có thể bỏ trống"
                    className="w-full rounded-[5px] border border-neutral-200 bg-white px-4 py-3 text-sm outline-none focus:border-neutral-950"
                  />

                  <select
                    value={urlForm.type}
                    onChange={(event) =>
                      updateUrlField("type", event.target.value)
                    }
                    className="w-full rounded-[5px] border border-neutral-200 bg-white px-4 py-3 text-sm font-semibold outline-none focus:border-neutral-950"
                  >
                    <option value="image">Hình ảnh</option>
                    <option value="video">Video</option>
                  </select>
                </div>

                <button
                  type="button"
                  onClick={handleAddUrlMedia}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-[5px] bg-neutral-950 px-4 py-3 text-sm font-semibold text-white"
                >
                  <Link2 size={17} />
                  Thêm URL vào khuyến mãi
                </button>

                <p className="text-xs leading-5 text-neutral-400">
                  Với video, nên dùng link file trực tiếp dạng .mp4 hoặc .webm.
                  Link YouTube/Facebook thường không chạy trực tiếp trong thẻ
                  video.
                </p>
              </div>
            </div>

            {mediaDrafts.length > 0 && (
              <div>
                <div className="mb-3 flex items-center justify-between gap-3">
                  <p className="text-sm font-black">
                    Thứ tự hiển thị media
                  </p>

                  <p className="text-xs font-semibold text-neutral-400">
                    Kéo thả để sắp xếp
                  </p>
                </div>

                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={handleDragEnd}
                >
                  <SortableContext
                    items={mediaDrafts.map((media) => media.localId)}
                    strategy={rectSortingStrategy}
                  >
                    <div className="grid grid-cols-2 gap-3">
                      {mediaDrafts.map((media, index) => (
                        <SortableMediaCard
                          key={media.localId}
                          media={media}
                          index={index}
                          onRemove={() => handleRemoveMedia(media.localId)}
                        />
                      ))}
                    </div>
                  </SortableContext>
                </DndContext>
              </div>
            )}

            <div className="grid gap-3 sm:grid-cols-2">
              <Input
                label="Ngày bắt đầu"
                type="date"
                value={form.startAt}
                onChange={(value) => updateField("startAt", value)}
              />

              <Input
                label="Ngày kết thúc"
                type="date"
                value={form.endAt}
                onChange={(value) => updateField("endAt", value)}
              />
            </div>

            <div>
              <label className="text-sm font-semibold">Điều kiện áp dụng</label>
              <textarea
                value={form.terms}
                onChange={(event) => updateField("terms", event.target.value)}
                rows={3}
                placeholder="Ví dụ: Không áp dụng chung với chương trình khác..."
                className="mt-2 w-full rounded-[5px] border border-neutral-200 px-4 py-3 outline-none focus:border-neutral-950"
              />
            </div>

            <label className="flex items-center gap-3 rounded-[5px] bg-neutral-50 p-3">
              <input
                type="checkbox"
                checked={form.isActive}
                onChange={(event) =>
                  updateField("isActive", event.target.checked)
                }
                className="h-5 w-5"
              />
              <span className="text-sm font-semibold">
                Bật hiển thị khuyến mãi
              </span>
            </label>

            <button
              disabled={submitting}
              className="inline-flex w-full items-center justify-center gap-2 rounded-[5px] bg-neutral-950 px-4 py-3 text-sm font-semibold text-white disabled:opacity-60"
            >
              <Save size={18} />
              {submitting
                ? "Đang lưu..."
                : editingId
                ? "Cập nhật khuyến mãi"
                : "Thêm khuyến mãi"}
            </button>
          </form>
        </section>

        <section className="rounded-[10px] bg-white p-5 shadow-sm">
          <div className="flex items-end justify-between gap-3">
            <div>
              <h2 className="text-xl font-black">Danh sách khuyến mãi</h2>
              <p className="mt-1 text-sm text-neutral-500">
                Mỗi chương trình có thể chứa nhiều ảnh, video hoặc URL media.
              </p>
            </div>

            <p className="text-sm font-semibold text-neutral-400">
              {promotions.length} chương trình
            </p>
          </div>

          {loading ? (
            <p className="mt-5 text-neutral-500">Đang tải khuyến mãi...</p>
          ) : (
            <div className="mt-5 space-y-4">
              {promotions.length === 0 && (
                <div className="rounded-[5px] bg-neutral-50 p-6 text-center">
                  <Megaphone className="mx-auto text-neutral-400" />
                  <p className="mt-3 text-sm text-neutral-500">
                    Chưa có chương trình khuyến mãi nào.
                  </p>
                </div>
              )}

              {promotions.map((promotion) => {
                const mediaList = normalizePromotionMedia(promotion);
                const firstMedia = mediaList[0];

                return (
                  <article
                    key={promotion.id}
                    className="overflow-hidden rounded-[10px] border border-neutral-100 bg-white shadow-sm"
                  >
                    <div className="grid gap-4 md:grid-cols-[240px_1fr]">
                      <div className="bg-neutral-100">
                        <AdminMediaThumb media={firstMedia} />
                      </div>

                      <div className="p-4">
                        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
                          <div>
                            <h3 className="text-lg font-black">
                              {promotion.title}
                            </h3>

                            {promotion.subtitle && (
                              <p className="mt-1 text-sm text-neutral-500">
                                {promotion.subtitle}
                              </p>
                            )}

                            <div className="mt-3 flex flex-wrap gap-2">
                              <span
                                className={`rounded-[5px] px-3 py-1 text-xs font-bold ${
                                  promotion.isActive
                                    ? "bg-green-50 text-green-700"
                                    : "bg-neutral-100 text-neutral-500"
                                }`}
                              >
                                {promotion.isActive ? "Đang bật" : "Đang tắt"}
                              </span>

                              <span className="rounded-[5px] bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700">
                                {mediaList.length} media
                              </span>

                              {promotion.startAt && (
                                <span className="rounded-[5px] bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700">
                                  Từ {promotion.startAt}
                                </span>
                              )}

                              {promotion.endAt && (
                                <span className="rounded-[5px] bg-orange-50 px-3 py-1 text-xs font-bold text-orange-700">
                                  Đến {promotion.endAt}
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={() => handleEdit(promotion)}
                              className="grid h-9 w-9 place-items-center rounded-[5px] bg-neutral-100"
                            >
                              <Edit size={16} />
                            </button>

                            <button
                              type="button"
                              onClick={() => handleDelete(promotion.id)}
                              className="grid h-9 w-9 place-items-center rounded-[5px] bg-red-50 text-red-600"
                            >
                              <Trash size={16} />
                            </button>
                          </div>
                        </div>

                        {promotion.description && (
                          <p className="mt-3 line-clamp-2 text-sm leading-6 text-neutral-500">
                            {promotion.description}
                          </p>
                        )}

                        <button
                          type="button"
                          onClick={() => handleToggleActive(promotion)}
                          className="mt-4 rounded-[5px] border border-neutral-200 px-4 py-2 text-sm font-semibold"
                        >
                          {promotion.isActive
                            ? "Tắt hiển thị"
                            : "Bật hiển thị"}
                        </button>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

function SortableMediaCard({ media, index, onRemove }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: media.localId,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`overflow-hidden rounded-[5px] border bg-neutral-50 ${
        isDragging
          ? "z-50 border-neutral-950 shadow-xl"
          : "border-neutral-200"
      }`}
    >
      <div className="relative grid min-h-28 place-items-center bg-neutral-100">
        {media.type === "video" ? (
          <video
            src={media.url}
            className="max-h-40 w-full object-contain"
            controls
            preload="metadata"
          />
        ) : (
          <img
            src={media.url}
            alt={media.name || "Media khuyến mãi"}
            className="max-h-40 w-full object-contain"
          />
        )}

        <span className="absolute left-2 top-2 rounded-[5px] bg-black/70 px-2 py-1 text-xs font-bold text-white">
          #{index + 1}
        </span>

        <button
          type="button"
          {...attributes}
          {...listeners}
          className="absolute bottom-2 left-2 grid h-8 w-8 cursor-grab place-items-center rounded-[5px] bg-white text-neutral-600 shadow active:cursor-grabbing"
        >
          <GripVertical size={16} />
        </button>

        <button
          type="button"
          onClick={onRemove}
          className="absolute right-2 top-2 grid h-8 w-8 place-items-center rounded-[5px] bg-white text-red-600 shadow"
        >
          <X size={15} />
        </button>
      </div>

      <div className="p-2">
        <p className="truncate text-xs font-semibold text-neutral-700">
          {media.name || "Media"}
        </p>

        <p className="mt-1 text-xs text-neutral-400">
          {media.type === "video" ? "Video" : "Hình ảnh"}
          {media.source === "file"
            ? " · Chưa upload"
            : media.source === "url"
            ? " · URL"
            : " · Đã lưu"}
        </p>
      </div>
    </div>
  );
}

function AdminMediaThumb({ media }) {
  if (!media) {
    return (
      <div className="grid h-48 place-items-center text-neutral-400">
        <ImagePlus size={36} />
      </div>
    );
  }

  if (media.type === "video") {
    return (
      <div className="relative grid h-48 place-items-center bg-neutral-100">
        <video
          src={media.url}
          className="max-h-48 w-full object-contain"
          preload="metadata"
        />

        <div className="absolute grid h-12 w-12 place-items-center rounded-full bg-black/70 text-white">
          <Play size={20} />
        </div>
      </div>
    );
  }

  return (
    <div className="grid h-48 place-items-center bg-neutral-100">
      <img
        src={media.url}
        alt={media.name || "Ảnh khuyến mãi"}
        className="max-h-48 w-full object-contain"
      />
    </div>
  );
}

function Input({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  required = false,
}) {
  return (
    <div>
      <label className="text-sm font-semibold">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        required={required}
        className="mt-2 w-full rounded-[5px] border border-neutral-200 px-4 py-3 outline-none focus:border-neutral-950"
      />
    </div>
  );
}