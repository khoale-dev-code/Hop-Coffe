import { useEffect, useState, useCallback } from "react";
import { getPosts } from "../../../services/postService";
import {
  Coffee, Loader2, Play,
  ChevronLeft, ChevronRight, ArrowLeft, LayoutGrid,
} from "lucide-react";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function timeAgo(raw) {
  try {
    const diff = (Date.now() - new Date(raw)) / 1000;
    if (diff < 60) return "vừa xong";
    if (diff < 3600) return `${Math.floor(diff / 60)} phút trước`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} giờ trước`;
    if (diff < 604800) return `${Math.floor(diff / 86400)} ngày trước`;
    return new Date(raw).toLocaleDateString("vi-VN");
  } catch { return ""; }
}

function useViewportWidth() {
  const [w, setW] = useState(() =>
    typeof window !== "undefined" ? window.innerWidth : 375
  );
  useEffect(() => {
    const h = () => setW(window.innerWidth);
    window.addEventListener("resize", h, { passive: true });
    return () => window.removeEventListener("resize", h);
  }, []);
  return w;
}

function renderCaption(text) {
  if (!text) return null;
  return text.split(/(\s+)/).map((word, i) =>
    word.startsWith("#")
      ? <span key={i} style={{ color: "#5B7B8A", fontWeight: 500 }}>{word}</span>
      : <span key={i}>{word}</span>
  );
}

// ─── Shared: Media Carousel ───────────────────────────────────────────────────

function MediaCarousel({ media, mode = "modal" }) {
  // mode: "modal" (desktop popup) | "page" (mobile full page)
  const [idx, setIdx] = useState(0);
  const total = media.length;
  const cur   = media[idx];
  const isMobilePage = mode === "page";

  const prev = (e) => { e?.stopPropagation?.(); setIdx((i) => (i - 1 + total) % total); };
  const next = (e) => { e?.stopPropagation?.(); setIdx((i) => (i + 1) % total); };

  const wrapStyle = {
    position: "relative",
    width: "100%",
    // page mode: full width square; modal mode: fill parent height
    ...(isMobilePage
      ? { aspectRatio: "1/1" }
      : { height: "100%", flex: 1 }
    ),
    overflow: "hidden",
    background: "#111",
    flexShrink: 0,
  };

  return (
    <div style={wrapStyle}>
      {cur.type === "video" ? (
        <video
          key={cur.url}
          src={cur.url}
          controls autoPlay playsInline
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "contain" }}
        />
      ) : (
        <img
          key={cur.url}
          src={cur.url}
          alt={`Ảnh ${idx + 1}`}
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
          loading="lazy"
        />
      )}

      {total > 1 && (
        <>
          <button onClick={prev} aria-label="Ảnh trước" style={{
            position: "absolute", left: 8, top: "50%", transform: "translateY(-50%)",
            width: 30, height: 30, borderRadius: "50%",
            background: "rgba(255,255,255,0.85)", border: "none", cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center", zIndex: 2,
          }}>
            <ChevronLeft size={15} color="#222" />
          </button>
          <button onClick={next} aria-label="Ảnh tiếp" style={{
            position: "absolute", right: 8, top: "50%", transform: "translateY(-50%)",
            width: 30, height: 30, borderRadius: "50%",
            background: "rgba(255,255,255,0.85)", border: "none", cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center", zIndex: 2,
          }}>
            <ChevronRight size={15} color="#222" />
          </button>
          <div style={{
            position: "absolute", bottom: 10, left: 0, right: 0,
            display: "flex", justifyContent: "center", gap: 5, zIndex: 2,
          }}>
            {media.map((_, i) => (
              <button key={i} onClick={(e) => { e.stopPropagation?.(); setIdx(i); }}
                aria-label={`Ảnh ${i + 1}`}
                style={{
                  width: 6, height: 6, borderRadius: "50%", padding: 0, border: "none", cursor: "pointer",
                  background: i === idx ? "#fff" : "rgba(255,255,255,0.45)",
                  transform: i === idx ? "scale(1.3)" : "scale(1)",
                  transition: "all .15s",
                }}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// ─── MOBILE: Full-page post detail (slide in from right) ──────────────────────

function MobilePostPage({ post, shop, onBack }) {
  const hasMedia = post.media?.length > 0;
  const shopHandle = shop?.username || shop?.name?.toLowerCase().replace(/\s+/g, "") || "café";

  // Lock body scroll, handle Android back button
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    // Push a history state so Android back button works
    window.history.pushState({ postDetail: true }, "");
    const onPop = () => onBack();
    window.addEventListener("popstate", onPop);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("popstate", onPop);
    };
  }, [onBack]);

  const handleBack = () => {
    // Go back in history (removes the state we pushed)
    window.history.back();
  };

  return (
    // Full-screen overlay that slides in from the right
    <div style={{
      position: "fixed", inset: 0, zIndex: 9999,
      background: "#fff",
      display: "flex", flexDirection: "column",
      overflowY: "auto",
      overscrollBehavior: "none",
      animation: "slideInRight .22s cubic-bezier(.22,1,.36,1)",
    }}>
      <style>{`
        @keyframes slideInRight {
          from { transform: translateX(100%); opacity: .6; }
          to   { transform: translateX(0);    opacity: 1; }
        }
      `}</style>

      {/* ── Top bar ── */}
      <div style={{
        position: "sticky", top: 0, zIndex: 10,
        display: "flex", alignItems: "center", gap: 8,
        padding: "10px 14px",
        background: "#fff",
        borderBottom: "0.5px solid #f0f0f0",
      }}>
        <button
          onClick={handleBack}
          aria-label="Quay lại"
          style={{
            width: 34, height: 34, borderRadius: "50%",
            background: "none", border: "none", cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center",
            marginLeft: -6,
          }}
        >
          <ArrowLeft size={20} color="#111" />
        </button>

        {/* Avatar + handle */}
        <div style={{
          width: 32, height: 32, borderRadius: "50%", flexShrink: 0,
          background: "#F5EBE0", border: "1px solid #E8D5C4",
          display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden",
        }}>
          {shop?.logoUrl
            ? <img src={shop.logoUrl} alt={shop.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            : <Coffee size={13} color="#7C4A30" />}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontSize: 13, fontWeight: 600, color: "#111", margin: 0, lineHeight: 1.3 }}>
            {shopHandle}
          </p>
          <p style={{ fontSize: 11, color: "#aaa", margin: 0, lineHeight: 1.3 }}>
            {timeAgo(post.createdAt)}
          </p>
        </div>
      </div>

      {/* ── Media ── */}
      {hasMedia ? (
        <div style={{ width: "100%", aspectRatio: "1/1", flexShrink: 0, background: "#111" }}>
          <MediaCarousel media={post.media} mode="page" />
        </div>
      ) : (
        <div style={{
          width: "100%", padding: "32px 24px",
          background: "#F9F1E7",
          display: "flex", alignItems: "center", justifyContent: "center", minHeight: 200,
        }}>
          <p style={{ fontSize: 16, lineHeight: 1.7, color: "#3D2B1F", fontWeight: 500, textAlign: "center", margin: 0 }}>
            {post.content}
          </p>
        </div>
      )}

      {/* ── Caption ── */}
      {post.content && hasMedia && (
        <div style={{ padding: "14px 16px 8px" }}>
          <p style={{ fontSize: 14, lineHeight: 1.7, color: "#111", margin: 0 }}>
            <span style={{ fontWeight: 700, marginRight: 6 }}>{shopHandle}</span>
            {renderCaption(post.content)}
          </p>
        </div>
      )}

      {/* ── Comment count ── */}
      {post.commentCount > 0 && (
        <div style={{ padding: "4px 16px 16px" }}>
          <p style={{ fontSize: 13, color: "#aaa", margin: 0 }}>
            Xem tất cả {post.commentCount.toLocaleString("vi-VN")} bình luận
          </p>
        </div>
      )}

      {/* bottom safe area */}
      <div style={{ height: "env(safe-area-inset-bottom, 16px)", flexShrink: 0 }} />
    </div>
  );
}

// ─── DESKTOP: Modal popup (image left + caption right) ────────────────────────

function DesktopModal({ post, shop, onClose }) {
  const hasMedia = post.media?.length > 0;
  const shopHandle = shop?.username || shop?.name?.toLowerCase().replace(/\s+/g, "") || "café";

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  return (
    <div
      onClick={(e) => e.target === e.currentTarget && onClose()}
      role="dialog" aria-modal="true" aria-label="Chi tiết bài viết"
      style={{
        position: "fixed", inset: 0, zIndex: 9999,
        background: "rgba(0,0,0,0.75)",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: "20px 24px",
      }}
    >
      {/* Panel: auto width = media square + caption */}
      <div style={{
        display: "flex", flexDirection: "row",
        height: "min(90vh, 780px)",
        maxHeight: "90vh",
        maxWidth: "min(96vw, 1080px)",
        background: "#fff",
        borderRadius: 14,
        overflow: "hidden",
        boxShadow: "0 28px 80px rgba(0,0,0,0.35)",
        animation: "fadeScaleIn .18s ease",
      }}>
        <style>{`
          @keyframes fadeScaleIn {
            from { opacity: 0; transform: scale(.96); }
            to   { opacity: 1; transform: scale(1); }
          }
        `}</style>

        {/* Left: media — aspect-ratio:1/1 fills full height */}
        <div style={{
          flexShrink: 0,
          alignSelf: "stretch",
          aspectRatio: "1/1",
          display: "flex", flexDirection: "column",
          background: "#111",
          overflow: "hidden",
        }}>
          {hasMedia ? (
            <MediaCarousel media={post.media} mode="modal" />
          ) : (
            <div style={{
              flex: 1, display: "flex", alignItems: "center", justifyContent: "center",
              padding: "32px 40px", background: "#F9F1E7",
            }}>
              <p style={{ fontSize: 16, lineHeight: 1.7, color: "#3D2B1F", fontWeight: 500, textAlign: "center", margin: 0 }}>
                {post.content}
              </p>
            </div>
          )}
        </div>

        {/* Right: caption — min 300px, max 420px */}
        <div style={{
          display: "flex", flexDirection: "column",
          minWidth: 300, maxWidth: 420, flex: 1,
          overflow: "hidden",
        }}>
          {/* Header */}
          <div style={{
            display: "flex", alignItems: "center", gap: 10,
            padding: "13px 16px",
            borderBottom: "0.5px solid #f0f0f0",
            flexShrink: 0,
          }}>
            <div style={{
              width: 36, height: 36, borderRadius: "50%", flexShrink: 0,
              background: "#F5EBE0", border: "1px solid #E8D5C4",
              display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden",
            }}>
              {shop?.logoUrl
                ? <img src={shop.logoUrl} alt={shop.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                : <Coffee size={14} color="#7C4A30" />}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontSize: 13, fontWeight: 600, color: "#111", margin: 0, lineHeight: 1.3, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {shopHandle}
              </p>
              <p style={{ fontSize: 11, color: "#aaa", margin: "2px 0 0", lineHeight: 1.3 }}>
                {timeAgo(post.createdAt)}
              </p>
            </div>
            <button
              onClick={onClose} aria-label="Đóng"
              style={{
                width: 30, height: 30, borderRadius: "50%",
                background: "none", border: "none", cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center",
                color: "#999", flexShrink: 0,
              }}
            >
              {/* X icon */}
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>

          {/* Caption scrollable */}
          <div style={{ flex: 1, overflowY: "auto", padding: "14px 16px", overscrollBehavior: "contain" }}>
            {post.content && hasMedia && (
              <p style={{ fontSize: 13.5, lineHeight: 1.7, color: "#111", margin: 0 }}>
                <span style={{ fontWeight: 700, marginRight: 6 }}>{shopHandle}</span>
                {renderCaption(post.content)}
              </p>
            )}
          </div>

          {/* Comment count */}
          {post.commentCount > 0 && (
            <div style={{ padding: "10px 16px", borderTop: "0.5px solid #f0f0f0", flexShrink: 0 }}>
              <p style={{ fontSize: 12.5, color: "#aaa", margin: 0 }}>
                Xem tất cả {post.commentCount.toLocaleString("vi-VN")} bình luận
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Grid Cell ────────────────────────────────────────────────────────────────

function GridCell({ post, onClick }) {
  const [hovered, setHovered] = useState(false);
  const hasMedia = post.media?.length > 0;
  const isVideo  = hasMedia && post.media[0].type === "video";
  const isMulti  = hasMedia && post.media.length > 1;

  return (
    <div
      role="button" tabIndex={0}
      aria-label={`${isVideo ? "Video" : "Bài viết"}: ${post.content?.slice(0, 40) ?? ""}`}
      onClick={() => onClick(post)}
      onKeyDown={(e) => e.key === "Enter" && onClick(post)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{ position: "relative", cursor: "pointer", overflow: "hidden", background: "#F9F1E7", aspectRatio: "1/1", outline: "none" }}
    >
      {hasMedia ? (
        isVideo ? (
          <video
            src={post.media[0].url} preload="metadata" muted playsInline
            style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
          />
        ) : (
          <img
            src={post.media[0].url} alt="" loading="lazy"
            style={{
              position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover",
              transition: "transform .28s ease",
              transform: hovered ? "scale(1.05)" : "scale(1)",
            }}
          />
        )
      ) : (
        <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", padding: 10, background: "#F9F1E7" }}>
          <p style={{ fontSize: 9.5, lineHeight: 1.5, color: "#5A3A28", textAlign: "center", display: "-webkit-box", WebkitLineClamp: 5, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
            {post.content}
          </p>
        </div>
      )}

      {/* Badges */}
      {isVideo && (
        <div style={{ position: "absolute", top: 5, right: 5, filter: "drop-shadow(0 1px 2px rgba(0,0,0,.5))" }}>
          <Play size={13} fill="white" strokeWidth={0} color="white" />
        </div>
      )}
      {isMulti && !isVideo && (
        <div style={{ position: "absolute", top: 5, right: 5, filter: "drop-shadow(0 1px 2px rgba(0,0,0,.5))" }}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <rect x="6" y="6" width="13" height="13" rx="2" stroke="white" strokeWidth="2.2"/>
            <rect x="3" y="3" width="13" height="13" rx="2" stroke="white" strokeWidth="2.2" fill="none"/>
          </svg>
        </div>
      )}

      {/* Hover overlay (desktop only) */}
      <div style={{
        position: "absolute", inset: 0, background: "rgba(25,12,4,0.46)",
        opacity: hovered ? 1 : 0, transition: "opacity .2s",
        display: "flex", alignItems: "center", justifyContent: "center", gap: 14,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 4, color: "#fff", fontSize: 12, fontWeight: 600 }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="white"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
          {(post.likeCount ?? 0).toLocaleString("vi-VN")}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 4, color: "#fff", fontSize: 12, fontWeight: 600 }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="white"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
          {(post.commentCount ?? 0).toLocaleString("vi-VN")}
        </div>
      </div>
    </div>
  );
}

// ─── BlogSection ──────────────────────────────────────────────────────────────

export default function BlogSection({ shop }) {
  const [posts, setPosts]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [activePost, setActive] = useState(null);
  const vpWidth = useViewportWidth();
  const isMobile = vpWidth < 640;

  useEffect(() => {
    if (!shop?.id) return;
    getPosts(shop.id).then((data) => {
      setPosts(data.filter((p) => p.isActive !== false));
      setLoading(false);
    });
  }, [shop?.id]);

  const openPost  = useCallback((post) => setActive(post), []);
  const closePost = useCallback(() => setActive(null), []);

  if (loading) {
    return (
      <div style={{ display: "flex", minHeight: "40vh", alignItems: "center", justifyContent: "center" }}>
        <Loader2 size={24} className="animate-spin" style={{ color: "#ccc" }} />
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "80px 24px", textAlign: "center" }}>
        <div style={{ width: 64, height: 64, borderRadius: "50%", marginBottom: 20, background: "#F9F1E7", border: "1.5px dashed #D4A882", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <LayoutGrid size={24} color="#C48B5F" />
        </div>
        <p style={{ fontSize: 14, fontWeight: 600, color: "#444", margin: 0 }}>Chưa có bài đăng nào</p>
        <p style={{ fontSize: 12.5, color: "#aaa", marginTop: 6, lineHeight: 1.6, maxWidth: 220 }}>
          Quán sẽ sớm chia sẻ những hình ảnh và cập nhật mới nhất!
        </p>
      </div>
    );
  }

  return (
    <>
      {/* 3-column grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: 2 }}
        role="list" aria-label="Bài đăng của quán">
        {posts.map((post) => (
          <div key={post.id} role="listitem">
            <GridCell post={post} onClick={openPost} />
          </div>
        ))}
      </div>

      {/* Mobile → full page; Desktop → modal popup */}
      {activePost && isMobile && (
        <MobilePostPage post={activePost} shop={shop} onBack={closePost} />
      )}
      {activePost && !isMobile && (
        <DesktopModal post={activePost} shop={shop} onClose={closePost} />
      )}
    </>
  );
}