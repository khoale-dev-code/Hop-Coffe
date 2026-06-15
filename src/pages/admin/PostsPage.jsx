import { useEffect, useState } from "react";
import { Coffee, ImagePlus, Link2, Loader2, Play, Send, Trash, X } from "lucide-react";
import { getPosts, createPost, deletePost, uploadPostMedia } from "../../services/postService";
import { DEFAULT_SHOP_ID, getShopById } from "../../services/shopService";

function createLocalId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function inferTypeFromUrl(url) {
  const cleanUrl = url.toLowerCase().split("?")[0];
  if (cleanUrl.match(/\.(mp4|webm|mov|m4v)$/)) return "video";
  return "image";
}

export default function PostsPage() {
  const [shop, setShop] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  // States cho composer
  const [content, setContent] = useState("");
  const [mediaDrafts, setMediaDrafts] = useState([]); // Chứa ảnh/video chuẩn bị đăng
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [urlInput, setUrlInput] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function loadData() {
    try {
      setLoading(true);
      const [shopData, postsData] = await Promise.all([
        getShopById(DEFAULT_SHOP_ID),
        getPosts(DEFAULT_SHOP_ID)
      ]);
      setShop(shopData);
      setPosts(postsData);
    } catch (error) {
      console.error("Không thể tải dữ liệu:", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  // Xử lý chọn file từ máy
  function handlePickFiles(event) {
    const files = Array.from(event.target.files || []);
    if (files.length === 0) return;

    const newDrafts = files.map((file) => ({
      localId: createLocalId(),
      source: "file",
      file,
      url: URL.createObjectURL(file),
      type: file.type.startsWith("video/") ? "video" : "image",
    }));

    setMediaDrafts((prev) => [...prev, ...newDrafts]);
  }

  // Xử lý thêm media bằng URL
  function handleAddUrl() {
    const url = urlInput.trim();
    if (!url) return;

    setMediaDrafts((prev) => [
      ...prev,
      {
        localId: createLocalId(),
        source: "url",
        url,
        type: inferTypeFromUrl(url),
      },
    ]);
    setUrlInput("");
    setShowUrlInput(false);
  }

  function removeMedia(localId) {
    setMediaDrafts((prev) => prev.filter((m) => m.localId !== localId));
  }

  // Đăng bài
  async function handleSubmit(event) {
    event.preventDefault();
    if (!content.trim() && mediaDrafts.length === 0) return;

    try {
      setSubmitting(true);
      const finalMedia = [];

      // Phân loại draft thành file cần upload và url đã có sẵn
      const filesToUpload = mediaDrafts.filter((m) => m.source === "file").map((m) => m.file);
      const urlMedia = mediaDrafts.filter((m) => m.source === "url").map((m) => ({ url: m.url, type: m.type }));

      // Upload files
      if (filesToUpload.length > 0) {
        const uploaded = await uploadPostMedia(DEFAULT_SHOP_ID, filesToUpload);
        finalMedia.push(...uploaded);
      }

      // Gộp chung với url
      finalMedia.push(...urlMedia);

      await createPost(DEFAULT_SHOP_ID, {
        content,
        media: finalMedia,
        isActive: true,
      });

      // Reset form
      setContent("");
      setMediaDrafts([]);
      await loadData();
    } catch (error) {
      console.error("Lỗi khi đăng bài", error);
      alert("Không thể đăng bài. Vui lòng thử lại.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(postId) {
    if (!window.confirm("Bạn có chắc chắn muốn xóa bài đăng này?")) return;
    try {
      await deletePost(DEFAULT_SHOP_ID, postId);
      setPosts((prev) => prev.filter((p) => p.id !== postId));
    } catch (error) {
      console.error("Không thể xóa bài:", error);
    }
  }

  return (
    <div className="max-w-2xl mx-auto w-full">
      <div className="mb-6">
        <h1 className="text-2xl font-black text-neutral-950">Bản tin quán</h1>
        <p className="text-neutral-500 mt-1">Đăng bài viết mới để tương tác với khách hàng.</p>
      </div>

      {/* Composer giống Facebook */}
      <form onSubmit={handleSubmit} className="bg-white rounded-[12px] p-4 shadow-sm border border-neutral-200 mb-8">
        <div className="flex gap-3">
          {/* Avatar Shop */}
          <div className="w-10 h-10 rounded-full border border-neutral-200 overflow-hidden shrink-0 grid place-items-center bg-[#F8F2EA]">
            {shop?.logoUrl ? (
              <img src={shop.logoUrl} alt="Logo" className="w-full h-full object-cover" />
            ) : (
              <Coffee size={20} className="text-[#6B4B3E]" />
            )}
          </div>
          
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={`${shop?.name || "Bạn"} đang có thông báo gì mới?`}
            className="w-full min-h-[80px] pt-2 resize-none outline-none text-neutral-900 text-[15px] placeholder:text-neutral-400 bg-transparent"
          />
        </div>

        {/* Khung dán URL */}
        {showUrlInput && (
          <div className="mt-3 flex gap-2 p-3 bg-neutral-50 rounded-[8px] border border-neutral-200">
            <input
              type="text"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              placeholder="Dán link hình ảnh hoặc video (.mp4)..."
              className="flex-1 bg-white border border-neutral-200 rounded-[6px] px-3 text-sm outline-none focus:border-neutral-400"
            />
            <button
              type="button"
              onClick={handleAddUrl}
              className="bg-neutral-950 text-white px-3 py-1.5 rounded-[6px] text-sm font-bold"
            >
              Thêm
            </button>
            <button
              type="button"
              onClick={() => setShowUrlInput(false)}
              className="p-2 text-neutral-500 hover:bg-neutral-200 rounded-[6px]"
            >
              <X size={16} />
            </button>
          </div>
        )}

        {/* Hiển thị Media Preview (Grid) */}
        {mediaDrafts.length > 0 && (
          <div className={`mt-4 grid gap-2 ${mediaDrafts.length > 1 ? 'grid-cols-2' : 'grid-cols-1'}`}>
            {mediaDrafts.map((media) => (
              <div key={media.localId} className="relative rounded-[8px] overflow-hidden border border-neutral-200 bg-neutral-50 aspect-video group">
                {media.type === "video" ? (
                  <>
                    <video src={media.url} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 grid place-items-center bg-black/20">
                      <Play size={24} className="text-white drop-shadow-md" fill="white" />
                    </div>
                  </>
                ) : (
                  <img src={media.url} alt="Preview" className="w-full h-full object-cover" />
                )}
                <button
                  type="button"
                  onClick={() => removeMedia(media.localId)}
                  className="absolute top-2 right-2 bg-black/60 text-white p-1.5 rounded-full hover:bg-black/80 opacity-0 group-hover:opacity-100 transition"
                >
                  <X size={14} />
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="flex items-center justify-between mt-4 pt-3 border-t border-neutral-100">
          <div className="flex items-center gap-1">
            <label className="flex items-center justify-center w-10 h-10 rounded-full cursor-pointer hover:bg-neutral-100 transition text-green-600" title="Tải ảnh/video lên">
              <ImagePlus size={20} />
              <input type="file" accept="image/*,video/*" multiple className="hidden" onChange={handlePickFiles} />
            </label>
            <button
              type="button"
              onClick={() => setShowUrlInput(!showUrlInput)}
              className="flex items-center justify-center w-10 h-10 rounded-full cursor-pointer hover:bg-neutral-100 transition text-blue-600"
              title="Thêm bằng link URL"
            >
              <Link2 size={20} />
            </button>
          </div>

          <button
            type="submit"
            disabled={submitting || (!content.trim() && mediaDrafts.length === 0)}
            className="flex items-center gap-2 bg-[#2F221C] text-white px-5 py-2 rounded-[8px] font-black uppercase tracking-wider text-xs disabled:opacity-50 hover:bg-[#6B4B3E] transition"
          >
            {submitting ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
            Đăng bài
          </button>
        </div>
      </form>

      {/* Danh sách các bài đã đăng (News Feed Admin) */}
      <div className="space-y-5">
        {loading ? (
          <div className="text-center py-10"><Loader2 size={24} className="animate-spin mx-auto text-neutral-400" /></div>
        ) : posts.length === 0 ? (
          <div className="text-center text-neutral-500 bg-white border border-neutral-200 rounded-[12px] py-10 font-medium">
            Chưa có bài đăng nào.
          </div>
        ) : (
          posts.map(post => (
            <div key={post.id} className="bg-white rounded-[12px] shadow-sm border border-neutral-200 overflow-hidden">
              <div className="p-4 flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full border border-neutral-200 overflow-hidden shrink-0 grid place-items-center bg-[#F8F2EA]">
                    {shop?.logoUrl ? (
                      <img src={shop.logoUrl} alt="Logo" className="w-full h-full object-cover" />
                    ) : (
                      <Coffee size={20} className="text-[#6B4B3E]" />
                    )}
                  </div>
                  <div>
                    <p className="font-black text-neutral-950">{shop?.name || "Quản trị viên"}</p>
                    <p className="text-xs font-medium text-neutral-400 mt-0.5">
                      {new Date(post.createdAt).toLocaleDateString("vi-VN", {
                        hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit', year: 'numeric'
                      })}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => handleDelete(post.id)}
                  className="text-neutral-400 hover:text-red-600 p-2 rounded-[8px] hover:bg-red-50 transition"
                  title="Xóa bài viết"
                >
                  <Trash size={16} />
                </button>
              </div>

              {post.content && (
                <div className="px-4 pb-3 text-[15px] leading-relaxed text-[#2F221C] whitespace-pre-wrap">
                  {post.content}
                </div>
              )}

              {/* Grid hiển thị media của bài viết */}
              {post.media && post.media.length > 0 && (
                <div className={`grid gap-[1px] bg-neutral-200 border-t border-neutral-100 ${post.media.length > 1 ? 'grid-cols-2' : 'grid-cols-1'}`}>
                  {post.media.map((m, i) => (
                    <div key={i} className="relative aspect-square bg-neutral-100">
                      {m.type === "video" ? (
                        <>
                          <video src={m.url} className="w-full h-full object-cover" controls preload="metadata" />
                        </>
                      ) : (
                        <img src={m.url} alt="Media" className="w-full h-full object-cover" />
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}