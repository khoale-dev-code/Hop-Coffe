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
} from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import { DEFAULT_SHOP_ID, getShopById } from "../services/shopService";

const navItems = [
  {
    to: "/admin/dashboard",
    label: "Tổng quan",
    description: "Thống kê nhanh",
    icon: LayoutDashboard,
  },
  {
    to: "/admin/menu",
    label: "Quản lý menu",
    description: "Danh mục và món",
    icon: Soup,
  },
  {
    to: "/admin/promotions",
    label: "Khuyến mãi",
    description: "Banner, ảnh, video",
    icon: Megaphone,
  },
  {
    to: "/admin/settings",
    label: "Cài đặt quán",
    description: "Thông tin cửa hàng",
    icon: Settings,
  },
];

function getPageTitle(pathname) {
  if (pathname.startsWith("/admin/menu")) return "Quản lý menu";
  if (pathname.startsWith("/admin/promotions")) return "Quản lý khuyến mãi";
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
      <main className="grid min-h-screen place-items-center bg-[#F6F7F9]">
        <div className="rounded-[16px] bg-white p-8 text-center shadow-sm ring-1 ring-neutral-200">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-neutral-200 border-t-neutral-950" />
          <p className="mt-4 text-sm font-semibold text-neutral-500">
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
        <header className="sticky top-0 z-30 border-b border-neutral-200 bg-white/90 backdrop-blur-xl">
          <div className="flex h-16 items-center justify-between gap-3 px-4 sm:px-6 lg:h-20 lg:px-8">
            <div className="flex min-w-0 items-center gap-3">
              <button
                type="button"
                onClick={() => setMobileOpen(true)}
                className="grid h-10 w-10 shrink-0 place-items-center rounded-[8px] bg-neutral-100 text-neutral-700 lg:hidden"
              >
                <Menu size={20} />
              </button>

              <div className="min-w-0">
                <p className="truncate text-xl font-black tracking-tight lg:text-2xl">
                  {pageTitle}
                </p>

                <p className="mt-0.5 hidden truncate text-sm font-medium text-neutral-500 sm:block">
                  Quản trị menu online, khuyến mãi và thông tin cửa hàng
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <PublicMenuButton
                publicPath={publicPath}
                shopLoading={shopLoading}
                compact
              />

              <button
                type="button"
                onClick={handleLogout}
                className="hidden items-center gap-2 rounded-[8px] bg-neutral-950 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-neutral-800 sm:inline-flex"
              >
                <LogOut size={16} />
                Thoát
              </button>
            </div>
          </div>
        </header>

        <main className="mx-auto max-w-7xl px-4 py-5 sm:px-6 lg:px-8 lg:py-8">
          <Outlet />
        </main>
      </div>
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
          className="flex w-full items-center justify-center gap-2 rounded-[10px] bg-neutral-950 px-4 py-3 text-sm font-bold text-white transition hover:bg-neutral-800"
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
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
      />

      <aside className="relative h-full w-[88%] max-w-[340px] bg-white p-4 shadow-2xl">
        <div className="flex items-center justify-between gap-3">
          <p className="text-lg font-black">Admin Panel</p>

          <button
            type="button"
            onClick={onClose}
            className="grid h-10 w-10 place-items-center rounded-[8px] bg-neutral-100"
          >
            <X size={20} />
          </button>
        </div>

        <div className="mt-4">
          <BrandBox user={user} shop={shop} compact />
        </div>

        <nav className="mt-5 space-y-2">
          {navItems.map((item) => (
            <SidebarLink key={item.to} item={item} onClick={onClose} />
          ))}
        </nav>

        <div className="absolute bottom-4 left-4 right-4 space-y-3">
          <PublicMenuButton publicPath={publicPath} shopLoading={shopLoading} />

          <button
            type="button"
            onClick={onLogout}
            className="flex w-full items-center justify-center gap-2 rounded-[10px] bg-neutral-950 px-4 py-3 text-sm font-bold text-white"
          >
            <LogOut size={17} />
            Đăng xuất
          </button>
        </div>
      </aside>
    </div>
  );
}

function PublicMenuButton({ publicPath, shopLoading, compact = false }) {
  if (shopLoading) {
    return (
      <button
        type="button"
        disabled
        className={`items-center justify-center gap-2 rounded-[10px] border border-neutral-200 bg-white px-4 py-3 text-sm font-bold text-neutral-400 ${
          compact ? "hidden sm:inline-flex" : "flex w-full"
        }`}
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
        className={`items-center justify-center gap-2 rounded-[10px] border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-bold text-amber-700 transition hover:bg-amber-100 ${
          compact ? "hidden sm:inline-flex" : "flex w-full"
        }`}
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
      className={`items-center justify-center gap-2 rounded-[10px] border border-neutral-200 bg-white px-4 py-3 text-sm font-bold text-neutral-700 transition hover:bg-neutral-50 ${
        compact ? "hidden sm:inline-flex" : "flex w-full"
      }`}
    >
      <ExternalLink size={17} />
      Xem menu khách hàng
    </Link>
  );
}

function BrandBox({ user, shop, compact = false }) {
  return (
    <div className="overflow-hidden rounded-[16px] bg-neutral-950 p-4 text-white">
      <div className="flex items-center gap-3">
        <div className="grid h-11 w-11 shrink-0 place-items-center overflow-hidden rounded-[12px] bg-white text-neutral-950">
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
        <div className="mt-4 rounded-[12px] bg-white/10 p-3">
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
        `group flex items-center gap-3 rounded-[12px] px-3 py-3 transition ${
          isActive
            ? "bg-neutral-950 text-white shadow-sm"
            : "text-neutral-600 hover:bg-neutral-100 hover:text-neutral-950"
        }`
      }
    >
      {({ isActive }) => (
        <>
          <div
            className={`grid h-10 w-10 shrink-0 place-items-center rounded-[10px] ${
              isActive
                ? "bg-white/15 text-white"
                : "bg-neutral-100 text-neutral-500 group-hover:bg-white group-hover:text-neutral-950"
            }`}
          >
            <Icon size={19} />
          </div>

          <div className="min-w-0">
            <p className="text-sm font-black">{item.label}</p>
            <p
              className={`mt-0.5 truncate text-xs font-medium ${
                isActive ? "text-white/55" : "text-neutral-400"
              }`}
            >
              {item.description}
            </p>
          </div>
        </>
      )}
    </NavLink>
  );
}