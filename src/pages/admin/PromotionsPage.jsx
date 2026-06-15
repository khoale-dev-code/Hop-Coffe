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
  ListChecks,
  Loader2,
  Megaphone,
  Play,
  PlusCircle,
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
} from "../../services/promotionService";
import { uploadMediaFilesToCloudinary } from "../../services/cloudinaryService";

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

const mobileTabs = [
  {
    id: "list",
    label: "Danh sách",
    icon: ListChecks,
  },
  {
    id: "form",
    label: "Thêm/Sửa",
    icon: PlusCircle,
  },
];

function createLocalId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function getFileType(file) {
  if (file?.type?.startsWith("video/")) return "video";
  return "image";
}

function inferTypeFromUrl(url = "") {
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

function isValidUrl(value = "") {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
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
  if (Array.isArray(promotion?.media) && promotion.media.length > 0) {
    return promotion.media
      .map((media) => ({
        url: media?.url || "",
        type: media?.type || inferTypeFromUrl(media?.url || ""),
        name: media?.name || "Media",
        mimeType: media?.mimeType || "",
        size: Number(media?.size || 0),
        publicId: media?.publicId || "",
      }))
      .filter((media) => media.url);
  }

  if (promotion?.imageUrl) {
    return [
      {
        url: promotion.imageUrl,
        type: "image",
        name: "Ảnh khuyến mãi",
        mimeType: "image/*",
        size: 0,
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
    publicId: media.publicId || "",
  }));
}

function revokeDraftUrls(mediaDrafts = []) {
  mediaDrafts.forEach((draft) => {
    if (draft.source === "file" && draft.url) {
      URL.revokeObjectURL(draft.url);
    }
  });
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
  const [mobileTab, setMobileTab] = useState("list");

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

    return () => {
      revokeDraftUrls(mediaDrafts);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
    revokeDraftUrls(mediaDrafts);

    setForm(emptyForm);
    setUrlForm(emptyUrlForm);
    setMediaDrafts([]);
    setEditingId(null);
  }

  function handleEdit(promotion) {
    revokeDraftUrls(mediaDrafts);

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

    setMobileTab("form");

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

    if (!isValidUrl(url)) {
      setError("Link media chưa hợp lệ. Vui lòng dùng link bắt đầu bằng http hoặc https.");
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
    setMediaDrafts((prev) => {
      const removed = prev.find((mediaDraft) => mediaDraft.localId === localId);

      if (removed?.source === "file" && removed?.url) {
        URL.revokeObjectURL(removed.url);
      }

      return prev.filter((mediaDraft) => mediaDraft.localId !== localId);
    });
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
        const uploaded = await uploadMediaFilesToCloudinary(
          [draft.file],
          `hop-cafe/${DEFAULT_SHOP_ID}/promotions`
        );

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
        size: Number(draft.size || 0),
        publicId: draft.publicId || "",
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
      setMobileTab("list");
      await loadPromotions();
    } catch (err) {
      console.error(err);
      setError(
        err?.message ||
          "Không thể lưu chương trình khuyến mãi. Vui lòng kiểm tra Cloudinary."
      );
    } finally {
      setSubmitting(false);
    }
  }

  async function handleToggleActive(promotion) {
    try {
      await updatePromotion(DEFAULT_SHOP_ID, promotion.id, {
        isActive: !(promotion.isActive ?? true),
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
    <div className="space-y-4 sm:space-y-5">
      <PageTopHeader
        loading={loading}
        onRefresh={loadPromotions}
        count={promotions.length}
      />

      <NoticeBox message={message} error={error} />

      <MobileTabBar activeTab={mobileTab} setActiveTab={setMobileTab} />

      <div className="lg:hidden">
        {mobileTab === "list" && (
          <PromotionsListPanel
            loading={loading}
            promotions={promotions}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onToggleActive={handleToggleActive}
          />
        )}

        {mobileTab === "form" && (
          <PromotionFormPanel
            form={form}
            updateField={updateField}
            urlForm={urlForm}
            updateUrlField={updateUrlField}
            mediaDrafts={mediaDrafts}
            sensors={sensors}
            editingId={editingId}
            submitting={submitting}
            onSubmit={handleSubmit}
            onReset={resetForm}
            onPickFiles={handlePickFiles}
            onAddUrlMedia={handleAddUrlMedia}
            onRemoveMedia={handleRemoveMedia}
            onDragEnd={handleDragEnd}
          />
        )}
      </div>

      <div className="hidden gap-6 lg:grid lg:grid-cols-[440px_1fr]">
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <PromotionFormPanel
            form={form}
            updateField={updateField}
            urlForm={urlForm}
            updateUrlField={updateUrlField}
            mediaDrafts={mediaDrafts}
            sensors={sensors}
            editingId={editingId}
            submitting={submitting}
            onSubmit={handleSubmit}
            onReset={resetForm}
            onPickFiles={handlePickFiles}
            onAddUrlMedia={handleAddUrlMedia}
            onRemoveMedia={handleRemoveMedia}
            onDragEnd={handleDragEnd}
          />
        </aside>

        <PromotionsListPanel
          loading={loading}
          promotions={promotions}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onToggleActive={handleToggleActive}
        />
      </div>
    </div>
  );
}

function PageTopHeader({ loading, onRefresh, count }) {
  return (
    <div className="rounded-[12px] border border-neutral-200 bg-white p-3 shadow-sm sm:p-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm font-black uppercase tracking-[0.18em] text-neutral-400">
            Promotions
          </p>

          <h1 className="mt-1 text-2xl font-black text-neutral-950 sm:text-3xl">
            Quản lý banner khuyến mãi
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-neutral-500">
            Upload ảnh/video lên Cloudinary, thêm media bằng URL và kéo thả để
            đổi thứ tự hiển thị trong popup khuyến mãi.
          </p>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <div className="inline-flex w-fit rounded-[8px] bg-neutral-100 px-3 py-2 text-sm font-black text-neutral-600">
            {count} chương trình
          </div>

          <button
            type="button"
            onClick={onRefresh}
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 rounded-[8px] border border-neutral-200 bg-white px-4 py-3 text-sm font-black text-neutral-900 transition hover:bg-neutral-50 disabled:opacity-60"
          >
            <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
            Tải lại
          </button>
        </div>
      </div>
    </div>
  );
}

function NoticeBox({ message, error }) {
  if (!message && !error) return null;

  return (
    <div className="space-y-3">
      {message && (
        <div className="rounded-[8px] border border-green-100 bg-green-50 px-4 py-3 text-sm font-bold text-green-700">
          {message}
        </div>
      )}

      {error && (
        <div className="rounded-[8px] border border-red-100 bg-red-50 px-4 py-3 text-sm font-bold text-red-700">
          {error}
        </div>
      )}
    </div>
  );
}

function MobileTabBar({ activeTab, setActiveTab }) {
  return (
    <div className="sticky top-0 z-30 -mx-3 border-y border-neutral-200 bg-white/95 px-3 py-2 backdrop-blur-xl sm:-mx-5 sm:px-5 lg:hidden">
      <div className="grid grid-cols-2 gap-2 rounded-[12px] border border-neutral-200 bg-neutral-50 p-1">
        {mobileTabs.map((tab) => {
          const Icon = tab.icon;
          const active = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={[
                "inline-flex min-h-11 items-center justify-center gap-1.5 rounded-[9px] px-2 text-xs font-black transition",
                active
                  ? "bg-neutral-950 text-white shadow-sm"
                  : "bg-transparent text-neutral-500 hover:bg-white hover:text-neutral-950",
              ].join(" ")}
            >
              <Icon size={15} />
              <span className="line-clamp-1">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function PromotionFormPanel({
  form,
  updateField,
  urlForm,
  updateUrlField,
  mediaDrafts,
  sensors,
  editingId,
  submitting,
  onSubmit,
  onReset,
  onPickFiles,
  onAddUrlMedia,
  onRemoveMedia,
  onDragEnd,
}) {
  return (
    <section className="rounded-[12px] border border-neutral-200 bg-white p-3 shadow-sm sm:p-5">
      <div className="flex items-start justify-between gap-3 border-b border-neutral-200 pb-4">
        <div>
          <h2 className="text-xl font-black text-neutral-950">
            {editingId ? "Sửa khuyến mãi" : "Thêm khuyến mãi"}
          </h2>

          <p className="mt-1 text-sm leading-6 text-neutral-500">
            Media đầu tiên sẽ là media hiển thị chính ngoài banner.
          </p>
        </div>

        {editingId && (
          <button
            type="button"
            onClick={onReset}
            className="grid h-10 w-10 shrink-0 place-items-center rounded-[8px] bg-neutral-100 text-neutral-600 transition hover:bg-neutral-200"
            aria-label="Hủy sửa"
          >
            <X size={18} />
          </button>
        )}
      </div>

      <form onSubmit={onSubmit} className="mt-4 space-y-4">
        <FormSection title="Thông tin chương trình">
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

          <TextArea
            label="Nội dung chi tiết"
            value={form.description}
            onChange={(value) => updateField("description", value)}
            rows={4}
            placeholder="Nhập chi tiết chương trình khuyến mãi..."
          />

          <Input
            label="Nút hiển thị"
            value={form.buttonText}
            onChange={(value) => updateField("buttonText", value)}
            placeholder="Xem chi tiết"
          />
        </FormSection>

        <FormSection title="Media khuyến mãi">
          <label className="flex min-h-[150px] cursor-pointer flex-col items-center justify-center rounded-[10px] border border-dashed border-neutral-300 bg-neutral-50 p-4 text-center transition hover:bg-neutral-100">
            <Upload className="text-neutral-400" size={30} />

            <p className="mt-3 text-sm font-black text-neutral-950">
              Chọn ảnh hoặc video từ máy
            </p>

            <p className="mt-1 max-w-xs text-xs leading-5 text-neutral-400">
              File sẽ upload lên Cloudinary khi bấm lưu. Hỗ trợ JPG, PNG, WEBP,
              MP4, WEBM.
            </p>

            <span className="mt-3 inline-flex rounded-[8px] bg-neutral-950 px-4 py-2.5 text-xs font-black uppercase tracking-[0.08em] text-white">
              Chọn file
            </span>

            <input
              type="file"
              accept="image/*,video/*"
              multiple
              onChange={(event) => {
                onPickFiles(event.target.files);
                event.target.value = "";
              }}
              className="hidden"
            />
          </label>

          <UrlMediaBox
            urlForm={urlForm}
            updateUrlField={updateUrlField}
            onAddUrlMedia={onAddUrlMedia}
          />

          {mediaDrafts.length > 0 && (
            <MediaDraftGrid
              mediaDrafts={mediaDrafts}
              sensors={sensors}
              onDragEnd={onDragEnd}
              onRemoveMedia={onRemoveMedia}
            />
          )}
        </FormSection>

        <FormSection title="Thời gian và điều kiện">
          <div className="grid gap-3 min-[430px]:grid-cols-2">
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

          <TextArea
            label="Điều kiện áp dụng"
            value={form.terms}
            onChange={(value) => updateField("terms", value)}
            rows={3}
            placeholder="Ví dụ: Không áp dụng chung với chương trình khác..."
          />

          <ToggleCard
            label="Bật hiển thị khuyến mãi"
            description="Khuyến mãi sẽ xuất hiện trên menu khách hàng nếu còn trong thời gian áp dụng."
            checked={form.isActive}
            onChange={(checked) => updateField("isActive", checked)}
          />
        </FormSection>

        <div className="sticky bottom-3 z-10 rounded-[12px] bg-white/95 pt-2 backdrop-blur sm:static sm:bg-transparent sm:pt-0">
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex w-full items-center justify-center gap-2 rounded-[8px] bg-neutral-950 px-4 py-4 text-sm font-black uppercase tracking-[0.08em] text-white shadow-[0_12px_26px_rgba(0,0,0,0.16)] transition hover:bg-neutral-800 disabled:opacity-60 sm:py-3 sm:shadow-none"
          >
            {submitting ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <Save size={18} />
            )}

            {submitting
              ? "Đang upload Cloudinary..."
              : editingId
                ? "Cập nhật khuyến mãi"
                : "Thêm khuyến mãi"}
          </button>
        </div>
      </form>
    </section>
  );
}

function UrlMediaBox({ urlForm, updateUrlField, onAddUrlMedia }) {
  return (
    <div className="rounded-[10px] border border-neutral-200 bg-neutral-50 p-3 sm:p-4">
      <div className="flex items-center gap-2">
        <Link2 size={18} className="text-neutral-500" />
        <p className="text-sm font-black text-neutral-950">Thêm bằng link URL</p>
      </div>

      <div className="mt-3 space-y-3">
        <input
          value={urlForm.url}
          onChange={(event) => updateUrlField("url", event.target.value)}
          placeholder="Dán link ảnh hoặc video..."
          className="h-12 w-full rounded-[8px] border border-neutral-200 bg-white px-4 text-sm font-bold text-neutral-900 outline-none transition placeholder:text-neutral-400 focus:border-neutral-950"
        />

        <div className="grid gap-3 min-[430px]:grid-cols-[1fr_130px]">
          <input
            value={urlForm.name}
            onChange={(event) => updateUrlField("name", event.target.value)}
            placeholder="Tên media, có thể bỏ trống"
            className="h-12 w-full rounded-[8px] border border-neutral-200 bg-white px-4 text-sm font-bold text-neutral-900 outline-none transition placeholder:text-neutral-400 focus:border-neutral-950"
          />

          <select
            value={urlForm.type}
            onChange={(event) => updateUrlField("type", event.target.value)}
            className="h-12 w-full rounded-[8px] border border-neutral-200 bg-white px-4 text-sm font-black text-neutral-900 outline-none transition focus:border-neutral-950"
          >
            <option value="image">Hình ảnh</option>
            <option value="video">Video</option>
          </select>
        </div>

        <button
          type="button"
          onClick={onAddUrlMedia}
          className="inline-flex w-full items-center justify-center gap-2 rounded-[8px] bg-neutral-950 px-4 py-3 text-sm font-black text-white transition hover:bg-neutral-800"
        >
          <Link2 size={17} />
          Thêm URL vào khuyến mãi
        </button>

        <p className="text-xs leading-5 text-neutral-400">
          Với video, nên dùng link file trực tiếp dạng .mp4 hoặc .webm. Link
          YouTube/Facebook thường không chạy trực tiếp trong thẻ video.
        </p>
      </div>
    </div>
  );
}

function MediaDraftGrid({ mediaDrafts, sensors, onDragEnd, onRemoveMedia }) {
  return (
    <div>
      <div className="mb-3 flex flex-col gap-1 min-[430px]:flex-row min-[430px]:items-center min-[430px]:justify-between">
        <p className="text-sm font-black text-neutral-950">
          Thứ tự hiển thị media
        </p>

        <p className="text-xs font-bold text-neutral-400">
          Kéo thả để sắp xếp
        </p>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={onDragEnd}
      >
        <SortableContext
          items={mediaDrafts.map((media) => media.localId)}
          strategy={rectSortingStrategy}
        >
          <div className="grid gap-3 min-[430px]:grid-cols-2">
            {mediaDrafts.map((media, index) => (
              <SortableMediaCard
                key={media.localId}
                media={media}
                index={index}
                onRemove={() => onRemoveMedia(media.localId)}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
}

function PromotionsListPanel({
  loading,
  promotions,
  onEdit,
  onDelete,
  onToggleActive,
}) {
  return (
    <section className="rounded-[12px] border border-neutral-200 bg-white p-3 shadow-sm sm:p-5">
      <div className="flex flex-col gap-3 border-b border-neutral-200 pb-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-xl font-black text-neutral-950">
            Danh sách khuyến mãi
          </h2>

          <p className="mt-1 text-sm leading-6 text-neutral-500">
            Mỗi chương trình có thể chứa nhiều ảnh, video hoặc URL media.
          </p>
        </div>

        <div className="inline-flex w-fit rounded-[8px] bg-neutral-100 px-3 py-1.5 text-sm font-black text-neutral-600">
          {promotions.length} chương trình
        </div>
      </div>

      {loading ? (
        <LoadingPromotions />
      ) : (
        <div className="mt-4 space-y-3 sm:mt-5">
          {promotions.length === 0 && (
            <div className="rounded-[10px] border border-dashed border-neutral-200 bg-neutral-50 p-8 text-center">
              <Megaphone className="mx-auto text-neutral-400" />

              <p className="mt-3 text-sm font-bold text-neutral-500">
                Chưa có chương trình khuyến mãi nào.
              </p>
            </div>
          )}

          {promotions.map((promotion) => (
            <PromotionCard
              key={promotion.id}
              promotion={promotion}
              onEdit={onEdit}
              onDelete={onDelete}
              onToggleActive={onToggleActive}
            />
          ))}
        </div>
      )}
    </section>
  );
}

function PromotionCard({ promotion, onEdit, onDelete, onToggleActive }) {
  const mediaList = normalizePromotionMedia(promotion);
  const firstMedia = mediaList[0];

  return (
    <article className="overflow-hidden rounded-[12px] border border-neutral-200 bg-white shadow-sm transition hover:border-neutral-300 hover:shadow-md">
      <div className="grid gap-0 md:grid-cols-[220px_1fr] xl:grid-cols-[240px_1fr]">
        <div className="border-b border-neutral-100 bg-neutral-50 md:border-b-0 md:border-r">
          <AdminMediaThumb media={firstMedia} />
        </div>

        <div className="p-3 sm:p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h3 className="line-clamp-2 text-base font-black leading-6 text-neutral-950 sm:text-lg">
                {promotion.title}
              </h3>

              {promotion.subtitle && (
                <p className="mt-1 line-clamp-2 text-sm leading-6 text-neutral-500">
                  {promotion.subtitle}
                </p>
              )}
            </div>

            <div className="flex shrink-0 gap-2">
              <button
                type="button"
                onClick={() => onEdit(promotion)}
                className="grid h-10 w-10 place-items-center rounded-[8px] bg-neutral-100 text-neutral-700 transition hover:bg-neutral-200"
                aria-label="Sửa khuyến mãi"
              >
                <Edit size={16} />
              </button>

              <button
                type="button"
                onClick={() => onDelete(promotion.id)}
                className="grid h-10 w-10 place-items-center rounded-[8px] bg-red-50 text-red-600 transition hover:bg-red-100"
                aria-label="Xóa khuyến mãi"
              >
                <Trash size={16} />
              </button>
            </div>
          </div>

          <div className="mt-3 flex flex-wrap gap-2">
            <StatusBadge active={promotion.isActive ?? true} />

            <span className="rounded-[8px] bg-blue-50 px-3 py-1.5 text-xs font-black text-blue-700">
              {mediaList.length} media
            </span>

            {promotion.startAt && (
              <span className="rounded-[8px] bg-blue-50 px-3 py-1.5 text-xs font-black text-blue-700">
                Từ {promotion.startAt}
              </span>
            )}

            {promotion.endAt && (
              <span className="rounded-[8px] bg-orange-50 px-3 py-1.5 text-xs font-black text-orange-700">
                Đến {promotion.endAt}
              </span>
            )}
          </div>

          {promotion.description && (
            <p className="mt-3 line-clamp-2 text-sm leading-6 text-neutral-500">
              {promotion.description}
            </p>
          )}

          <button
            type="button"
            onClick={() => onToggleActive(promotion)}
            className="mt-4 inline-flex w-full items-center justify-center rounded-[8px] border border-neutral-200 bg-white px-4 py-3 text-sm font-black text-neutral-900 transition hover:bg-neutral-50 sm:w-auto sm:py-2"
          >
            {(promotion.isActive ?? true) ? "Tắt hiển thị" : "Bật hiển thị"}
          </button>
        </div>
      </div>
    </article>
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
      className={[
        "overflow-hidden rounded-[10px] border bg-white shadow-sm transition",
        isDragging
          ? "z-50 border-neutral-950 shadow-xl"
          : "border-neutral-200",
      ].join(" ")}
    >
      <div className="relative grid min-h-32 place-items-center bg-neutral-50">
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

        <span className="absolute left-2 top-2 rounded-[6px] bg-black/70 px-2 py-1 text-xs font-black text-white">
          #{index + 1}
        </span>

        <button
          type="button"
          {...attributes}
          {...listeners}
          className="absolute bottom-2 left-2 grid h-9 w-9 cursor-grab touch-none place-items-center rounded-[8px] bg-white text-neutral-600 shadow active:cursor-grabbing"
          aria-label="Kéo để sắp xếp media"
        >
          <GripVertical size={16} />
        </button>

        <button
          type="button"
          onClick={onRemove}
          className="absolute right-2 top-2 grid h-9 w-9 place-items-center rounded-[8px] bg-white text-red-600 shadow"
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
          {media.type === "video" ? "Video" : "Hình ảnh"}
          {media.source === "file"
            ? " · Chờ upload Cloudinary"
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
      <div className="grid h-44 place-items-center text-neutral-400 sm:h-48">
        <ImagePlus size={36} />
      </div>
    );
  }

  if (media.type === "video") {
    return (
      <div className="relative grid h-44 place-items-center bg-neutral-50 sm:h-48">
        <video
          src={media.url}
          className="max-h-44 w-full object-contain sm:max-h-48"
          preload="metadata"
        />

        <div className="absolute grid h-12 w-12 place-items-center rounded-full bg-black/70 text-white">
          <Play size={20} />
        </div>
      </div>
    );
  }

  return (
    <div className="grid h-44 place-items-center bg-neutral-50 sm:h-48">
      <img
        src={media.url}
        alt={media.name || "Ảnh khuyến mãi"}
        className="max-h-44 w-full object-contain sm:max-h-48"
      />
    </div>
  );
}

function FormSection({ title, children }) {
  return (
    <div className="rounded-[12px] border border-neutral-200 bg-white p-3 sm:p-4">
      <p className="mb-4 text-sm font-black text-neutral-950">{title}</p>

      <div className="space-y-4">{children}</div>
    </div>
  );
}

function ToggleCard({ label, description, checked, onChange }) {
  return (
    <label className="flex cursor-pointer items-start gap-3 rounded-[10px] border border-neutral-200 bg-white p-3 transition hover:border-neutral-300">
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

function StatusBadge({ active }) {
  return (
    <span
      className={[
        "rounded-[8px] px-3 py-1.5 text-xs font-black",
        active ? "bg-green-50 text-green-700" : "bg-neutral-100 text-neutral-500",
      ].join(" ")}
    >
      {active ? "Đang bật" : "Đang tắt"}
    </span>
  );
}

function LoadingPromotions() {
  return (
    <div className="mt-5 space-y-3">
      {Array.from({ length: 4 }).map((_, index) => (
        <div
          key={index}
          className="rounded-[12px] border border-neutral-200 bg-white p-3 shadow-sm"
        >
          <div className="grid gap-3 md:grid-cols-[220px_1fr]">
            <div className="h-44 animate-pulse rounded-[10px] bg-neutral-100" />

            <div className="space-y-3">
              <div className="h-4 w-2/3 animate-pulse rounded bg-neutral-100" />
              <div className="h-4 w-full animate-pulse rounded bg-neutral-100" />
              <div className="h-4 w-1/2 animate-pulse rounded bg-neutral-100" />
              <div className="h-10 w-32 animate-pulse rounded-[8px] bg-neutral-100" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function TextArea({ label, value, onChange, placeholder, rows = 3 }) {
  return (
    <div>
      <label className="text-sm font-black text-neutral-800">{label}</label>

      <textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        rows={rows}
        placeholder={placeholder}
        className="mt-2 w-full resize-none rounded-[8px] border border-neutral-200 bg-white px-4 py-3 text-sm font-bold text-neutral-900 outline-none transition placeholder:text-neutral-400 focus:border-neutral-950"
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
      <label className="text-sm font-black text-neutral-800">{label}</label>

      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        required={required}
        className="mt-2 h-12 w-full rounded-[8px] border border-neutral-200 bg-white px-4 text-sm font-bold text-neutral-900 outline-none transition placeholder:text-neutral-400 focus:border-neutral-950"
      />
    </div>
  );
}