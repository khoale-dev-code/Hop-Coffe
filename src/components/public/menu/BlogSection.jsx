import { useEffect, useRef, useState, useCallback } from "react";
import { getPosts } from "../../../services/postService";
import {
  Coffee,
  Play,
  Newspaper,
  Loader2,
  ChevronDown,
  ChevronUp,
  X,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
} from "lucide-react";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatDate(raw) {
  try {
    return new Date(raw).toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "";
  }
}

function cn(...classes) {
  return classes.filter(Boolean).join(" ");
}

// ─── Media Lightbox ───────────────────────────────────────────────────────────

function MediaLightbox({ items, startIndex, onClose }) {
  const [current, setCurrent] = useState(startIndex ?? 0);
  const touchStartX = useRef(null);
  const videoRef = useRef(null);

  // Phím tắt & scroll lock
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKey = (e) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") goPrev();
      if (e.key === "ArrowRight") goNext();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [current]);

  function goPrev() {
    setCurrent((c) => (c === 0 ? items.length - 1 : c - 1));
  }
  function goNext() {
    setCurrent((c) => (c === items.length - 1 ? 0 : c + 1));
  }

  function onTouchStart(e) {
    touchStartX.current = e.touches[0].clientX;
  }
  function onTouchEnd(e) {
    if (touchStartX.current === null) return;
    const delta = e.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(delta) > 44) delta < 0 ? goNext() : goPrev();
    touchStartX.current = null;
  }

  const item = items[current];
  const isVideo = item?.type === "video";

  return (
    <div
      className="fixed inset-0 z-[200] flex flex-col bg-black/95"
      role="dialog"
      aria-modal="true"
      aria-label="Xem ảnh / video"
    >
      {/* Header */}
      <div className="flex shrink-0 items-center justify-between px-4 py-3 sm:px-5">
        <span className="text-sm font-bold text-white/70">
          {current + 1} / {items.length}
        </span>
        <button
          type="button"
          onClick={onClose}
          className="grid h-9 w-9 place-items-center rounded-xl bg-white/10 text-white transition hover:bg-white/20"
          aria-label="Đóng"
        >
          <X size={18} />
        </button>
      </div>

      {/* Main media */}
      <div
        className="relative flex flex-1 select-none items-center justify-center overflow-hidden px-2"
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        {isVideo ? (
          <video
            ref={videoRef}
            key={item.url}
            src={item.url}
            controls
            autoPlay
            playsInline
            className="max-h-full max-w-full rounded-lg object-contain"
          />
        ) : (
          <img
            key={item.url}
            src={item.url}
            alt={`Ảnh ${current + 1}`}
            className="max-h-full max-w-full rounded-lg object-contain"
            draggable={false}
          />
        )}

        {/* Nav buttons — chỉ hiện khi nhiều hơn 1 item */}
        {items.length > 1 && (
          <>
            <button
              type="button"
              onClick={goPrev}
              className="absolute left-3 grid h-10 w-10 place-items-center rounded-xl bg-black/50 text-white transition hover:bg-black/70"
              aria-label="Trước"
            >
              <ChevronLeft size={22} />
            </button>
            <button
              type="button"
              onClick={goNext}
              className="absolute right-3 grid h-10 w-10 place-items-center rounded-xl bg-black/50 text-white transition hover:bg-black/70"
              aria-label="Sau"
            >
              <ChevronRight size={22} />
            </button>
          </>
        )}
      </div>

      {/* Dot indicators */}
      {items.length > 1 && (
        <div className="flex shrink-0 items-center justify-center gap-1.5 py-4">
          {items.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setCurrent(i)}
              aria-label={`Ảnh ${i + 1}`}
              className={cn(
                "h-1.5 rounded-full transition-all duration-200",
                i === current ? "w-5 bg-white" : "w-1.5 bg-white/35 hover:bg-white/60"
              )}
            />
          ))}
        </div>
      )}

      {/* Thumbnail strip — hiện khi ≥ 3 item */}
      {items.length >= 3 && (
        <div className="hop-hide-scroll flex shrink-0 gap-2 overflow-x-auto px-4 pb-4">
          {items.map((m, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setCurrent(i)}
              aria-label={`Xem ${m.type === "video" ? "video" : "ảnh"} ${i + 1}`}
              className={cn(
                "relative h-14 w-14 shrink-0 overflow-hidden rounded-lg transition-all",
                i === current ? "ring-2 ring-white" : "opacity-50 hover:opacity-80"
              )}
            >
              {m.type === "video" ? (
                <div className="grid h-full w-full place-items-center bg-neutral-800">
                  <Play size={18} className="text-white" fill="white" />
                </div>
              ) : (
                <img
                  src={m.url}
                  alt={`thumb ${i + 1}`}
                  className="h-full w-full object-cover"
                />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Media Grid ───────────────────────────────────────────────────────────────

function PostMediaGrid({ media, onOpenLightbox }) {
  const visible = media.slice(0, 4);
  const extra = media.length - 4;

  const gridClass =
    media.length === 1
      ? "grid-cols-1"
      : media.length === 2
      ? "grid-cols-2"
      : "grid-cols-2";

  return (
    <div
      className={cn(
        "mt-1 grid gap-0.5 overflow-hidden",
        gridClass,
        "rounded-b-xl"
      )}
    >
      {visible.map((m, idx) => {
        const isFirst3 = media.length === 3 && idx === 0;
        const isLastVisible = idx === 3 && extra > 0;

        const cellClass = cn(
          "relative cursor-pointer overflow-hidden bg-neutral-100",
          media.length === 1 && "max-h-[400px]",
          media.length === 2 && "aspect-square",
          media.length === 3 && idx === 0 && "col-span-2 aspect-[16/9]",
          media.length === 3 && idx !== 0 && "aspect-square",
          media.length >= 4 && "aspect-square",
          isFirst3 && "col-span-2"
        );

        return (
          <div
            key={idx}
            className={cellClass}
            onClick={() => onOpenLightbox(idx)}
            role="button"
            tabIndex={0}
            aria-label={`Xem ${m.type === "video" ? "video" : "ảnh"} ${idx + 1}`}
            onKeyDown={(e) => e.key === "Enter" && onOpenLightbox(idx)}
          >
            {m.type === "video" ? (
              <>
                <video
                  src={m.url}
                  className="h-full w-full object-cover"
                  preload="metadata"
                  muted
                  playsInline
                />
                {/* Play overlay */}
                <div className="absolute inset-0 flex items-center justify-center bg-black/20 transition hover:bg-black/30">
                  <div className="grid h-12 w-12 place-items-center rounded-full bg-black/60 text-white backdrop-blur-sm">
                    <Play size={22} fill="white" className="translate-x-0.5" />
                  </div>
                </div>
              </>
            ) : (
              <>
                <img
                  src={m.url}
                  alt={`Ảnh ${idx + 1}`}
                  className="h-full w-full object-cover transition duration-500 hover:scale-105"
                  loading="lazy"
                />
                {/* Zoom hint */}
                {media.length === 1 && (
                  <div className="absolute bottom-2 right-2 grid h-8 w-8 place-items-center rounded-lg bg-black/40 text-white opacity-0 transition hover:opacity-100 group-hover:opacity-100">
                    <ZoomIn size={15} />
                  </div>
                )}
              </>
            )}

            {/* +N overlay */}
            {isLastVisible && (
              <div className="absolute inset-0 flex cursor-pointer items-center justify-center bg-black/55 transition hover:bg-black/65">
                <span className="text-3xl font-bold text-white">+{extra}</span>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── Post Card ────────────────────────────────────────────────────────────────

const COLLAPSE_THRESHOLD = 180; // px — nếu content cao hơn thì thu gọn

function PostCard({ post, shop }) {
  const [expanded, setExpanded] = useState(false);
  const [needsCollapse, setNeedsCollapse] = useState(false);
  const [lightboxStart, setLightboxStart] = useState(null);
  const contentRef = useRef(null);

  // Đo chiều cao thực của content để quyết định có cần "Xem thêm" không
  useEffect(() => {
    if (!contentRef.current) return;
    if (contentRef.current.scrollHeight > COLLAPSE_THRESHOLD) {
      setNeedsCollapse(true);
    }
  }, [post.content]);

  const openLightbox = useCallback((idx) => setLightboxStart(idx), []);
  const closeLightbox = useCallback(() => setLightboxStart(null), []);

  return (
    <>
      <article className="overflow-hidden rounded-2xl border border-[#EEE3D8] bg-white shadow-sm transition-shadow hover:shadow-md">

        {/* ── Header ── */}
        <div className="flex items-center gap-3 px-4 pt-4 sm:px-5 sm:pt-5">
          <div className="grid h-11 w-11 shrink-0 place-items-center overflow-hidden rounded-full border border-neutral-100 bg-[#F8F2EA]">
            {shop?.logoUrl ? (
              <img
                src={shop.logoUrl}
                alt={shop.name || "Logo"}
                className="h-full w-full object-cover"
              />
            ) : (
              <Coffee size={20} className="text-[#6B4B3E]" />
            )}
          </div>
          <div className="min-w-0">
            <p className="truncate text-[15px] font-bold text-[#2F221C]">
              {shop?.name || "Tin tức mới"}
            </p>
            <time
              dateTime={post.createdAt}
              className="text-[11px] font-medium text-[#9B7A68]"
            >
              {formatDate(post.createdAt)}
            </time>
          </div>
        </div>

        {/* ── Content text ── */}
        {post.content && (
          <div className="px-4 pt-3 sm:px-5">
            {/* Vùng thu gọn / mở rộng */}
            <div
              className={cn(
                "relative overflow-hidden text-[15px] leading-relaxed text-[#2F221C]",
                needsCollapse && !expanded && "max-h-[180px]"
              )}
            >
              <p
                ref={contentRef}
                className="whitespace-pre-wrap break-words"
              >
                {post.content}
              </p>

              {/* Gradient fade khi thu gọn */}
              {needsCollapse && !expanded && (
                <div className="absolute bottom-0 left-0 right-0 h-14 bg-gradient-to-t from-white to-transparent" />
              )}
            </div>

            {/* Nút Xem thêm / Thu gọn */}
            {needsCollapse && (
              <button
                type="button"
                onClick={() => setExpanded((v) => !v)}
                className="mt-1 flex items-center gap-1 text-sm font-bold text-[#4E8791] transition hover:text-[#2F221C]"
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
            )}
          </div>
        )}

        {/* ── Media grid ── */}
        {post.media && post.media.length > 0 && (
          <div className={cn(post.content ? "mt-3" : "mt-4")}>
            <PostMediaGrid media={post.media} onOpenLightbox={openLightbox} />
          </div>
        )}

        {/* Padding cuối nếu không có media */}
        {(!post.media || post.media.length === 0) && (
          <div className="pb-4" />
        )}
      </article>

      {/* Lightbox */}
      {lightboxStart !== null && (
        <MediaLightbox
          items={post.media}
          startIndex={lightboxStart}
          onClose={closeLightbox}
        />
      )}
    </>
  );
}

// ─── BlogSection ──────────────────────────────────────────────────────────────

export default function BlogSection({ shop }) {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!shop?.id) return;
    getPosts(shop.id).then((data) => {
      setPosts(data.filter((p) => p.isActive !== false));
      setLoading(false);
    });
  }, [shop?.id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 size={30} className="animate-spin text-[#7CAEB8]" />
      </div>
    );
  }

  return (
    <section id="blog" className="mx-auto max-w-2xl px-4 py-8 sm:px-5 lg:max-w-3xl lg:py-10">

      {/* Heading */}
      <div className="mb-7 text-center">
        <p className="mb-1.5 text-xs font-bold uppercase tracking-[0.18em] text-[#7CAEB8]">
          Tin Tức
        </p>
        <h2 className="text-2xl font-bold tracking-tight text-[#2F221C] sm:text-3xl">
          Bản tin của quán
        </h2>
      </div>

      {/* Empty state */}
      {posts.length === 0 ? (
        <div className="flex flex-col items-center rounded-2xl border border-[#EEE3D8] bg-white p-10 text-center shadow-sm">
          <div className="mb-4 grid h-16 w-16 place-items-center rounded-full bg-[#F8F2EA]">
            <Newspaper size={30} className="text-[#6B4B3E]" />
          </div>
          <h3 className="text-base font-bold text-[#2F221C]">
            Chưa có bản tin nào
          </h3>
          <p className="mt-1.5 text-sm leading-6 text-[#73584D]">
            Quán sẽ sớm cập nhật những thông tin mới nhất đến bạn!
          </p>
        </div>
      ) : (
        /* Feed: 1 cột như Facebook — tập trung đọc, không bị chia cột */
        <div className="flex flex-col gap-4 sm:gap-5">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} shop={shop} />
          ))}
        </div>
      )}
    </section>
  );
}