import { useEffect, useMemo, useState } from "react";
import { Link, NavLink, Navigate, Outlet, useLocation } from "react-router-dom";
import {
  CalendarCheck,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  LayoutDashboard,
  Loader2,
  LogOut,
  Megaphone,
  Menu,
  Newspaper,
  Settings,
  Soup,
  X,
} from "lucide-react";

import { useAuth } from "../hooks/useAuth";
import { DEFAULT_SHOP_ID, getShopById } from "../services/shopService";

const EXPANDED_SIDEBAR_WIDTH = 320;
const COLLAPSED_SIDEBAR_WIDTH = 88;

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
    to: "/admin/reservations",
    label: "Đặt lịch / đặt bàn",
    shortLabel: "Đặt lịch",
    description: "Khách đặt bàn",
    icon: CalendarCheck,
  },
  {
    to: "/admin/promotions",
    label: "Khuyến mãi",
    shortLabel: "Ưu đãi",
    description: "Banner, ảnh, video",
    icon: Megaphone,
  },
  {
    to: "/admin/posts",
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

function getInitialSidebarCollapsed() {
  if (typeof window === "undefined") return false;

  return window.localStorage.getItem("admin-sidebar-collapsed") === "true";
}

function getPageTitle(pathname) {
  if (pathname.startsWith("/admin/menu")) return "Quản lý menu";

  if (pathname.startsWith("/admin/reservations")) {
    return "Quản lý đặt lịch / đặt bàn";
  }

  if (pathname.startsWith("/admin/promotions")) return "Quản lý khuyến mãi";
  if (pathname.startsWith("/admin/posts")) return "Bản tin quán";
  if (pathname.startsWith("/admin/settings")) return "Cài đặt quán";

  return "Tổng quan";
}

function getPageDescription(pathname) {
  if (pathname.startsWith("/admin/menu")) {
    return "Quản lý danh mục, sản phẩm, giá bán và trạng thái món.";
  }

  if (pathname.startsWith("/admin/reservations")) {
    return "Theo dõi khách đặt bàn, xác nhận lịch và liên hệ khách hàng.";
  }

  if (pathname.startsWith("/admin/promotions")) {
    return "Quản lý banner, khuyến mãi, ảnh và video hiển thị ngoài menu.";
  }

  if (pathname.startsWith("/admin/posts")) {
    return "Quản lý bài đăng, hình ảnh và cập nhật mới nhất của quán.";
  }

  if (pathname.startsWith("/admin/settings")) {
    return "Cập nhật thông tin cửa hàng, logo, ảnh bìa và liên kết.";
  }

  return "Quản trị menu online, khuyến mãi, đặt lịch và thông tin cửa hàng.";
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
  const [sidebarCollapsed, setSidebarCollapsed] = useState(
    getInitialSidebarCollapsed
  );
  const [shop, setShop] = useState(null);
  const [shopLoading, setShopLoading] = useState(true);

  const pageTitle = getPageTitle(location.pathname);
  const pageDescription = getPageDescription(location.pathname);
  const publicPath = useMemo(() => getPublicPath(shop), [shop]);

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    window.localStorage.setItem(
      "admin-sidebar-collapsed",
      sidebarCollapsed ? "true" : "false"
    );
  }, [sidebarCollapsed]);

  useEffect(() => {
    if (!user) return;

    let mounted = true;

    async function loadShop() {
      try {
        setShopLoading(true);

        const shopData = await getShopById(DEFAULT_SHOP_ID);

        if (mounted) {
          setShop(shopData);
        }
      } catch (err) {
        console.error("Không thể tải thông tin quán:", err);

        if (mounted) {
          setShop(null);
        }
      } finally {
        if (mounted) {
          setShopLoading(false);
        }
      }
    }

    loadShop();

    return () => {
      mounted = false;
    };
  }, [user]);

  if (authLoading) {
    return (
      <main className="grid min-h-[100dvh] place-items-center bg-[#F6F7F9] px-4">
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
    <div className="min-h-[100dvh] bg-[#F6F7F9] text-neutral-950">
      <DesktopSidebar
        user={user}
        shop={shop}
        publicPath={publicPath}
        shopLoading={shopLoading}
        collapsed={sidebarCollapsed}
        onToggleCollapsed={() => setSidebarCollapsed((value) => !value)}
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

      <div
        className={[
          "min-h-[100dvh] transition-[padding] duration-300 ease-out",
          sidebarCollapsed ? "lg:pl-[88px]" : "lg:pl-[320px]",
        ].join(" ")}
      >
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

              <button
                type="button"
                onClick={() => setSidebarCollapsed((value) => !value)}
                className="hidden h-10 w-10 shrink-0 place-items-center rounded-[10px] border border-neutral-200 bg-white text-neutral-800 shadow-sm transition hover:bg-neutral-50 lg:grid"
                aria-label={
                  sidebarCollapsed ? "Mở rộng sidebar" : "Thu gọn sidebar"
                }
                title={sidebarCollapsed ? "Mở rộng sidebar" : "Thu gọn sidebar"}
              >
                {sidebarCollapsed ? (
                  <ChevronRight size={19} />
                ) : (
                  <ChevronLeft size={19} />
                )}
              </button>

              <div className="min-w-0">
                <p className="truncate text-lg font-black tracking-tight text-neutral-950 sm:text-xl lg:text-2xl">
                  {pageTitle}
                </p>

                <p className="mt-0.5 hidden truncate text-sm font-medium text-neutral-500 sm:block">
                  {pageDescription}
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
                className="hidden items-center gap-2 rounded-[8px] bg-neutral-950 px-4 py-2.5 text-sm font-black !text-white transition hover:bg-neutral-800 sm:inline-flex"
              >
                <LogOut size={16} className="text-white" />
                <span className="text-white">Thoát</span>
              </button>
            </div>
          </div>
        </header>

        <main className="mx-auto min-h-[calc(100dvh-64px)] max-w-7xl px-3 pb-[calc(92px+env(safe-area-inset-bottom))] pt-4 sm:px-6 sm:pt-5 lg:min-h-[calc(100dvh-80px)] lg:px-8 lg:pb-8 lg:pt-8">
          <Outlet />
        </main>
      </div>

      <MobileBottomNav />
    </div>
  );
}

function DesktopSidebar({
  user,
  shop,
  publicPath,
  shopLoading,
  collapsed,
  onToggleCollapsed,
  onLogout,
}) {
  return (
    <aside
      className={[
        "fixed left-0 top-0 hidden h-[100dvh] border-r border-neutral-200 bg-white transition-[width] duration-300 ease-out lg:flex lg:flex-col",
        collapsed ? "w-[88px]" : "w-[320px]",
      ].join(" ")}
      style={{
        width: collapsed ? COLLAPSED_SIDEBAR_WIDTH : EXPANDED_SIDEBAR_WIDTH,
      }}
    >
      <div
        className={[
          "flex min-h-0 flex-1 flex-col",
          collapsed ? "p-3" : "p-4",
        ].join(" ")}
      >
        <BrandBox user={user} shop={shop} collapsed={collapsed} />

        <button
          type="button"
          onClick={onToggleCollapsed}
          className={[
            "mt-3 hidden items-center justify-center gap-2 rounded-[12px] border border-neutral-200 bg-white text-sm font-black text-neutral-800 shadow-sm transition hover:bg-neutral-50 lg:flex",
            collapsed ? "h-11 w-full px-0" : "h-11 px-4",
          ].join(" ")}
          title={collapsed ? "Mở rộng sidebar" : "Thu gọn sidebar"}
        >
          {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}

          {!collapsed && <span>Thu gọn menu</span>}
        </button>

        <nav
          className={[
            "mt-4 min-h-0 flex-1 overflow-y-auto",
            collapsed ? "space-y-2 pr-0" : "space-y-1.5 pr-1",
          ].join(" ")}
        >
          {navItems.map((item) => (
            <SidebarLink key={item.to} item={item} collapsed={collapsed} />
          ))}
        </nav>

        <div
          className={[
            "mt-4 space-y-3 border-t border-neutral-200 pt-4",
            collapsed && "space-y-2",
          ]
            .filter(Boolean)
            .join(" ")}
        >
          <PublicMenuButton
            publicPath={publicPath}
            shopLoading={shopLoading}
            collapsed={collapsed}
          />

          <button
            type="button"
            onClick={onLogout}
            className={[
              "flex w-full items-center justify-center gap-2 rounded-[12px] bg-neutral-950 text-sm font-black !text-white transition hover:bg-neutral-800",
              collapsed ? "h-12 px-0" : "px-4 py-3",
            ].join(" ")}
            title="Đăng xuất"
          >
            <LogOut size={17} className="text-white" />

            {!collapsed && <span className="text-white">Đăng xuất</span>}
          </button>
        </div>
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

      <aside className="relative flex h-[100dvh] w-[92%] max-w-[360px] flex-col overflow-y-auto bg-white p-3 shadow-2xl sm:p-4">
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

        <nav className="mt-4 space-y-2 pb-4">
          {navItems.map((item) => (
            <SidebarLink key={item.to} item={item} onClick={onClose} />
          ))}
        </nav>

        <div className="mt-auto space-y-3 border-t border-neutral-200 pt-4">
          <PublicMenuButton publicPath={publicPath} shopLoading={shopLoading} />

          <button
            type="button"
            onClick={onLogout}
            className="flex w-full items-center justify-center gap-2 rounded-[10px] bg-neutral-950 px-4 py-3 text-sm font-black !text-white"
          >
            <LogOut size={17} className="text-white" />
            <span className="text-white">Đăng xuất</span>
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

function PublicMenuButton({ publicPath, shopLoading, collapsed = false }) {
  if (shopLoading) {
    return (
      <button
        type="button"
        disabled
        className={[
          "flex w-full items-center justify-center gap-2 rounded-[12px] border border-neutral-200 bg-white text-sm font-black text-neutral-400",
          collapsed ? "h-12 px-0" : "px-4 py-3",
        ].join(" ")}
        title="Đang tải link"
      >
        <Loader2 size={16} className="animate-spin" />

        {!collapsed && <span>Đang tải link</span>}
      </button>
    );
  }

  if (!publicPath) {
    return (
      <Link
        to="/admin/settings"
        className={[
          "flex w-full items-center justify-center gap-2 rounded-[12px] border border-amber-200 bg-amber-50 text-sm font-black text-amber-700 transition hover:bg-amber-100",
          collapsed ? "h-12 px-0" : "px-4 py-3",
        ].join(" ")}
        title="Tạo slug menu"
      >
        <Settings size={16} />

        {!collapsed && <span>Tạo slug menu</span>}
      </Link>
    );
  }

  return (
    <Link
      to={publicPath}
      target="_blank"
      rel="noreferrer"
      className={[
        "flex w-full items-center justify-center gap-2 rounded-[12px] border border-neutral-200 bg-white text-sm font-black text-neutral-800 transition hover:bg-neutral-50",
        collapsed ? "h-12 px-0" : "px-4 py-3",
      ].join(" ")}
      title="Xem menu khách hàng"
    >
      <ExternalLink size={17} />

      {!collapsed && <span>Xem menu khách hàng</span>}
    </Link>
  );
}

function MobileBottomNav() {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-neutral-200 bg-white/95 px-1.5 pb-[max(8px,env(safe-area-inset-bottom))] pt-2 shadow-[0_-10px_30px_rgba(0,0,0,0.08)] backdrop-blur-xl lg:hidden">
      <div className="mx-auto grid max-w-2xl grid-cols-6 gap-1">
        {navItems.map((item) => {
          const Icon = item.icon;

          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                [
                  "group flex min-h-[56px] flex-col items-center justify-center gap-1 rounded-[10px] px-0.5 text-[9px] font-black transition",
                  isActive
                    ? "bg-neutral-100 text-neutral-950"
                    : "bg-transparent text-neutral-500 hover:bg-neutral-50 hover:text-neutral-950",
                ].join(" ")
              }
            >
              {({ isActive }) => (
                <>
                  <span
                    className={[
                      "grid h-7 w-7 place-items-center rounded-[8px] transition",
                      isActive
                        ? "bg-neutral-950 text-white shadow-sm"
                        : "bg-transparent text-neutral-500 group-hover:bg-white group-hover:text-neutral-950",
                    ].join(" ")}
                  >
                    <Icon size={17} />
                  </span>

                  <span
                    className={[
                      "line-clamp-1 max-w-full leading-none",
                      isActive ? "text-neutral-950" : "text-neutral-500",
                    ].join(" ")}
                  >
                    {item.shortLabel}
                  </span>
                </>
              )}
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}

function BrandBox({ user, shop, compact = false, collapsed = false }) {
  if (collapsed) {
    return (
      <div className="grid place-items-center rounded-[16px] bg-neutral-950 p-2.5 text-white shadow-sm">
        <ShopLogo shop={shop} small />
      </div>
    );
  }

  return (
    <div className="rounded-[18px] bg-neutral-950 p-4 text-white shadow-sm">
      <div className="flex min-w-0 items-center gap-3">
        <ShopLogo shop={shop} />

        <div className="min-w-0 flex-1">
          <p className="truncate text-xl font-black leading-tight text-white">
            {shop?.name || "F&B Menu"}
          </p>

          <p className="mt-1 truncate text-sm font-bold text-white/55">
            {shop?.slug ? `/${shop.slug}` : "Admin workspace"}
          </p>
        </div>
      </div>

      {!compact && (
        <div className="mt-4 rounded-[12px] bg-white/10 p-3">
          <p className="text-[11px] font-black uppercase tracking-[0.14em] text-white/45">
            Tài khoản
          </p>

          <p className="mt-1 truncate text-sm font-bold leading-5 text-white/90">
            {user.email}
          </p>
        </div>
      )}
    </div>
  );
}

function ShopLogo({ shop, small = false }) {
  const [imageError, setImageError] = useState(false);

  return (
    <div
      className={[
        "grid shrink-0 place-items-center overflow-hidden rounded-[14px] bg-white text-neutral-950 ring-1 ring-white/20",
        small ? "h-12 w-12" : "h-14 w-14",
      ].join(" ")}
    >
      {shop?.logoUrl && !imageError ? (
        <img
          src={shop.logoUrl}
          alt={shop.name || "Logo"}
          onError={() => setImageError(true)}
          className="h-full w-full object-contain p-1.5"
        />
      ) : (
        <Soup size={small ? 23 : 26} />
      )}
    </div>
  );
}

function SidebarLink({ item, onClick, collapsed = false }) {
  const Icon = item.icon;

  return (
    <NavLink
      to={item.to}
      onClick={onClick}
      title={collapsed ? item.label : undefined}
      className={({ isActive }) =>
        [
          "group flex items-center transition",
          collapsed
            ? "min-h-[54px] justify-center rounded-[14px] px-0 py-0"
            : "min-h-[72px] gap-3 rounded-[16px] px-3 py-3",
          isActive
            ? "bg-neutral-950 text-white shadow-sm"
            : "bg-white text-neutral-700 hover:bg-neutral-100 hover:text-neutral-950",
        ].join(" ")
      }
    >
      {({ isActive }) => (
        <>
          <div
            className={[
              "grid shrink-0 place-items-center rounded-[14px] transition",
              collapsed ? "h-11 w-11" : "h-12 w-12",
              isActive
                ? "bg-white/15 text-white"
                : "bg-neutral-100 text-neutral-500 group-hover:bg-white group-hover:text-neutral-950",
            ].join(" ")}
          >
            <Icon size={collapsed ? 20 : 21} />
          </div>

          {!collapsed && (
            <div className="min-w-0 flex-1">
              <p
                className={[
                  "truncate text-base font-black leading-5",
                  isActive ? "text-white" : "text-neutral-950",
                ].join(" ")}
              >
                {item.label}
              </p>

              <p
                className={[
                  "mt-1 truncate text-sm font-semibold leading-5",
                  isActive ? "text-white/60" : "text-neutral-400",
                ].join(" ")}
              >
                {item.description}
              </p>
            </div>
          )}
        </>
      )}
    </NavLink>
  );
}