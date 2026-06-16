import { useEffect, useState, useCallback, useRef } from "react";
import { getPosts } from "../../../services/postService";
import {
  Coffee,
  Loader2,
  Play,
  ChevronLeft,
  ChevronRight,
  ArrowLeft,
  LayoutGrid,
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
  } catch {
    return "";
  }
}

function useViewportWidth() {
  const [width, setWidth] = useState(() =>
    typeof window !== "undefined" ? window.innerWidth : 375
  );

  useEffect(() => {
    function handleResize() {
      setWidth(window.innerWidth);
    }

    window.addEventListener("resize", handleResize, { passive: true });

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return width;
}

function renderCaption(text) {
  if (!text) return null;

  return text.split(/(\s+)/).map((word, index) =>
    word.startsWith("#") ? (
      <span key={index} style={{ color: "#5B7B8A", fontWeight: 600 }}>
        {word}
      </span>
    ) : (
      <span key={index}>{word}</span>
    )
  );
}

// ─── Shared: Media Carousel ───────────────────────────────────────────────────

function MediaCarousel({ media = [], mode = "modal" }) {
  const [index, setIndex] = useState(0);
  const touchStartRef = useRef({ x: 0, y: 0 });
  const touchMovedRef = useRef(false);

  const total = media.length;
  const currentMedia = media[index];
  const isMobilePage = mode === "page";
  const canSwipe = total > 1;

  useEffect(() => {
    setIndex(0);
  }, [media]);

  function goPrev(event) {
    event?.stopPropagation?.();

    if (total <= 1) return;

    setIndex((current) => (current - 1 + total) % total);
  }

  function goNext(event) {
    event?.stopPropagation?.();

    if (total <= 1) return;

    setIndex((current) => (current + 1) % total);
  }

  function handleTouchStart(event) {
    if (!canSwipe) return;

    const touch = event.touches?.[0];
    if (!touch) return;

    touchMovedRef.current = false;
    touchStartRef.current = {
      x: touch.clientX,
      y: touch.clientY,
    };
  }

  function handleTouchMove(event) {
    if (!canSwipe) return;

    const touch = event.touches?.[0];
    if (!touch) return;

    const deltaX = touch.clientX - touchStartRef.current.x;
    const deltaY = touch.clientY - touchStartRef.current.y;

    if (Math.abs(deltaX) > 8 || Math.abs(deltaY) > 8) {
      touchMovedRef.current = true;
    }
  }

  function handleTouchEnd(event) {
    if (!canSwipe || !touchMovedRef.current) return;

    const touch = event.changedTouches?.[0];
    if (!touch) return;

    const deltaX = touch.clientX - touchStartRef.current.x;
    const deltaY = touch.clientY - touchStartRef.current.y;

    const isHorizontalSwipe =
      Math.abs(deltaX) > 45 && Math.abs(deltaX) > Math.abs(deltaY) * 1.15;

    if (!isHorizontalSwipe) return;

    if (deltaX < 0) {
      goNext(event);
    } else {
      goPrev(event);
    }
  }

  const wrapperStyle = {
    position: "relative",
    width: "100%",
    ...(isMobilePage ? { aspectRatio: "1 / 1" } : { height: "100%", flex: 1 }),
    overflow: "hidden",
    background: "#111",
    flexShrink: 0,
    touchAction: canSwipe ? "pan-y" : "auto",
    userSelect: "none",
  };

  if (!currentMedia) {
    return (
      <div style={wrapperStyle}>
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#fff",
            fontSize: 13,
          }}
        >
          Không có hình ảnh
        </div>
      </div>
    );
  }

  return (
    <div
      style={wrapperStyle}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {currentMedia.type === "video" ? (
        <video
          key={currentMedia.url}
          src={currentMedia.url}
          controls
          autoPlay
          playsInline
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "contain",
            background: "#111",
          }}
        />
      ) : (
        <img
          key={currentMedia.url}
          src={currentMedia.url}
          alt={`Ảnh ${index + 1}`}
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: isMobilePage ? "cover" : "contain",
            background: "#111",
          }}
          loading="lazy"
          draggable={false}
        />
      )}

      {canSwipe && isMobilePage && (
        <div
          style={{
            position: "absolute",
            left: 12,
            right: 12,
            bottom: 12,
            zIndex: 3,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            pointerEvents: "none",
          }}
        >
          <span
            style={{
              borderRadius: 999,
              background: "rgba(0,0,0,0.45)",
              color: "#fff",
              fontSize: 11,
              fontWeight: 700,
              padding: "5px 9px",
              backdropFilter: "blur(10px)",
            }}
          >
            Vuốt để xem
          </span>

          <span
            style={{
              borderRadius: 999,
              background: "rgba(0,0,0,0.45)",
              color: "#fff",
              fontSize: 11,
              fontWeight: 700,
              padding: "5px 9px",
              backdropFilter: "blur(10px)",
            }}
          >
            {index + 1}/{total}
          </span>
        </div>
      )}

      {canSwipe && !isMobilePage && (
        <>
          <button
            onClick={goPrev}
            aria-label="Ảnh trước"
            style={{
              position: "absolute",
              left: 8,
              top: "50%",
              transform: "translateY(-50%)",
              width: 34,
              height: 34,
              borderRadius: "50%",
              background: "rgba(255,255,255,0.88)",
              border: "none",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 2,
              boxShadow: "0 8px 24px rgba(0,0,0,0.18)",
            }}
          >
            <ChevronLeft size={17} color="#222" />
          </button>

          <button
            onClick={goNext}
            aria-label="Ảnh tiếp"
            style={{
              position: "absolute",
              right: 8,
              top: "50%",
              transform: "translateY(-50%)",
              width: 34,
              height: 34,
              borderRadius: "50%",
              background: "rgba(255,255,255,0.88)",
              border: "none",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 2,
              boxShadow: "0 8px 24px rgba(0,0,0,0.18)",
            }}
          >
            <ChevronRight size={17} color="#222" />
          </button>
        </>
      )}

      {canSwipe && (
        <div
          style={{
            position: "absolute",
            bottom: isMobilePage ? 42 : 12,
            left: 0,
            right: 0,
            display: "flex",
            justifyContent: "center",
            gap: 6,
            zIndex: 2,
            pointerEvents: "auto",
          }}
        >
          {media.map((_, dotIndex) => (
            <button
              key={dotIndex}
              onClick={(event) => {
                event.stopPropagation?.();
                setIndex(dotIndex);
              }}
              aria-label={`Ảnh ${dotIndex + 1}`}
              style={{
                width: dotIndex === index ? 16 : 6,
                height: 6,
                borderRadius: 999,
                padding: 0,
                border: "none",
                cursor: "pointer",
                background:
                  dotIndex === index ? "#fff" : "rgba(255,255,255,0.45)",
                transition: "all .18s ease",
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ─── MOBILE: Full-page post detail ────────────────────────────────────────────

function MobilePostPage({ post, shop, onBack }) {
  const hasMedia = post.media?.length > 0;
  const shopHandle =
    shop?.username ||
    shop?.name?.toLowerCase().replace(/\s+/g, "") ||
    "café";

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;

    document.body.style.overflow = "hidden";
    window.history.pushState({ postDetail: true }, "");

    function handlePopState() {
      onBack();
    }

    window.addEventListener("popstate", handlePopState);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("popstate", handlePopState);
    };
  }, [onBack]);

  function handleBack() {
    window.history.back();
  }

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        background: "#fff",
        display: "flex",
        flexDirection: "column",
        overflowY: "auto",
        overscrollBehavior: "none",
        animation: "slideInRight .22s cubic-bezier(.22,1,.36,1)",
      }}
    >
      <style>
        {`
          @keyframes slideInRight {
            from { transform: translateX(100%); opacity: .6; }
            to   { transform: translateX(0);    opacity: 1; }
          }
        `}
      </style>

      <div
        style={{
          position: "sticky",
          top: 0,
          zIndex: 10,
          display: "flex",
          alignItems: "center",
          gap: 8,
          padding: "10px 14px",
          background: "#fff",
          borderBottom: "0.5px solid #f0f0f0",
        }}
      >
        <button
          onClick={handleBack}
          aria-label="Quay lại"
          style={{
            width: 34,
            height: 34,
            borderRadius: "50%",
            background: "none",
            border: "none",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginLeft: -6,
          }}
        >
          <ArrowLeft size={20} color="#111" />
        </button>

        <div
          style={{
            width: 32,
            height: 32,
            borderRadius: "50%",
            flexShrink: 0,
            background: "#F5EBE0",
            border: "1px solid #E8D5C4",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            overflow: "hidden",
          }}
        >
          {shop?.logoUrl ? (
            <img
              src={shop.logoUrl}
              alt={shop.name}
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          ) : (
            <Coffee size={13} color="#7C4A30" />
          )}
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <p
            style={{
              fontSize: 13,
              fontWeight: 700,
              color: "#111",
              margin: 0,
              lineHeight: 1.3,
            }}
          >
            {shopHandle}
          </p>

          <p
            style={{
              fontSize: 11,
              color: "#aaa",
              margin: 0,
              lineHeight: 1.3,
            }}
          >
            {timeAgo(post.createdAt)}
          </p>
        </div>
      </div>

      {hasMedia ? (
        <div
          style={{
            width: "100%",
            aspectRatio: "1 / 1",
            flexShrink: 0,
            background: "#111",
          }}
        >
          <MediaCarousel media={post.media} mode="page" />
        </div>
      ) : (
        <div
          style={{
            width: "100%",
            padding: "32px 24px",
            background: "#F9F1E7",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            minHeight: 200,
          }}
        >
          <p
            style={{
              fontSize: 16,
              lineHeight: 1.7,
              color: "#3D2B1F",
              fontWeight: 500,
              textAlign: "center",
              margin: 0,
            }}
          >
            {post.content}
          </p>
        </div>
      )}

      {post.content && hasMedia && (
        <div style={{ padding: "14px 16px 8px" }}>
          <p style={{ fontSize: 14, lineHeight: 1.7, color: "#111", margin: 0 }}>
            <span style={{ fontWeight: 700, marginRight: 6 }}>
              {shopHandle}
            </span>
            {renderCaption(post.content)}
          </p>
        </div>
      )}

      {post.commentCount > 0 && (
        <div style={{ padding: "4px 16px 16px" }}>
          <p style={{ fontSize: 13, color: "#aaa", margin: 0 }}>
            Xem tất cả {post.commentCount.toLocaleString("vi-VN")} bình luận
          </p>
        </div>
      )}

      <div
        style={{
          height: "calc(16px + env(safe-area-inset-bottom))",
          flexShrink: 0,
        }}
      />
    </div>
  );
}

// ─── DESKTOP: Modal popup ─────────────────────────────────────────────────────

function DesktopModal({ post, shop, onClose }) {
  const hasMedia = post.media?.length > 0;
  const shopHandle =
    shop?.username ||
    shop?.name?.toLowerCase().replace(/\s+/g, "") ||
    "café";

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;

    document.body.style.overflow = "hidden";

    function handleKeyDown(event) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose]);

  return (
    <div
      onClick={(event) => event.target === event.currentTarget && onClose()}
      role="dialog"
      aria-modal="true"
      aria-label="Chi tiết bài viết"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        background: "rgba(0,0,0,0.75)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px 24px",
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          height: "min(90vh, 780px)",
          maxHeight: "90vh",
          maxWidth: "min(96vw, 1080px)",
          background: "#fff",
          borderRadius: 14,
          overflow: "hidden",
          boxShadow: "0 28px 80px rgba(0,0,0,0.35)",
          animation: "fadeScaleIn .18s ease",
        }}
      >
        <style>
          {`
            @keyframes fadeScaleIn {
              from { opacity: 0; transform: scale(.96); }
              to   { opacity: 1; transform: scale(1); }
            }
          `}
        </style>

        <div
          style={{
            flexShrink: 0,
            alignSelf: "stretch",
            aspectRatio: "1 / 1",
            display: "flex",
            flexDirection: "column",
            background: "#111",
            overflow: "hidden",
          }}
        >
          {hasMedia ? (
            <MediaCarousel media={post.media} mode="modal" />
          ) : (
            <div
              style={{
                flex: 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "32px 40px",
                background: "#F9F1E7",
              }}
            >
              <p
                style={{
                  fontSize: 16,
                  lineHeight: 1.7,
                  color: "#3D2B1F",
                  fontWeight: 500,
                  textAlign: "center",
                  margin: 0,
                }}
              >
                {post.content}
              </p>
            </div>
          )}
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            minWidth: 300,
            maxWidth: 420,
            flex: 1,
            overflow: "hidden",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "13px 16px",
              borderBottom: "0.5px solid #f0f0f0",
              flexShrink: 0,
            }}
          >
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: "50%",
                flexShrink: 0,
                background: "#F5EBE0",
                border: "1px solid #E8D5C4",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                overflow: "hidden",
              }}
            >
              {shop?.logoUrl ? (
                <img
                  src={shop.logoUrl}
                  alt={shop.name}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                  }}
                />
              ) : (
                <Coffee size={14} color="#7C4A30" />
              )}
            </div>

            <div style={{ flex: 1, minWidth: 0 }}>
              <p
                style={{
                  fontSize: 13,
                  fontWeight: 700,
                  color: "#111",
                  margin: 0,
                  lineHeight: 1.3,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {shopHandle}
              </p>

              <p
                style={{
                  fontSize: 11,
                  color: "#aaa",
                  margin: "2px 0 0",
                  lineHeight: 1.3,
                }}
              >
                {timeAgo(post.createdAt)}
              </p>
            </div>

            <button
              onClick={onClose}
              aria-label="Đóng"
              style={{
                width: 30,
                height: 30,
                borderRadius: "50%",
                background: "none",
                border: "none",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#999",
                flexShrink: 0,
              }}
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>

          <div
            style={{
              flex: 1,
              overflowY: "auto",
              padding: "14px 16px",
              overscrollBehavior: "contain",
            }}
          >
            {post.content && hasMedia && (
              <p
                style={{
                  fontSize: 13.5,
                  lineHeight: 1.7,
                  color: "#111",
                  margin: 0,
                }}
              >
                <span style={{ fontWeight: 700, marginRight: 6 }}>
                  {shopHandle}
                </span>
                {renderCaption(post.content)}
              </p>
            )}
          </div>

          {post.commentCount > 0 && (
            <div
              style={{
                padding: "10px 16px",
                borderTop: "0.5px solid #f0f0f0",
                flexShrink: 0,
              }}
            >
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
  const isVideo = hasMedia && post.media[0].type === "video";
  const isMulti = hasMedia && post.media.length > 1;

  return (
    <div
      role="button"
      tabIndex={0}
      aria-label={`${isVideo ? "Video" : "Bài viết"}: ${
        post.content?.slice(0, 40) ?? ""
      }`}
      onClick={() => onClick(post)}
      onKeyDown={(event) => event.key === "Enter" && onClick(post)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        position: "relative",
        cursor: "pointer",
        overflow: "hidden",
        background: "#F9F1E7",
        aspectRatio: "1 / 1",
        outline: "none",
      }}
    >
      {hasMedia ? (
        isVideo ? (
          <video
            src={post.media[0].url}
            preload="metadata"
            muted
            playsInline
            style={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              objectFit: "cover",
            }}
          />
        ) : (
          <img
            src={post.media[0].url}
            alt=""
            loading="lazy"
            style={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              objectFit: "cover",
              transition: "transform .28s ease",
              transform: hovered ? "scale(1.05)" : "scale(1)",
            }}
          />
        )
      ) : (
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 10,
            background: "#F9F1E7",
          }}
        >
          <p
            style={{
              fontSize: 9.5,
              lineHeight: 1.5,
              color: "#5A3A28",
              textAlign: "center",
              display: "-webkit-box",
              WebkitLineClamp: 5,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}
          >
            {post.content}
          </p>
        </div>
      )}

      {isVideo && (
        <div
          style={{
            position: "absolute",
            top: 5,
            right: 5,
            filter: "drop-shadow(0 1px 2px rgba(0,0,0,.5))",
          }}
        >
          <Play size={13} fill="white" strokeWidth={0} color="white" />
        </div>
      )}

      {isMulti && !isVideo && (
        <div
          style={{
            position: "absolute",
            top: 5,
            right: 5,
            filter: "drop-shadow(0 1px 2px rgba(0,0,0,.5))",
          }}
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
            <rect
              x="6"
              y="6"
              width="13"
              height="13"
              rx="2"
              stroke="white"
              strokeWidth="2.2"
            />
            <rect
              x="3"
              y="3"
              width="13"
              height="13"
              rx="2"
              stroke="white"
              strokeWidth="2.2"
              fill="none"
            />
          </svg>
        </div>
      )}

      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "rgba(25,12,4,0.46)",
          opacity: hovered ? 1 : 0,
          transition: "opacity .2s",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 14,
          pointerEvents: "none",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 4,
            color: "#fff",
            fontSize: 12,
            fontWeight: 600,
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="white">
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
          </svg>
          {(post.likeCount ?? 0).toLocaleString("vi-VN")}
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 4,
            color: "#fff",
            fontSize: 12,
            fontWeight: 600,
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="white">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
          {(post.commentCount ?? 0).toLocaleString("vi-VN")}
        </div>
      </div>
    </div>
  );
}

// ─── BlogSection ──────────────────────────────────────────────────────────────

export default function BlogSection({ shop }) {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activePost, setActivePost] = useState(null);
  const viewportWidth = useViewportWidth();
  const isMobile = viewportWidth < 640;

  useEffect(() => {
    if (!shop?.id) return;

    setLoading(true);

    getPosts(shop.id)
      .then((data) => {
        setPosts(data.filter((post) => post.isActive !== false));
      })
      .finally(() => {
        setLoading(false);
      });
  }, [shop?.id]);

  const openPost = useCallback((post) => setActivePost(post), []);
  const closePost = useCallback(() => setActivePost(null), []);

  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          minHeight: "40vh",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Loader2 size={24} className="animate-spin" style={{ color: "#ccc" }} />
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          padding: "80px 24px",
          textAlign: "center",
        }}
      >
        <div
          style={{
            width: 64,
            height: 64,
            borderRadius: "50%",
            marginBottom: 20,
            background: "#F9F1E7",
            border: "1.5px dashed #D4A882",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <LayoutGrid size={24} color="#C48B5F" />
        </div>

        <p style={{ fontSize: 14, fontWeight: 600, color: "#444", margin: 0 }}>
          Chưa có bài đăng nào
        </p>

        <p
          style={{
            fontSize: 12.5,
            color: "#aaa",
            marginTop: 6,
            lineHeight: 1.6,
            maxWidth: 220,
          }}
        >
          Quán sẽ sớm chia sẻ những hình ảnh và cập nhật mới nhất!
        </p>
      </div>
    );
  }

  return (
    <>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
          gap: 2,
        }}
        role="list"
        aria-label="Bài đăng của quán"
      >
        {posts.map((post) => (
          <div key={post.id} role="listitem">
            <GridCell post={post} onClick={openPost} />
          </div>
        ))}
      </div>

      {activePost && isMobile && (
        <MobilePostPage post={activePost} shop={shop} onBack={closePost} />
      )}

      {activePost && !isMobile && (
        <DesktopModal post={activePost} shop={shop} onClose={closePost} />
      )}
    </>
  );
}