import { useEffect, useMemo, useState } from "react";
import { Link, NavLink, Navigate, Outlet, useLocation } from "react-router-dom";
import {
  ExternalLink,
  LayoutDashboard,
  Loader2,
  LogOut,
  Megaphone,
  Menu,
  Settings,
  Soup,
  X,
  Newspaper, // <-- Thêm icon cho phần Bản tin
} from "lucide-react";

import { useAuth } from "../hooks/useAuth";
import { DEFAULT_SHOP_ID, getShopById } from "../services/shopService";

const navItems = [
  {
    to: "/admin/dashboard",
    label: "Tổng quan",
    shortLabel: "Tổng quan",
    description: "Thống kê nhanh",
    icon: LayoutDashboard,
  },
  {
    to: "/admin/menu",
    label: "Quản lý menu",
    shortLabel: "Menu",
    description: "Danh mục và món",
    icon: Soup,
  },
  {
    to: "/admin/promotions",
    label: "Khuyến mãi",
    shortLabel: "Ưu đãi",
    description: "Banner, ảnh, video",
    icon: Megaphone,
  },
  {
    to: "/admin/posts", // <-- Thêm menu quản lý Bản tin
    label: "Bản tin",
    shortLabel: "Bản tin",
    description: "Bài đăng của quán",
    icon: Newspaper,
  },
  {
    to: "/admin/settings",
    label: "Cài đặt quán",
    shortLabel: "Cài đặt",
    description: "Thông tin cửa hàng",
    icon: Settings,
  },
];

function getPageTitle(pathname) {
  if (pathname.startsWith("/admin/menu")) return "Quản lý menu";
  if (pathname.startsWith("/admin/promotions")) return "Quản lý khuyến mãi";
  if (pathname.startsWith("/admin/posts")) return "Bản tin quán"; // <-- Thêm title cho trang posts
  if (pathname.startsWith("/admin/settings")) return "Cài đặt quán";
  return "Tổng quan";
}

function cleanSlug(slug = "") {
  return slug.trim().replace(/^\/+/, "").replace(/\/+$/, "");
}

function getPublicPath(shop) {
  const slug = cleanSlug(shop?.slug || "");
  if (!slug) return "";
  return `/${slug}`;
}

export default function AdminLayout() {
  const location = useLocation();
  const { user, authLoading, logout } = useAuth();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [shop, setShop] = useState(null);
  const [shopLoading, setShopLoading] = useState(true);

  const pageTitle = getPageTitle(location.pathname);
  const publicPath = useMemo(() => getPublicPath(shop), [shop]);

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (!user) return;

    async function loadShop() {
      try {
        setShopLoading(true);

        const shopData = await getShopById(DEFAULT_SHOP_ID);
        setShop(shopData);
      } catch (err) {
        console.error("Không thể tải thông tin quán:", err);
        setShop(null);
      } finally {
        setShopLoading(false);
      }
    }

    loadShop();
  }, [user]);

  if (authLoading) {
    return (
      <main className="grid min-h-screen place-items-center bg-[#F6F7F9] px-4">
        <div className="w-full max-w-sm rounded-[14px] border border-neutral-200 bg-white p-8 text-center shadow-sm">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-neutral-200 border-t-neutral-950" />

          <p className="mt-4 text-sm font-bold text-neutral-500">
            Đang kiểm tra đăng nhập...
          </p>
        </div>
      </main>
    );
  }

  if (!user) {
    return <Navigate to="/admin/login" replace state={{ from: location }} />;
  }

  async function handleLogout() {
    await logout();
  }

  return (
    <div className="min-h-screen bg-[#F6F7F9] text-neutral-950">
      <DesktopSidebar
        user={user}
        shop={shop}
        publicPath={publicPath}
        shopLoading={shopLoading}
        onLogout={handleLogout}
      />

      {mobileOpen && (
        <MobileSidebar
          user={user}
          shop={shop}
          publicPath={publicPath}
          shopLoading={shopLoading}
          onClose={() => setMobileOpen(false)}
          onLogout={handleLogout}
        />
      )}

      <div className="lg:pl-[280px]">
        <header className="sticky top-0 z-30 border-b border-neutral-200 bg-white/95 backdrop-blur-xl">
          <div className="flex h-16 items-center justify-between gap-3 px-3 sm:px-6 lg:h-20 lg:px-8">
            <div className="flex min-w-0 items-center gap-3">
              <button
                type="button"
                onClick={() => setMobileOpen(true)}
                className="grid h-10 w-10 shrink-0 place-items-center rounded-[8px] border border-neutral-200 bg-white text-neutral-800 shadow-sm lg:hidden"
                aria-label="Mở menu admin"
              >
                <Menu size={20} />
              </button>

              <div className="min-w-0">
                <p className="truncate text-lg font-black tracking-tight text-neutral-950 sm:text-xl lg:text-2xl">
                  {pageTitle}
                </p>

                <p className="mt-0.5 hidden truncate text-sm font-medium text-neutral-500 sm:block">
                  Quản trị menu online, khuyến mãi và thông tin cửa hàng
                </p>
              </div>
            </div>

            <div className="flex shrink-0 items-center gap-2">
              <HeaderPublicButton
                publicPath={publicPath}
                shopLoading={shopLoading}
              />

              <button
                type="button"
                onClick={handleLogout}
                className="hidden items-center gap-2 rounded-[8px] bg-neutral-950 px-4 py-2.5 text-sm font-black text-white transition hover:bg-neutral-800 sm:inline-flex"
              >
                <LogOut size={16} />
                Thoát
              </button>
            </div>
          </div>
        </header>

        <main className="mx-auto max-w-7xl px-3 pb-28 pt-4 sm:px-6 sm:pt-5 lg:px-8 lg:pb-8 lg:pt-8">
          <Outlet />
        </main>
      </div>

      <MobileBottomNav />
    </div>
  );
}

function DesktopSidebar({ user, shop, publicPath, shopLoading, onLogout }) {
  return (
    <aside className="fixed left-0 top-0 hidden h-screen w-[280px] border-r border-neutral-200 bg-white p-4 lg:flex lg:flex-col">
      <BrandBox user={user} shop={shop} />

      <nav className="mt-5 space-y-2">
        {navItems.map((item) => (
          <SidebarLink key={item.to} item={item} />
        ))}
      </nav>

      <div className="mt-auto space-y-3">
        <PublicMenuButton publicPath={publicPath} shopLoading={shopLoading} />

        <button
          type="button"
          onClick={onLogout}
          className="flex w-full items-center justify-center gap-2 rounded-[10px] bg-neutral-950 px-4 py-3 text-sm font-black text-white transition hover:bg-neutral-800"
        >
          <LogOut size={17} />
          Đăng xuất
        </button>
      </div>
    </aside>
  );
}

function MobileSidebar({
  user,
  shop,
  publicPath,
  shopLoading,
  onClose,
  onLogout,
}) {
  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      <button
        type="button"
        onClick={onClose}
        className="absolute inset-0 bg-black/45 backdrop-blur-sm"
        aria-label="Đóng menu admin"
      />

      <aside className="relative flex h-full w-[92%] max-w-[360px] flex-col overflow-y-auto bg-white p-3 shadow-2xl sm:p-4">
        <div className="flex items-center justify-between gap-3 border-b border-neutral-200 pb-3">
          <p className="text-lg font-black text-neutral-950">Admin Panel</p>

          <button
            type="button"
            onClick={onClose}
            className="grid h-10 w-10 place-items-center rounded-[8px] bg-neutral-100 text-neutral-800"
            aria-label="Đóng menu"
          >
            <X size={20} />
          </button>
        </div>

        <div className="mt-4">
          <BrandBox user={user} shop={shop} compact />
        </div>

        <nav className="mt-4 space-y-2">
          {navItems.map((item) => (
            <SidebarLink key={item.to} item={item} onClick={onClose} />
          ))}
        </nav>

        <div className="mt-auto space-y-3 border-t border-neutral-200 pt-4">
          <PublicMenuButton publicPath={publicPath} shopLoading={shopLoading} />

          <button
            type="button"
            onClick={onLogout}
            className="flex w-full items-center justify-center gap-2 rounded-[10px] bg-neutral-950 px-4 py-3 text-sm font-black text-white"
          >
            <LogOut size={17} />
            Đăng xuất
          </button>
        </div>
      </aside>
    </div>
  );
}

function HeaderPublicButton({ publicPath, shopLoading }) {
  if (shopLoading) {
    return (
      <button
        type="button"
        disabled
        className="grid h-10 w-10 place-items-center rounded-[8px] border border-neutral-200 bg-white text-neutral-400 shadow-sm sm:inline-flex sm:w-auto sm:gap-2 sm:px-4"
        aria-label="Đang tải link menu"
      >
        <Loader2 size={17} className="animate-spin" />
        <span className="hidden text-sm font-black sm:inline">
          Đang tải link
        </span>
      </button>
    );
  }

  if (!publicPath) {
    return (
      <Link
        to="/admin/settings"
        className="grid h-10 w-10 place-items-center rounded-[8px] border border-amber-200 bg-amber-50 text-amber-700 shadow-sm sm:inline-flex sm:w-auto sm:gap-2 sm:px-4"
        aria-label="Tạo slug menu"
      >
        <Settings size={17} />
        <span className="hidden text-sm font-black sm:inline">
          Tạo slug menu
        </span>
      </Link>
    );
  }

  return (
    <Link
      to={publicPath}
      target="_blank"
      rel="noreferrer"
      className="grid h-10 w-10 place-items-center rounded-[8px] border border-neutral-200 bg-white text-neutral-800 shadow-sm transition hover:bg-neutral-50 sm:inline-flex sm:w-auto sm:gap-2 sm:px-4"
      aria-label="Xem menu khách hàng"
    >
      <ExternalLink size={17} />
      <span className="hidden text-sm font-black sm:inline">Xem menu</span>
    </Link>
  );
}

function PublicMenuButton({ publicPath, shopLoading }) {
  if (shopLoading) {
    return (
      <button
        type="button"
        disabled
        className="flex w-full items-center justify-center gap-2 rounded-[10px] border border-neutral-200 bg-white px-4 py-3 text-sm font-black text-neutral-400"
      >
        <Loader2 size={16} className="animate-spin" />
        Đang tải link
      </button>
    );
  }

  if (!publicPath) {
    return (
      <Link
        to="/admin/settings"
        className="flex w-full items-center justify-center gap-2 rounded-[10px] border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-black text-amber-700 transition hover:bg-amber-100"
      >
        <Settings size={16} />
        Tạo slug menu
      </Link>
    );
  }

  return (
    <Link
      to={publicPath}
      target="_blank"
      rel="noreferrer"
      className="flex w-full items-center justify-center gap-2 rounded-[10px] border border-neutral-200 bg-white px-4 py-3 text-sm font-black text-neutral-800 transition hover:bg-neutral-50"
    >
      <ExternalLink size={17} />
      Xem menu khách hàng
    </Link>
  );
}

function MobileBottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-neutral-200 bg-white/95 px-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-2 shadow-[0_-10px_30px_rgba(0,0,0,0.08)] backdrop-blur-xl lg:hidden">
      {/* Đổi grid-cols-4 thành grid-cols-5 để hiển thị đủ 5 nút */}
      <div className="grid grid-cols-5 gap-1">
        {navItems.map((item) => {
          const Icon = item.icon;

          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                [
                  "flex min-h-[56px] flex-col items-center justify-center gap-1 rounded-[10px] px-1 text-[10px] font-black transition",
                  isActive
                    ? "bg-neutral-950 text-white"
                    : "text-neutral-500 hover:bg-neutral-100 hover:text-neutral-950",
                ].join(" ")
              }
            >
              {({ isActive }) => (
                <>
                  <Icon size={19} />
                  <span className="line-clamp-1">{item.shortLabel}</span>
                  {isActive && (
                    <span className="h-1 w-4 rounded-full bg-white/70" />
                  )}
                </>
              )}
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}

function BrandBox({ user, shop, compact = false }) {
  return (
    <div className="overflow-hidden rounded-[14px] bg-neutral-950 p-4 text-white">
      <div className="flex items-center gap-3">
        <div className="grid h-11 w-11 shrink-0 place-items-center overflow-hidden rounded-[10px] bg-white text-neutral-950">
          {shop?.logoUrl ? (
            <img
              src={shop.logoUrl}
              alt={shop.name || "Logo"}
              className="h-full w-full object-contain p-1"
            />
          ) : (
            <Soup size={23} />
          )}
        </div>

        <div className="min-w-0">
          <p className="truncate text-lg font-black leading-none">
            {shop?.name || "F&B Menu"}
          </p>

          <p className="mt-1 truncate text-xs font-semibold text-white/50">
            {shop?.slug ? `/${shop.slug}` : "Admin workspace"}
          </p>
        </div>
      </div>

      {!compact && (
        <div className="mt-4 rounded-[10px] bg-white/10 p-3">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-white/40">
            Tài khoản
          </p>

          <p className="mt-1 truncate text-sm font-bold text-white/85">
            {user.email}
          </p>
        </div>
      )}
    </div>
  );
}

function SidebarLink({ item, onClick }) {
  const Icon = item.icon;

  return (
    <NavLink
      to={item.to}
      onClick={onClick}
      className={({ isActive }) =>
        [
          "group flex items-center gap-3 rounded-[12px] px-3 py-3 transition",
          isActive
            ? "bg-neutral-950 text-white shadow-sm"
            : "text-neutral-600 hover:bg-neutral-100 hover:text-neutral-950",
        ].join(" ")
      }
    >
      {({ isActive }) => (
        <>
          <div
            className={[
              "grid h-10 w-10 shrink-0 place-items-center rounded-[10px]",
              isActive
                ? "bg-white/15 text-white"
                : "bg-neutral-100 text-neutral-500 group-hover:bg-white group-hover:text-neutral-950",
            ].join(" ")}
          >
            <Icon size={19} />
          </div>

          <div className="min-w-0">
            <p className="text-sm font-black">{item.label}</p>

            <p
              className={[
                "mt-0.5 truncate text-xs font-medium",
                isActive ? "text-white/55" : "text-neutral-400",
              ].join(" ")}
            >
              {item.description}
            </p>
          </div>
        </>
      )}
    </NavLink>
  );
}