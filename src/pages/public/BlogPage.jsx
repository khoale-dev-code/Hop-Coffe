import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ChevronLeft, Grid3x3, MapPin, Clock } from "lucide-react";

import { useShopMenu } from "../../hooks/useShopMenu";

import MenuHeader from "../../components/public/menu/MenuHeader";
import ShopFooter from "../../components/public/menu/ShopFooter";
import BlogSection from "../../components/public/menu/BlogSection";
import { LoadingScreen, StateBox } from "../../components/public/menu/MenuStates";

// ─── Helper: format giờ mở cửa ───────────────────────────────────────────────
function formatHours(shop) {
  if (shop?.openTime && shop?.closeTime) {
    return `${shop.openTime} – ${shop.closeTime}`;
  }
  return null;
}

// ─── Profile Header (Instagram-style) ────────────────────────────────────────
function ProfileHeader({ shop, postCount }) {
  const hours   = formatHours(shop);
  const address = shop?.address;

  return (
    <div style={{
      width: "100%",
      maxWidth: 935,
      margin: "0 auto",
      padding: "28px 16px 0",
    }}>

      {/* ── Back link ── */}
      <Link
        to={`/${shop.slug}`}
        style={{
          display: "inline-flex", alignItems: "center", gap: 4,
          fontSize: 12, fontWeight: 600, color: "#888",
          textDecoration: "none", marginBottom: 20,
          letterSpacing: "0.04em",
          transition: "color .15s",
        }}
        onMouseEnter={e => e.currentTarget.style.color = "#2F221C"}
        onMouseLeave={e => e.currentTarget.style.color = "#888"}
      >
        <ChevronLeft size={14} strokeWidth={2.5} />
        Xem thực đơn
      </Link>

      {/* ── Profile row ── */}
      <div style={{
        display: "flex",
        alignItems: "flex-start",
        gap: 24,
        marginBottom: 20,
      }}>

        {/* Avatar */}
        <div style={{
          flexShrink: 0,
          width: 86,
          height: 86,
          borderRadius: "50%",
          background: "#F5EBE0",
          border: "2.5px solid #E8D5C4",
          display: "flex", alignItems: "center", justifyContent: "center",
          overflow: "hidden",
          // Ring gradient like Instagram
          boxShadow: shop?.logoUrl ? "0 0 0 2px #fff, 0 0 0 4px #E8D5C4" : "none",
        }}>
          {shop?.logoUrl ? (
            <img
              src={shop.logoUrl}
              alt={shop.name}
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          ) : (
            <span style={{ fontSize: 32 }}>☕</span>
          )}
        </div>

        {/* Info column */}
        <div style={{ flex: 1, minWidth: 0 }}>

          {/* Shop name + back to menu */}
          <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap", marginBottom: 14 }}>
            <h1 style={{
              fontSize: 20, fontWeight: 400, color: "#111",
              margin: 0, lineHeight: 1.2,
              letterSpacing: "-0.01em",
            }}>
              {shop?.username || shop?.name?.toLowerCase().replace(/\s+/g, "") || shop?.name || "hopcafe"}
            </h1>

            <Link
              to={`/${shop.slug}`}
              style={{
                display: "inline-flex", alignItems: "center", gap: 5,
                fontSize: 12, fontWeight: 600, color: "#2F221C",
                textDecoration: "none",
                background: "#F5EBE0",
                border: "1px solid #E8D5C4",
                borderRadius: 8,
                padding: "5px 12px",
                transition: "background .15s",
                whiteSpace: "nowrap",
              }}
              onMouseEnter={e => e.currentTarget.style.background = "#EDD9C8"}
              onMouseLeave={e => e.currentTarget.style.background = "#F5EBE0"}
            >
              Xem thực đơn
            </Link>
          </div>

          {/* Stats row */}
          <div style={{
            display: "flex",
            gap: 28,
            marginBottom: 14,
          }}>
            <div style={{ textAlign: "center" }}>
              <span style={{ fontSize: 16, fontWeight: 600, color: "#111", display: "block", lineHeight: 1.2 }}>
                {postCount ?? 0}
              </span>
              <span style={{ fontSize: 13, color: "#555", lineHeight: 1.3 }}>bài viết</span>
            </div>
          </div>

          {/* Bio / shop name full */}
          <div style={{ lineHeight: 1 }}>
            <p style={{ fontSize: 13.5, fontWeight: 700, color: "#111", margin: "0 0 3px" }}>
              {shop?.name || "Hớp Café"}
            </p>
            {shop?.description && (
              <p style={{ fontSize: 13.5, color: "#333", margin: "0 0 5px", lineHeight: 1.5, maxWidth: 360 }}>
                {shop.description}
              </p>
            )}
            {address && (
              <p style={{ fontSize: 13, color: "#555", margin: "0 0 2px", display: "flex", alignItems: "center", gap: 4 }}>
                <MapPin size={12} color="#888" />
                {address}
              </p>
            )}
            {hours && (
              <p style={{ fontSize: 13, color: "#555", margin: 0, display: "flex", alignItems: "center", gap: 4 }}>
                <Clock size={12} color="#888" />
                {hours}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* ── Divider + tab bar ── */}
      <div style={{ borderTop: "0.5px solid #dbdbdb", marginTop: 4 }}>
        <div style={{
          display: "flex",
          justifyContent: "center",
        }}>
          {/* Active tab */}
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            padding: "12px 0",
            borderTop: "1.5px solid #111",
            marginTop: -1,
            fontSize: 11,
            fontWeight: 600,
            color: "#111",
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            cursor: "default",
            userSelect: "none",
          }}>
            <Grid3x3 size={13} strokeWidth={2} />
            Bài viết
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── BlogPage ──────────────────────────────────────────────────────────────────
export default function BlogPage() {
  const { shopSlug } = useParams();
  const { shop, posts = [], loading, error } = useShopMenu(shopSlug);
  const [mobileOpen, setMobileOpen] = useState(false);

  if (loading) return <LoadingScreen />;

  if (error) {
    return (
      <main style={{ display: "grid", minHeight: "100svh", placeItems: "center", background: "#fff", padding: "0 16px" }}>
        <StateBox title="Có lỗi xảy ra" description={error} />
      </main>
    );
  }

  if (!shop) {
    return (
      <main style={{ display: "grid", minHeight: "100svh", placeItems: "center", background: "#fff", padding: "0 16px" }}>
        <StateBox
          title="Không tìm thấy cửa hàng"
          description="Cửa hàng chưa được public hoặc đường dẫn không đúng."
        />
      </main>
    );
  }

  const activePosts = posts.filter((p) => p.isActive !== false);

  return (
    <main style={{ minHeight: "100svh", background: "#fff", color: "#2F221C" }}>

      {/* Site-wide nav header */}
      <MenuHeader shop={shop} mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />

      {/* Profile header — full width, centered content */}
      <div style={{ paddingTop: 56 /* offset MenuHeader height */ }}>
        <ProfileHeader shop={shop} postCount={activePosts.length} />
      </div>

      {/* Grid — tightly bounded to 935px like Instagram */}
      <div style={{ maxWidth: 935, margin: "0 auto" }}>
        <BlogSection posts={activePosts} shop={shop} />
      </div>

      <ShopFooter shop={shop} />
    </main>
  );
}