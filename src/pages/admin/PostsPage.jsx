import { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  Coffee,
  Edit3,
  ImagePlus,
  Link2,
  Loader2,
  Play,
  RefreshCw,
  Save,
  Send,
  Trash,
  X,
} from "lucide-react";

import {
  getPosts,
  createPost,
  updatePost,
  deletePost,
  uploadPostMedia,
} from "../../services/postService";

import { DEFAULT_SHOP_ID, getShopById } from "../../services/shopService";

function createLocalId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function inferTypeFromUrl(url = "") {
  const cleanUrl = url.toLowerCase().split("?")[0];

  if (cleanUrl.match(/\.(mp4|webm|mov|m4v)$/)) return "video";

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

function formatPostDate(value) {
  if (!value) return "Vừa đăng";

  try {
    const date =
      typeof value?.toDate === "function" ? value.toDate() : new Date(value);

    if (Number.isNaN(date.getTime())) return "Vừa đăng";

    return date.toLocaleDateString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  } catch {
    return "Vừa đăng";
  }
}

function getPostContent(post) {
  return post?.content || post?.title || "";
}

function normalizePostMedia(media = []) {
  if (!Array.isArray(media)) return [];

  return media
    .map((item) => ({
      url: item?.url || "",
      type: item?.type || inferTypeFromUrl(item?.url || ""),
      name: item?.name || "Media",
      mimeType: item?.mimeType || "",
      size: Number(item?.size || 0),
    }))
    .filter((item) => item.url);
}

function revokeDraftUrls(mediaDrafts = []) {
  mediaDrafts.forEach((media) => {
    if (media.source === "file" && media.url) {
      URL.revokeObjectURL(media.url);
    }
  });
}

function buildUploadFiles(mediaDrafts = []) {
  return mediaDrafts
    .filter((media) => media.source === "file")
    .map((media) => media.file);
}

function buildUrlMedia(mediaDrafts = []) {
  return mediaDrafts
    .filter((media) => media.source !== "file")
    .map((media) => ({
      url: media.url,
      type: media.type || inferTypeFromUrl(media.url || ""),
      name: media.name || "Media",
      mimeType: media.mimeType || "",
      size: Number(media.size || 0),
    }));
}

export default function PostsPage() {
  const [shop, setShop] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [content, setContent] = useState("");
  const [mediaDrafts, setMediaDrafts] = useState([]);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [urlInput, setUrlInput] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [composerCollapsed, setComposerCollapsed] = useState(false);

  const [editingPost, setEditingPost] = useState(null);
  const [editContent, setEditContent] = useState("");
  const [editMediaDrafts, setEditMediaDrafts] = useState([]);
  const [editShowUrlInput, setEditShowUrlInput] = useState(false);
  const [editUrlInput, setEditUrlInput] = useState("");
  const [editSubmitting, setEditSubmitting] = useState(false);

  const [notice, setNotice] = useState({
    type: "",
    text: "",
  });

  const canSubmit = content.trim() || mediaDrafts.length > 0;
  const canUpdate = editContent.trim() || editMediaDrafts.length > 0;

  const stats = useMemo(() => {
    const mediaCount = posts.reduce((total, post) => {
      const media = normalizePostMedia(post.media);

      return total + media.length;
    }, 0);

    const postsWithMedia = posts.filter(
      (post) => normalizePostMedia(post.media).length > 0
    ).length;

    return {
      total: posts.length,
      postsWithMedia,
      mediaCount,
    };
  }, [posts]);

  async function loadData(options = {}) {
    try {
      if (options.silent) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const [shopData, postsData] = await Promise.all([
        getShopById(DEFAULT_SHOP_ID),
        getPosts(DEFAULT_SHOP_ID),
      ]);

      setShop(shopData);
      setPosts(postsData);
    } catch (error) {
      console.error("Không thể tải dữ liệu:", error);

      setNotice({
        type: "error",
        text: "Không thể tải bản tin. Vui lòng thử lại.",
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    loadData();

    return () => {
      revokeDraftUrls(mediaDrafts);
      revokeDraftUrls(editMediaDrafts);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handlePickFiles(event) {
    const files = Array.from(event.target.files || []);

    if (files.length === 0) return;

    const newDrafts = files.map((file) => ({
      localId: createLocalId(),
      source: "file",
      file,
      url: URL.createObjectURL(file),
      type: file.type.startsWith("video/") ? "video" : "image",
      name: file.name,
      mimeType: file.type,
      size: file.size,
    }));

    setMediaDrafts((prev) => [...prev, ...newDrafts]);
    setComposerCollapsed(false);
    event.target.value = "";
  }

  function handleAddUrl() {
    const url = urlInput.trim();

    if (!url) return;

    if (!isValidUrl(url)) {
      setNotice({
        type: "error",
        text: "Link media chưa hợp lệ. Vui lòng dán link bắt đầu bằng http hoặc https.",
      });

      return;
    }

    setMediaDrafts((prev) => [
      ...prev,
      {
        localId: createLocalId(),
        source: "url",
        url,
        type: inferTypeFromUrl(url),
        name: "Media URL",
      },
    ]);

    setUrlInput("");
    setShowUrlInput(false);
    setComposerCollapsed(false);
  }

  function removeMedia(localId) {
    setMediaDrafts((prev) => {
      const removed = prev.find((item) => item.localId === localId);

      if (removed?.source === "file" && removed?.url) {
        URL.revokeObjectURL(removed.url);
      }

      return prev.filter((item) => item.localId !== localId);
    });
  }

  function resetComposer() {
    revokeDraftUrls(mediaDrafts);
    setContent("");
    setMediaDrafts([]);
    setUrlInput("");
    setShowUrlInput(false);
    setComposerCollapsed(false);
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (!canSubmit) return;

    try {
      setSubmitting(true);
      setNotice({
        type: "",
        text: "",
      });

      const finalMedia = [];
      const filesToUpload = buildUploadFiles(mediaDrafts);
      const urlMedia = buildUrlMedia(mediaDrafts);

      if (filesToUpload.length > 0) {
        const uploaded = await uploadPostMedia(DEFAULT_SHOP_ID, filesToUpload);
        finalMedia.push(...uploaded);
      }

      finalMedia.push(...urlMedia);

      const cleanContent = content.trim();

      await createPost(DEFAULT_SHOP_ID, {
        title: cleanContent.slice(0, 80) || "Bài viết mới",
        content: cleanContent,
        media: finalMedia,
        isPublished: true,
        isActive: true,
        isPinned: false,
        order: posts.length + 1,
      });

      resetComposer();

      setNotice({
        type: "success",
        text: "Đã đăng bài viết mới thành công.",
      });

      await loadData({
        silent: true,
      });
    } catch (error) {
      console.error("Lỗi khi đăng bài", error);

      setNotice({
        type: "error",
        text: "Không thể đăng bài. Vui lòng thử lại.",
      });
    } finally {
      setSubmitting(false);
    }
  }

  function openEditPost(post) {
    revokeDraftUrls(editMediaDrafts);

    setEditingPost(post);
    setEditContent(getPostContent(post));
    setEditShowUrlInput(false);
    setEditUrlInput("");

    const existingMedia = normalizePostMedia(post.media).map((media) => ({
      ...media,
      localId: createLocalId(),
      source: "existing",
    }));

    setEditMediaDrafts(existingMedia);
  }

  function closeEditPost() {
    revokeDraftUrls(editMediaDrafts);

    setEditingPost(null);
    setEditContent("");
    setEditMediaDrafts([]);
    setEditShowUrlInput(false);
    setEditUrlInput("");
    setEditSubmitting(false);
  }

  function handleEditPickFiles(event) {
    const files = Array.from(event.target.files || []);

    if (files.length === 0) return;

    const newDrafts = files.map((file) => ({
      localId: createLocalId(),
      source: "file",
      file,
      url: URL.createObjectURL(file),
      type: file.type.startsWith("video/") ? "video" : "image",
      name: file.name,
      mimeType: file.type,
      size: file.size,
    }));

    setEditMediaDrafts((prev) => [...prev, ...newDrafts]);
    event.target.value = "";
  }

  function handleEditAddUrl() {
    const url = editUrlInput.trim();

    if (!url) return;

    if (!isValidUrl(url)) {
      setNotice({
        type: "error",
        text: "Link media chưa hợp lệ. Vui lòng dán link bắt đầu bằng http hoặc https.",
      });

      return;
    }

    setEditMediaDrafts((prev) => [
      ...prev,
      {
        localId: createLocalId(),
        source: "url",
        url,
        type: inferTypeFromUrl(url),
        name: "Media URL",
      },
    ]);

    setEditUrlInput("");
    setEditShowUrlInput(false);
  }

  function removeEditMedia(localId) {
    setEditMediaDrafts((prev) => {
      const removed = prev.find((item) => item.localId === localId);

      if (removed?.source === "file" && removed?.url) {
        URL.revokeObjectURL(removed.url);
      }

      return prev.filter((item) => item.localId !== localId);
    });
  }

  async function handleUpdatePost(event) {
    event.preventDefault();

    if (!editingPost || !canUpdate) return;

    try {
      setEditSubmitting(true);
      setNotice({
        type: "",
        text: "",
      });

      const finalMedia = [];
      const filesToUpload = buildUploadFiles(editMediaDrafts);
      const urlMedia = buildUrlMedia(editMediaDrafts);

      if (filesToUpload.length > 0) {
        const uploaded = await uploadPostMedia(DEFAULT_SHOP_ID, filesToUpload);
        finalMedia.push(...uploaded);
      }

      finalMedia.push(...urlMedia);

      const cleanContent = editContent.trim();

      await updatePost(DEFAULT_SHOP_ID, editingPost.id, {
        ...editingPost,
        title: cleanContent.slice(0, 80) || editingPost.title || "Bài viết",
        content: cleanContent,
        media: finalMedia,
        isPublished: editingPost.isPublished ?? editingPost.isActive ?? true,
        isActive: editingPost.isActive ?? editingPost.isPublished ?? true,
        isPinned: editingPost.isPinned ?? false,
        order: Number(editingPost.order || 1),
      });

      closeEditPost();

      setNotice({
        type: "success",
        text: "Đã cập nhật bài viết.",
      });

      await loadData({
        silent: true,
      });
    } catch (error) {
      console.error("Không thể cập nhật bài viết:", error);

      setNotice({
        type: "error",
        text: "Không thể cập nhật bài viết. Vui lòng thử lại.",
      });
    } finally {
      setEditSubmitting(false);
    }
  }

  async function handleDelete(postId) {
    const ok = window.confirm("Bạn có chắc chắn muốn xóa bài đăng này?");

    if (!ok) return;

    try {
      await deletePost(DEFAULT_SHOP_ID, postId);

      setPosts((prev) => prev.filter((post) => post.id !== postId));

      setNotice({
        type: "success",
        text: "Đã xóa bài viết.",
      });
    } catch (error) {
      console.error("Không thể xóa bài:", error);

      setNotice({
        type: "error",
        text: "Không thể xóa bài viết. Vui lòng thử lại.",
      });
    }
  }

  return (
    <>
      <div className="mx-auto w-full max-w-7xl">
        <PageHeader
          shop={shop}
          stats={stats}
          refreshing={refreshing}
          onRefresh={() => loadData({ silent: true })}
        />

        {notice.text && (
          <NoticeBox
            type={notice.type}
            text={notice.text}
            onClose={() => setNotice({ type: "", text: "" })}
          />
        )}

        <div className="mt-4 grid gap-4 lg:grid-cols-[minmax(0,1fr)_340px] lg:gap-5">
          <section className="min-w-0 space-y-4 sm:space-y-5">
            <Composer
              shop={shop}
              content={content}
              setContent={setContent}
              mediaDrafts={mediaDrafts}
              showUrlInput={showUrlInput}
              setShowUrlInput={setShowUrlInput}
              urlInput={urlInput}
              setUrlInput={setUrlInput}
              composerCollapsed={composerCollapsed}
              setComposerCollapsed={setComposerCollapsed}
              submitting={submitting}
              canSubmit={canSubmit}
              onSubmit={handleSubmit}
              onPickFiles={handlePickFiles}
              onAddUrl={handleAddUrl}
              onRemoveMedia={removeMedia}
              onReset={resetComposer}
            />

            <FeedList
              loading={loading}
              posts={posts}
              shop={shop}
              onEdit={openEditPost}
              onDelete={handleDelete}
            />
          </section>

          <aside className="hidden space-y-4 lg:block">
            <StatsPanel stats={stats} />

            <GuidePanel />
          </aside>
        </div>
      </div>

      <EditPostModal
        post={editingPost}
        shop={shop}
        content={editContent}
        setContent={setEditContent}
        mediaDrafts={editMediaDrafts}
        showUrlInput={editShowUrlInput}
        setShowUrlInput={setEditShowUrlInput}
        urlInput={editUrlInput}
        setUrlInput={setEditUrlInput}
        submitting={editSubmitting}
        canUpdate={canUpdate}
        onSubmit={handleUpdatePost}
        onPickFiles={handleEditPickFiles}
        onAddUrl={handleEditAddUrl}
        onRemoveMedia={removeEditMedia}
        onClose={closeEditPost}
      />
    </>
  );
}

function PageHeader({ shop, stats, refreshing, onRefresh }) {
  return (
    <section className="overflow-hidden rounded-[14px] border border-neutral-200 bg-white shadow-sm">
      <div className="border-b border-neutral-100 bg-[radial-gradient(circle_at_top_left,rgba(124,174,184,0.18),transparent_36%),radial-gradient(circle_at_top_right,rgba(178,40,48,0.10),transparent_30%)] p-4 sm:p-5 lg:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-[#7CAEB8]">
              Bản tin khách hàng
            </p>

            <h1 className="mt-2 text-2xl font-black tracking-tight text-[#2F221C] sm:text-3xl lg:text-4xl">
              Bản tin quán
            </h1>

            <p className="mt-2 max-w-2xl text-sm font-medium leading-7 text-[#73584D]">
              Đăng bài viết, hình ảnh hoặc video để cập nhật món mới, chương
              trình ưu đãi và thông báo nhanh cho khách hàng.
            </p>
          </div>

          <button
            type="button"
            onClick={onRefresh}
            disabled={refreshing}
            className="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-[8px] border border-neutral-200 bg-white px-4 text-sm font-black text-[#2F221C] shadow-sm transition hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <RefreshCw
              size={16}
              className={refreshing ? "animate-spin" : ""}
            />
            Làm mới
          </button>
        </div>
      </div>

      <div className="grid gap-3 p-3 sm:grid-cols-3 sm:p-4 lg:hidden">
        <MiniStat label="Bài viết" value={stats.total} />
        <MiniStat label="Có media" value={stats.postsWithMedia} />
        <MiniStat label="Tổng media" value={stats.mediaCount} />
      </div>

      <div className="flex items-center gap-3 border-t border-neutral-100 px-4 py-3 sm:px-5 lg:px-6">
        <ShopAvatar shop={shop} />

        <div className="min-w-0">
          <p className="truncate text-sm font-black text-neutral-950">
            {shop?.name || "Hớp Coffee"}
          </p>

          <p className="mt-0.5 text-xs font-bold text-neutral-400">
            Quản lý bài đăng hiển thị ngoài trang khách hàng
          </p>
        </div>
      </div>
    </section>
  );
}

function MiniStat({ label, value }) {
  return (
    <div className="rounded-[10px] border border-neutral-200 bg-neutral-50 px-3 py-3">
      <p className="text-xs font-bold text-neutral-400">{label}</p>

      <p className="mt-1 text-xl font-black text-[#2F221C]">{value}</p>
    </div>
  );
}

function NoticeBox({ type, text, onClose }) {
  const isError = type === "error";

  return (
    <div
      className={[
        "mt-4 flex items-start justify-between gap-3 rounded-[12px] border px-4 py-3 shadow-sm",
        isError
          ? "border-red-100 bg-red-50 text-red-700"
          : "border-emerald-100 bg-emerald-50 text-emerald-700",
      ].join(" ")}
    >
      <div className="flex min-w-0 items-start gap-2">
        {isError ? (
          <AlertCircle size={18} className="mt-0.5 shrink-0" />
        ) : (
          <CheckCircle2 size={18} className="mt-0.5 shrink-0" />
        )}

        <p className="text-sm font-bold leading-6">{text}</p>
      </div>

      <button
        type="button"
        onClick={onClose}
        className="grid h-7 w-7 shrink-0 place-items-center rounded-full hover:bg-black/5"
        aria-label="Đóng thông báo"
      >
        <X size={15} />
      </button>
    </div>
  );
}

function Composer({
  shop,
  content,
  setContent,
  mediaDrafts,
  showUrlInput,
  setShowUrlInput,
  urlInput,
  setUrlInput,
  composerCollapsed,
  setComposerCollapsed,
  submitting,
  canSubmit,
  onSubmit,
  onPickFiles,
  onAddUrl,
  onRemoveMedia,
  onReset,
}) {
  const hasDraft = content.trim() || mediaDrafts.length > 0;
  const characterCount = content.length;

  return (
    <form
      onSubmit={onSubmit}
      className="overflow-hidden rounded-[14px] border border-neutral-200 bg-white shadow-sm"
    >
      <div className="flex items-center justify-between gap-3 border-b border-neutral-100 p-3 sm:p-4">
        <div className="flex min-w-0 items-center gap-3">
          <ShopAvatar shop={shop} />

          <div className="min-w-0">
            <p className="truncate text-sm font-black text-neutral-950">
              {shop?.name || "Hớp Coffee"}
            </p>

            <p className="text-xs font-bold text-neutral-400">
              Tạo bài đăng mới
            </p>
          </div>
        </div>

        {hasDraft && (
          <button
            type="button"
            onClick={() => setComposerCollapsed((prev) => !prev)}
            className="inline-flex shrink-0 items-center gap-1 rounded-[8px] bg-neutral-100 px-3 py-2 text-xs font-black text-neutral-700 transition hover:bg-neutral-200"
          >
            {composerCollapsed ? (
              <>
                Mở rộng <ChevronDown size={15} />
              </>
            ) : (
              <>
                Thu gọn <ChevronUp size={15} />
              </>
            )}
          </button>
        )}
      </div>

      {composerCollapsed ? (
        <button
          type="button"
          onClick={() => setComposerCollapsed(false)}
          className="flex w-full items-center justify-between gap-3 p-4 text-left transition hover:bg-neutral-50"
        >
          <div className="min-w-0">
            <p className="line-clamp-1 text-sm font-bold text-neutral-700">
              {content.trim() || `${mediaDrafts.length} media đang chờ đăng`}
            </p>

            <p className="mt-1 text-xs font-bold text-neutral-400">
              Bấm để tiếp tục chỉnh sửa bài đăng
            </p>
          </div>

          <ChevronDown size={18} className="shrink-0 text-neutral-400" />
        </button>
      ) : (
        <>
          <div className="p-3 sm:p-4">
            <textarea
              value={content}
              onChange={(event) => setContent(event.target.value)}
              placeholder={`${shop?.name || "Bạn"} đang có thông báo gì mới?`}
              className="min-h-[116px] w-full resize-none rounded-[10px] border border-neutral-200 bg-neutral-50 px-4 py-3 text-[15px] font-medium leading-7 text-neutral-900 outline-none transition placeholder:text-neutral-400 focus:border-[#2F221C] focus:bg-white sm:min-h-[140px]"
            />

            <div className="mt-2 flex items-center justify-between gap-3">
              <p className="text-xs font-bold text-neutral-400">
                Có thể đăng chữ, ảnh, video hoặc link media.
              </p>

              <p className="shrink-0 text-xs font-black text-neutral-400">
                {characterCount} ký tự
              </p>
            </div>

            {showUrlInput && (
              <UrlInputBox
                urlInput={urlInput}
                setUrlInput={setUrlInput}
                onAddUrl={onAddUrl}
                onClose={() => setShowUrlInput(false)}
              />
            )}

            {mediaDrafts.length > 0 && (
              <MediaPreviewGrid
                mediaDrafts={mediaDrafts}
                onRemove={onRemoveMedia}
              />
            )}
          </div>

          <div className="flex flex-col gap-3 border-t border-neutral-100 px-3 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-4">
            <MediaActionButtons
              hasDraft={hasDraft}
              mediaCount={mediaDrafts.length}
              onPickFiles={onPickFiles}
              onToggleUrl={() => setShowUrlInput((prev) => !prev)}
              onReset={onReset}
            />

            <button
              type="submit"
              disabled={submitting || !canSubmit}
              className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-[8px] bg-[#2F221C] px-5 text-xs font-black uppercase tracking-[0.08em] text-white transition hover:bg-[#6B4B3E] disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
            >
              {submitting ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Send size={16} />
              )}

              {submitting ? "Đang đăng..." : "Đăng bài"}
            </button>
          </div>
        </>
      )}
    </form>
  );
}

function MediaActionButtons({
  hasDraft,
  mediaCount,
  onPickFiles,
  onToggleUrl,
  onReset,
}) {
  return (
    <div className="flex items-center justify-between sm:justify-start">
      <div className="flex items-center gap-1">
        <label
          className="grid h-10 w-10 cursor-pointer place-items-center rounded-full text-green-600 transition hover:bg-neutral-100"
          title="Tải ảnh/video lên"
        >
          <ImagePlus size={21} />

          <input
            type="file"
            accept="image/*,video/*"
            multiple
            className="hidden"
            onChange={onPickFiles}
          />
        </label>

        <button
          type="button"
          onClick={onToggleUrl}
          className="grid h-10 w-10 place-items-center rounded-full text-blue-600 transition hover:bg-neutral-100"
          title="Thêm bằng link URL"
        >
          <Link2 size={20} />
        </button>

        {hasDraft && (
          <button
            type="button"
            onClick={onReset}
            className="grid h-10 w-10 place-items-center rounded-full text-neutral-400 transition hover:bg-red-50 hover:text-red-600"
            title="Xóa nội dung đang soạn"
          >
            <X size={18} />
          </button>
        )}
      </div>

      {mediaCount > 0 && (
        <span className="ml-2 rounded-full bg-neutral-100 px-2.5 py-1 text-xs font-black text-neutral-500 sm:hidden">
          {mediaCount} media
        </span>
      )}
    </div>
  );
}

function UrlInputBox({ urlInput, setUrlInput, onAddUrl, onClose }) {
  return (
    <div className="mt-3 rounded-[10px] border border-neutral-200 bg-neutral-50 p-3">
      <div className="grid gap-2 sm:grid-cols-[1fr_auto_auto]">
        <input
          type="text"
          value={urlInput}
          onChange={(event) => setUrlInput(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              onAddUrl();
            }
          }}
          placeholder="Dán link hình ảnh hoặc video .mp4..."
          className="h-11 min-w-0 rounded-[8px] border border-neutral-200 bg-white px-3 text-sm font-bold text-neutral-900 outline-none transition placeholder:text-neutral-400 focus:border-neutral-950"
        />

        <button
          type="button"
          onClick={onAddUrl}
          className="h-11 rounded-[8px] bg-neutral-950 px-4 text-sm font-black text-white transition hover:bg-neutral-800"
        >
          Thêm
        </button>

        <button
          type="button"
          onClick={onClose}
          className="grid h-11 w-full place-items-center rounded-[8px] text-neutral-500 transition hover:bg-neutral-200 sm:w-11"
          aria-label="Đóng ô nhập URL"
        >
          <X size={16} />
        </button>
      </div>

      <p className="mt-2 text-xs font-medium leading-5 text-neutral-400">
        Nên dùng link ảnh trực tiếp hoặc video dạng .mp4, .webm để hiển thị ổn
        định.
      </p>
    </div>
  );
}

function MediaPreviewGrid({ mediaDrafts, onRemove }) {
  return (
    <div className="mt-3">
      <div className="mb-2 flex items-center justify-between gap-3">
        <p className="text-xs font-black uppercase tracking-[0.12em] text-neutral-400">
          Media chờ đăng
        </p>

        <p className="text-xs font-bold text-neutral-400">
          {mediaDrafts.length} mục
        </p>
      </div>

      <div className="grid gap-2 sm:grid-cols-2">
        {mediaDrafts.map((media) => (
          <div
            key={media.localId}
            className="group relative aspect-video overflow-hidden rounded-[10px] border border-neutral-200 bg-neutral-50"
          >
            {media.type === "video" ? (
              <>
                <video
                  src={media.url}
                  className="h-full w-full object-cover"
                  preload="metadata"
                />

                <div className="absolute inset-0 grid place-items-center bg-black/20">
                  <Play
                    size={26}
                    className="text-white drop-shadow-md"
                    fill="white"
                  />
                </div>
              </>
            ) : (
              <img
                src={media.url}
                alt={media.name || "Preview"}
                className="h-full w-full object-cover"
              />
            )}

            <button
              type="button"
              onClick={() => onRemove(media.localId)}
              className="absolute right-2 top-2 grid h-8 w-8 place-items-center rounded-full bg-black/60 text-white opacity-100 transition hover:bg-black/80 sm:opacity-0 sm:group-hover:opacity-100"
              aria-label="Xóa media"
            >
              <X size={14} />
            </button>

            <div className="absolute bottom-2 left-2 rounded-full bg-black/55 px-2 py-1 text-[10px] font-black uppercase text-white">
              {media.type === "video" ? "Video" : "Ảnh"}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function FeedList({ loading, posts, shop, onEdit, onDelete }) {
  if (loading) {
    return (
      <div className="rounded-[14px] border border-neutral-200 bg-white p-10 text-center shadow-sm">
        <Loader2 size={28} className="mx-auto animate-spin text-neutral-400" />

        <p className="mt-3 text-sm font-bold text-neutral-500">
          Đang tải bản tin...
        </p>
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="rounded-[14px] border border-dashed border-neutral-200 bg-white px-5 py-12 text-center shadow-sm">
        <div className="mx-auto grid h-14 w-14 place-items-center rounded-[12px] bg-neutral-50 text-neutral-400">
          <Coffee size={30} />
        </div>

        <h2 className="mt-4 text-lg font-black text-neutral-950">
          Chưa có bài đăng nào
        </h2>

        <p className="mx-auto mt-2 max-w-sm text-sm font-medium leading-6 text-neutral-500">
          Hãy tạo bài viết đầu tiên để khách hàng có thể xem thông báo mới từ
          quán.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-5">
      {posts.map((post) => (
        <PostCard
          key={post.id}
          post={post}
          shop={shop}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}

function PostCard({ post, shop, onEdit, onDelete }) {
  const media = normalizePostMedia(post.media);
  const content = getPostContent(post);
  const [viewerIndex, setViewerIndex] = useState(null);

  return (
    <>
      <article className="overflow-hidden rounded-[14px] border border-neutral-200 bg-white shadow-sm">
        <div className="flex items-start justify-between gap-3 p-3 sm:p-4">
          <div className="flex min-w-0 items-center gap-3">
            <ShopAvatar shop={shop} />

            <div className="min-w-0">
              <p className="truncate text-sm font-black text-neutral-950">
                {shop?.name || "Quản trị viên"}
              </p>

              <p className="mt-0.5 text-xs font-bold text-neutral-400">
                {formatPostDate(post.createdAt)}
              </p>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-1">
            <button
              type="button"
              onClick={() => onEdit(post)}
              className="inline-flex h-9 items-center gap-1 rounded-[8px] bg-neutral-100 px-3 text-xs font-black text-neutral-700 transition hover:bg-neutral-200 hover:text-neutral-950"
              title="Sửa bài viết"
            >
              <Edit3 size={15} />
              <span className="hidden min-[420px]:inline">Sửa</span>
            </button>

            <button
              type="button"
              onClick={() => onDelete(post.id)}
              className="grid h-9 w-9 place-items-center rounded-[8px] text-neutral-400 transition hover:bg-red-50 hover:text-red-600"
              title="Xóa bài viết"
            >
              <Trash size={16} />
            </button>
          </div>
        </div>

        {content && (
          <div className="px-3 pb-3 sm:px-4">
            <ExpandableText text={content} />
          </div>
        )}

        {media.length > 0 && (
          <PostMediaGrid media={media} onOpen={setViewerIndex} />
        )}
      </article>

      <MediaViewerModal
        media={media}
        activeIndex={viewerIndex}
        onChange={setViewerIndex}
        onClose={() => setViewerIndex(null)}
      />
    </>
  );
}

function ExpandableText({ text }) {
  const [expanded, setExpanded] = useState(false);

  const shouldClamp = text.length > 180 || text.split("\n").length > 4;

  if (!shouldClamp) {
    return (
      <p className="whitespace-pre-wrap text-[15px] font-medium leading-7 text-[#2F221C]">
        {text}
      </p>
    );
  }

  return (
    <div>
      <p
        className={[
          "whitespace-pre-wrap text-[15px] font-medium leading-7 text-[#2F221C]",
          expanded ? "" : "line-clamp-4",
        ].join(" ")}
      >
        {text}
      </p>

      <button
        type="button"
        onClick={() => setExpanded((prev) => !prev)}
        className="mt-1 inline-flex items-center gap-1 text-sm font-black text-[#6B4B3E] transition hover:text-[#2F221C]"
      >
        {expanded ? (
          <>
            Thu gọn <ChevronUp size={15} />
          </>
        ) : (
          <>
            Xem thêm <ChevronDown size={15} />
          </>
        )}
      </button>
    </div>
  );
}

function PostMediaGrid({ media, onOpen }) {
  const visibleMedia = media.slice(0, 4);
  const extraCount = media.length - visibleMedia.length;

  return (
    <div
      className={[
        "grid gap-[1px] border-t border-neutral-100 bg-neutral-200",
        visibleMedia.length === 1 ? "grid-cols-1" : "grid-cols-2",
      ].join(" ")}
    >
      {visibleMedia.map((item, index) => (
        <button
          key={`${item.url}-${index}`}
          type="button"
          onClick={() => onOpen(index)}
          className={[
            "group relative overflow-hidden bg-neutral-100 text-left",
            visibleMedia.length === 1 ? "aspect-video" : "aspect-square",
          ].join(" ")}
        >
          {item.type === "video" ? (
            <>
              <video
                src={item.url}
                className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.02]"
                preload="metadata"
                muted
                playsInline
              />

              <div className="absolute inset-0 grid place-items-center bg-black/20">
                <span className="grid h-12 w-12 place-items-center rounded-full bg-black/55 text-white">
                  <Play size={22} fill="white" />
                </span>
              </div>
            </>
          ) : (
            <img
              src={item.url}
              alt={item.name || "Media"}
              loading="lazy"
              className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.02]"
            />
          )}

          {extraCount > 0 && index === visibleMedia.length - 1 && (
            <div className="absolute inset-0 grid place-items-center bg-black/55 text-2xl font-black text-white">
              +{extraCount}
            </div>
          )}
        </button>
      ))}
    </div>
  );
}

function MediaViewerModal({ media, activeIndex, onChange, onClose }) {
  const isOpen = activeIndex !== null && activeIndex !== undefined;
  const activeMedia = isOpen ? media[activeIndex] : null;

  useEffect(() => {
    if (!isOpen) return;

    const previousOverflow = document.body.style.overflow;

    function handleKeyDown(event) {
      if (event.key === "Escape") onClose();

      if (event.key === "ArrowLeft") {
        onChange(activeIndex === 0 ? media.length - 1 : activeIndex - 1);
      }

      if (event.key === "ArrowRight") {
        onChange(activeIndex === media.length - 1 ? 0 : activeIndex + 1);
      }
    }

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [activeIndex, isOpen, media.length, onChange, onClose]);

  if (!isOpen || !activeMedia) return null;

  function goPrev() {
    if (media.length <= 1) return;

    onChange(activeIndex === 0 ? media.length - 1 : activeIndex - 1);
  }

  function goNext() {
    if (media.length <= 1) return;

    onChange(activeIndex === media.length - 1 ? 0 : activeIndex + 1);
  }

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/80 p-3 backdrop-blur-sm sm:p-6">
      <button
        type="button"
        onClick={onClose}
        className="absolute inset-0 cursor-default"
        aria-label="Đóng media"
      />

      <div className="relative z-10 flex max-h-[92dvh] w-full max-w-5xl flex-col overflow-hidden rounded-[14px] bg-white shadow-2xl">
        <div className="flex items-center justify-between gap-3 border-b border-neutral-200 bg-white px-4 py-3">
          <p className="text-sm font-black text-[#2F221C]">
            Media {activeIndex + 1}/{media.length}
          </p>

          <button
            type="button"
            onClick={onClose}
            className="grid h-9 w-9 place-items-center rounded-[8px] bg-neutral-100 text-neutral-700 transition hover:bg-neutral-200"
            aria-label="Đóng"
          >
            <X size={18} />
          </button>
        </div>

        <div className="relative grid min-h-0 flex-1 place-items-center bg-neutral-950">
          <div className="grid h-[70dvh] w-full place-items-center">
            {activeMedia.type === "video" ? (
              <video
                src={activeMedia.url}
                controls
                playsInline
                className="max-h-full max-w-full object-contain"
              />
            ) : (
              <img
                src={activeMedia.url}
                alt={activeMedia.name || "Media"}
                className="max-h-full max-w-full object-contain"
              />
            )}
          </div>

          {media.length > 1 && (
            <>
              <button
                type="button"
                onClick={goPrev}
                className="absolute left-2 top-1/2 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-[8px] bg-white/95 text-[#2F221C] shadow transition hover:bg-white sm:left-4"
                aria-label="Media trước"
              >
                <ChevronLeft size={22} />
              </button>

              <button
                type="button"
                onClick={goNext}
                className="absolute right-2 top-1/2 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-[8px] bg-white/95 text-[#2F221C] shadow transition hover:bg-white sm:right-4"
                aria-label="Media sau"
              >
                <ChevronRight size={22} />
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function EditPostModal({
  post,
  shop,
  content,
  setContent,
  mediaDrafts,
  showUrlInput,
  setShowUrlInput,
  urlInput,
  setUrlInput,
  submitting,
  canUpdate,
  onSubmit,
  onPickFiles,
  onAddUrl,
  onRemoveMedia,
  onClose,
}) {
  useEffect(() => {
    if (!post) return;

    const previousOverflow = document.body.style.overflow;

    function handleKeyDown(event) {
      if (event.key === "Escape") onClose();
    }

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [post, onClose]);

  if (!post) return null;

  return (
    <div className="fixed inset-0 z-[130] flex items-end justify-center bg-black/55 px-0 py-0 backdrop-blur-sm sm:grid sm:place-items-center sm:p-5">
      <button
        type="button"
        onClick={onClose}
        className="absolute inset-0 cursor-default"
        aria-label="Đóng chỉnh sửa"
      />

      <form
        onSubmit={onSubmit}
        className="relative z-10 flex max-h-[92dvh] w-full max-w-3xl flex-col overflow-hidden rounded-t-[16px] bg-white shadow-2xl sm:rounded-[14px]"
      >
        <div className="flex items-center justify-between gap-3 border-b border-neutral-200 bg-white px-4 py-3">
          <div className="flex min-w-0 items-center gap-3">
            <ShopAvatar shop={shop} />

            <div className="min-w-0">
              <p className="text-xs font-black uppercase tracking-[0.14em] text-[#7CAEB8]">
                Chỉnh sửa bài viết
              </p>

              <p className="truncate text-sm font-black text-[#2F221C]">
                {shop?.name || "Hớp Coffee"}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="grid h-9 w-9 shrink-0 place-items-center rounded-[8px] bg-neutral-100 text-neutral-700 transition hover:bg-neutral-200"
            aria-label="Đóng"
          >
            <X size={18} />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto p-4">
          <textarea
            value={content}
            onChange={(event) => setContent(event.target.value)}
            placeholder="Nhập nội dung bài viết..."
            className="min-h-[150px] w-full resize-none rounded-[10px] border border-neutral-200 bg-neutral-50 px-4 py-3 text-[15px] font-medium leading-7 text-neutral-900 outline-none transition placeholder:text-neutral-400 focus:border-[#2F221C] focus:bg-white sm:min-h-[190px]"
          />

          <div className="mt-2 flex items-center justify-between gap-3">
            <p className="text-xs font-bold text-neutral-400">
              Có thể sửa chữ, thêm hoặc xóa media.
            </p>

            <p className="shrink-0 text-xs font-black text-neutral-400">
              {content.length} ký tự
            </p>
          </div>

          {showUrlInput && (
            <UrlInputBox
              urlInput={urlInput}
              setUrlInput={setUrlInput}
              onAddUrl={onAddUrl}
              onClose={() => setShowUrlInput(false)}
            />
          )}

          {mediaDrafts.length > 0 ? (
            <MediaPreviewGrid mediaDrafts={mediaDrafts} onRemove={onRemoveMedia} />
          ) : (
            <div className="mt-4 rounded-[10px] border border-dashed border-neutral-200 bg-neutral-50 px-4 py-6 text-center">
              <ImagePlus size={28} className="mx-auto text-neutral-400" />

              <p className="mt-2 text-sm font-bold text-neutral-500">
                Bài viết chưa có media
              </p>
            </div>
          )}
        </div>

        <div className="border-t border-neutral-200 bg-white p-3 sm:p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <MediaActionButtons
              hasDraft={content.trim() || mediaDrafts.length > 0}
              mediaCount={mediaDrafts.length}
              onPickFiles={onPickFiles}
              onToggleUrl={() => setShowUrlInput((prev) => !prev)}
              onReset={() => {
                setContent("");
              }}
            />

            <div className="grid gap-2 sm:flex sm:items-center">
              <button
                type="button"
                onClick={onClose}
                className="h-11 rounded-[8px] border border-neutral-200 bg-white px-5 text-xs font-black uppercase tracking-[0.08em] text-neutral-700 transition hover:bg-neutral-50"
              >
                Hủy
              </button>

              <button
                type="submit"
                disabled={submitting || !canUpdate}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-[8px] bg-[#2F221C] px-5 text-xs font-black uppercase tracking-[0.08em] text-white transition hover:bg-[#6B4B3E] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {submitting ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <Save size={16} />
                )}

                {submitting ? "Đang lưu..." : "Lưu chỉnh sửa"}
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}

function StatsPanel({ stats }) {
  return (
    <section className="rounded-[14px] border border-neutral-200 bg-white p-4 shadow-sm">
      <p className="text-sm font-black text-neutral-950">Tổng quan bản tin</p>

      <div className="mt-4 space-y-3">
        <MiniStat label="Tổng bài viết" value={stats.total} />
        <MiniStat label="Bài có media" value={stats.postsWithMedia} />
        <MiniStat label="Tổng ảnh/video" value={stats.mediaCount} />
      </div>
    </section>
  );
}

function GuidePanel() {
  return (
    <section className="rounded-[14px] border border-neutral-200 bg-white p-4 shadow-sm">
      <p className="text-sm font-black text-neutral-950">Gợi ý đăng bài</p>

      <div className="mt-3 space-y-3 text-sm font-medium leading-6 text-neutral-500">
        <p>
          Nên viết nội dung ngắn, rõ ý. Bài dài vẫn có thể đăng vì hệ thống đã
          tự thu gọn nội dung.
        </p>

        <p>
          Với bài có nhiều ảnh, hệ thống chỉ hiển thị 4 ảnh đầu ở feed và có thể
          bấm vào để xem chi tiết.
        </p>

        <p>
          Bấm nút <b>Sửa</b> ở mỗi bài viết để chỉnh nội dung hoặc thay đổi
          ảnh/video.
        </p>
      </div>
    </section>
  );
}

function ShopAvatar({ shop }) {
  return (
    <div className="grid h-10 w-10 shrink-0 place-items-center overflow-hidden rounded-full border border-neutral-200 bg-[#F8F2EA]">
      {shop?.logoUrl ? (
        <img
          src={shop.logoUrl}
          alt={shop?.name || "Logo"}
          className="h-full w-full object-cover"
        />
      ) : (
        <Coffee size={20} className="text-[#6B4B3E]" />
      )}
    </div>
  );
}