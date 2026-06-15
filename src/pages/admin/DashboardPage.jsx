import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Copy,
  ExternalLink,
  Eye,
  EyeOff,
  Folder,
  Loader2,
  MapPin,
  Megaphone,
  Phone,
  RefreshCw,
  Settings,
  Soup,
  Star,
} from "lucide-react";

import { getShopById, DEFAULT_SHOP_ID } from "../../services/shopService";
import { getCategories } from "../../services/categoryService";
import { getItems } from "../../services/itemService";
import { getPromotions } from "../../services/promotionService";

function formatPrice(value) {
  return Number(value || 0).toLocaleString("vi-VN") + "đ";
}

function getPublicMenuUrl(shop) {
  if (!shop?.slug) return "";
  return `${window.location.origin}/${shop.slug}`;
}

export default function DashboardPage() {
  const [shop, setShop] = useState(null);
  const [categories, setCategories] = useState([]);
  const [items, setItems] = useState([]);
  const [promotions, setPromotions] = useState([]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const publicMenuUrl = getPublicMenuUrl(shop);
  const publicPath = shop?.slug ? `/${shop.slug}` : "";

  const stats = useMemo(() => {
    const availableItems = items.filter((item) => item.isAvailable !== false);
    const unavailableItems = items.filter((item) => item.isAvailable === false);
    const featuredItems = items.filter((item) => item.isFeatured);
    const activeCategories = categories.filter(
      (category) => category.isActive !== false
    );
    const activePromotions = promotions.filter(
      (promotion) => promotion.isActive !== false
    );

    return {
      categoryCount: categories.length,
      activeCategoryCount: activeCategories.length,
      itemCount: items.length,
      availableCount: availableItems.length,
      unavailableCount: unavailableItems.length,
      featuredCount: featuredItems.length,
      promotionCount: promotions.length,
      activePromotionCount: activePromotions.length,
    };
  }, [categories, items, promotions]);

  const recentItems = useMemo(() => {
    return [...items]
      .sort((a, b) => Number(a.order || 0) - Number(b.order || 0))
      .slice(0, 5);
  }, [items]);

  const setupChecks = useMemo(() => {
    return [
      {
        label: "Tên quán",
        done: Boolean(shop?.name),
        description: shop?.name || "Chưa nhập tên quán",
      },
      {
        label: "Đường dẫn menu",
        done: Boolean(shop?.slug),
        description: shop?.slug ? `/${shop.slug}` : "Chưa có slug",
      },
      {
        label: "Public menu",
        done: Boolean(shop?.isPublished),
        description: shop?.isPublished
          ? "Khách có thể xem menu"
          : "Menu chưa public",
      },
      {
        label: "Danh mục",
        done: categories.length > 0,
        description:
          categories.length > 0
            ? `${categories.length} danh mục`
            : "Chưa có danh mục",
      },
      {
        label: "Sản phẩm",
        done: items.length > 0,
        description: items.length > 0 ? `${items.length} món` : "Chưa có món",
      },
    ];
  }, [shop, categories.length, items.length]);

  async function loadDashboard({ silent = false } = {}) {
    try {
      if (silent) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      const [shopData, categoriesData, itemsData, promotionsData] =
        await Promise.all([
          getShopById(DEFAULT_SHOP_ID),
          getCategories(DEFAULT_SHOP_ID),
          getItems(DEFAULT_SHOP_ID),
          getPromotions(DEFAULT_SHOP_ID).catch(() => []),
        ]);

      setShop(shopData);
      setCategories(categoriesData);
      setItems(itemsData);
      setPromotions(promotionsData);
    } catch (err) {
      console.error(err);
      setError("Không thể tải dữ liệu tổng quan.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    loadDashboard();
  }, []);

  async function handleCopyUrl() {
    if (!publicMenuUrl) return;

    try {
      await navigator.clipboard.writeText(publicMenuUrl);
      setMessage("Đã copy link menu.");
      setTimeout(() => setMessage(""), 1800);
    } catch (err) {
      console.error(err);
      setError("Không thể copy link menu.");
    }
  }

  if (loading) {
    return <DashboardSkeleton />;
  }

  return (
    <div>
      <div className="flex flex-col justify-between gap-4 xl:flex-row xl:items-end">
        <div>
          <p className="text-sm font-black uppercase tracking-[0.18em] text-neutral-400">
            Dashboard
          </p>

          <h1 className="mt-1 text-3xl font-black tracking-tight">
            Tổng quan menu
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-neutral-500">
            Theo dõi nhanh trạng thái menu, số lượng món, danh mục, khuyến mãi
            và các bước cần hoàn thiện trước khi public cho khách.
          </p>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row">
          <button
            type="button"
            onClick={() => loadDashboard({ silent: true })}
            disabled={refreshing}
            className="inline-flex items-center justify-center gap-2 rounded-[10px] border border-neutral-200 bg-white px-4 py-3 text-sm font-bold text-neutral-700 transition hover:bg-neutral-50 disabled:opacity-60"
          >
            {refreshing ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <RefreshCw size={18} />
            )}
            Tải lại
          </button>

          {publicPath && (
            <Link
              to={publicPath}
              target="_blank"
              className="inline-flex items-center justify-center gap-2 rounded-[10px] bg-neutral-950 px-4 py-3 text-sm font-bold text-white transition hover:bg-neutral-800"
            >
              <Eye size={18} />
              Xem menu
            </Link>
          )}

          <Link
            to="/admin/settings"
            className="inline-flex items-center justify-center gap-2 rounded-[10px] border border-neutral-200 bg-white px-4 py-3 text-sm font-bold text-neutral-700 transition hover:bg-neutral-50"
          >
            <Settings size={18} />
            Cài đặt
          </Link>
        </div>
      </div>

      {message && (
        <div className="mt-5 rounded-[10px] border border-green-100 bg-green-50 px-4 py-3 text-sm font-semibold text-green-700">
          {message}
        </div>
      )}

      {error && (
        <div className="mt-5 rounded-[10px] border border-red-100 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
          {error}
        </div>
      )}

      {!shop && <EmptyShopNotice />}

      {shop && !shop.isPublished && <UnpublishedNotice />}

      <section className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          icon={Folder}
          label="Danh mục"
          value={stats.categoryCount}
          highlight={`${stats.activeCategoryCount} đang hiện`}
          description="Nhóm món như cà phê, trà sữa, ăn vặt"
        />

        <StatCard
          icon={Soup}
          label="Tổng số món"
          value={stats.itemCount}
          highlight={`${stats.availableCount} còn bán`}
          description="Toàn bộ sản phẩm đang có trong menu"
        />

        <StatCard
          icon={Star}
          label="Món nổi bật"
          value={stats.featuredCount}
          highlight="Best seller"
          description="Các món được đẩy lên khu vực gợi ý"
        />

        <StatCard
          icon={Megaphone}
          label="Khuyến mãi"
          value={stats.promotionCount}
          highlight={`${stats.activePromotionCount} đang bật`}
          description="Banner ưu đãi hiển thị ở trang khách"
        />
      </section>

      <section className="mt-6 grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <PublicInfoCard
          shop={shop}
          publicMenuUrl={publicMenuUrl}
          onCopyUrl={handleCopyUrl}
        />

        <SetupChecklist checks={setupChecks} />
      </section>

      <section className="mt-6 grid gap-6 xl:grid-cols-[1fr_1fr]">
        <QuickActionsCard publicPath={publicPath} />

        <RecentItemsCard items={recentItems} />
      </section>
    </div>
  );
}

function EmptyShopNotice() {
  return (
    <div className="mt-6 rounded-[14px] border border-amber-200 bg-amber-50 p-5">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <AlertTriangle size={20} className="text-amber-700" />
            <h2 className="font-black text-amber-900">
              Bạn chưa tạo thông tin quán
            </h2>
          </div>

          <p className="mt-2 text-sm leading-6 text-amber-700">
            Vào phần cài đặt quán để nhập tên quán, slug, số điện thoại, ảnh bìa
            và bật public menu.
          </p>
        </div>

        <Link
          to="/admin/settings"
          className="inline-flex items-center justify-center gap-2 rounded-[10px] bg-amber-900 px-4 py-3 text-sm font-bold text-white"
        >
          Tạo thông tin quán
          <ArrowRight size={17} />
        </Link>
      </div>
    </div>
  );
}

function UnpublishedNotice() {
  return (
    <div className="mt-6 rounded-[14px] border border-orange-200 bg-orange-50 p-5">
      <div className="flex items-start gap-3">
        <div className="grid h-10 w-10 shrink-0 place-items-center rounded-[10px] bg-orange-100 text-orange-700">
          <EyeOff size={20} />
        </div>

        <div>
          <h2 className="font-black text-orange-900">Menu chưa public</h2>
          <p className="mt-1 text-sm leading-6 text-orange-700">
            Khách chưa thể xem menu. Vào phần cài đặt quán và bật trạng thái
            public khi bạn đã hoàn thiện thông tin.
          </p>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, highlight, description }) {
  return (
    <div className="rounded-[16px] border border-neutral-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-bold text-neutral-500">{label}</p>
          <p className="mt-2 text-4xl font-black tracking-tight">{value}</p>
        </div>

        <div className="grid h-12 w-12 place-items-center rounded-[12px] bg-neutral-950 text-white">
          <Icon size={22} />
        </div>
      </div>

      <p className="mt-4 inline-flex rounded-[8px] bg-neutral-100 px-3 py-1.5 text-xs font-black text-neutral-700">
        {highlight}
      </p>

      <p className="mt-3 text-sm leading-6 text-neutral-500">{description}</p>
    </div>
  );
}

function PublicInfoCard({ shop, publicMenuUrl, onCopyUrl }) {
  return (
    <section className="rounded-[16px] border border-neutral-200 bg-white p-5 shadow-sm">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
        <div>
          <p className="text-sm font-black uppercase tracking-[0.16em] text-neutral-400">
            Public
          </p>

          <h2 className="mt-1 text-xl font-black">Thông tin menu khách hàng</h2>

          <p className="mt-2 text-sm leading-6 text-neutral-500">
            Đây là thông tin khách sẽ thấy khi mở QR hoặc Google Maps link.
          </p>
        </div>

        {shop?.isPublished ? (
          <span className="inline-flex w-fit items-center gap-2 rounded-[10px] bg-green-50 px-3 py-2 text-xs font-black text-green-700">
            <CheckCircle2 size={15} />
            Đã public
          </span>
        ) : (
          <span className="inline-flex w-fit items-center gap-2 rounded-[10px] bg-neutral-100 px-3 py-2 text-xs font-black text-neutral-500">
            <EyeOff size={15} />
            Chưa public
          </span>
        )}
      </div>

      <div className="mt-5 grid gap-3 md:grid-cols-2">
        <InfoRow label="Tên quán" value={shop?.name || "Chưa nhập"} />
        <InfoRow label="Slug" value={shop?.slug || "Chưa nhập"} />
        <InfoRow label="Số điện thoại" value={shop?.phone || "Chưa nhập"} />
        <InfoRow label="Địa chỉ" value={shop?.address || "Chưa nhập"} />
      </div>

      <div className="mt-4 rounded-[12px] bg-neutral-50 p-4">
        <p className="text-sm font-bold text-neutral-500">Link menu</p>

        <div className="mt-2 flex flex-col gap-2 lg:flex-row lg:items-center">
          <p className="min-w-0 flex-1 break-all rounded-[10px] bg-white px-3 py-3 text-sm font-semibold text-neutral-700 ring-1 ring-neutral-200">
            {publicMenuUrl || "Chưa có link"}
          </p>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={onCopyUrl}
              disabled={!publicMenuUrl}
              className="inline-flex items-center justify-center gap-2 rounded-[10px] bg-neutral-950 px-4 py-3 text-sm font-bold text-white disabled:opacity-50"
            >
              <Copy size={16} />
              Copy
            </button>

            {publicMenuUrl && (
              <a
                href={publicMenuUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-[10px] border border-neutral-200 bg-white px-4 py-3 text-sm font-bold text-neutral-700"
              >
                <ExternalLink size={16} />
                Mở
              </a>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

function SetupChecklist({ checks }) {
  const doneCount = checks.filter((check) => check.done).length;
  const percent = Math.round((doneCount / checks.length) * 100);

  return (
    <section className="rounded-[16px] border border-neutral-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-black uppercase tracking-[0.16em] text-neutral-400">
            Setup
          </p>

          <h2 className="mt-1 text-xl font-black">Mức độ hoàn thiện</h2>

          <p className="mt-2 text-sm leading-6 text-neutral-500">
            Hoàn thiện các mục này để menu hoạt động tốt nhất.
          </p>
        </div>

        <div className="text-right">
          <p className="text-3xl font-black">{percent}%</p>
          <p className="text-xs font-bold text-neutral-400">
            {doneCount}/{checks.length} mục
          </p>
        </div>
      </div>

      <div className="mt-5 h-3 overflow-hidden rounded-full bg-neutral-100">
        <div
          className="h-full rounded-full bg-neutral-950 transition-all"
          style={{ width: `${percent}%` }}
        />
      </div>

      <div className="mt-5 space-y-3">
        {checks.map((check) => (
          <div
            key={check.label}
            className="flex items-start gap-3 rounded-[12px] bg-neutral-50 p-3"
          >
            <div
              className={`mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-[9px] ${
                check.done
                  ? "bg-green-100 text-green-700"
                  : "bg-orange-100 text-orange-700"
              }`}
            >
              {check.done ? (
                <CheckCircle2 size={17} />
              ) : (
                <AlertTriangle size={17} />
              )}
            </div>

            <div className="min-w-0">
              <p className="font-black">{check.label}</p>
              <p className="mt-0.5 text-sm text-neutral-500">
                {check.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function QuickActionsCard({ publicPath }) {
  const actions = [
    {
      to: "/admin/menu",
      title: "Quản lý menu",
      description: "Thêm/sửa món, danh mục, giá bán",
      icon: Soup,
    },
    {
      to: "/admin/promotions",
      title: "Khuyến mãi",
      description: "Banner, ảnh, video và ưu đãi",
      icon: Megaphone,
    },
    {
      to: "/admin/settings",
      title: "Cài đặt quán",
      description: "Logo, ảnh bìa, số điện thoại, bản đồ",
      icon: Settings,
    },
  ];

  return (
    <section className="rounded-[16px] border border-neutral-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-black uppercase tracking-[0.16em] text-neutral-400">
            Shortcut
          </p>
          <h2 className="mt-1 text-xl font-black">Thao tác nhanh</h2>
        </div>

        {publicPath && (
          <Link
            to={publicPath}
            target="_blank"
            className="inline-flex items-center gap-2 rounded-[10px] bg-neutral-950 px-3 py-2 text-xs font-black text-white"
          >
            Xem menu
            <ExternalLink size={14} />
          </Link>
        )}
      </div>

      <div className="mt-5 grid gap-3">
        {actions.map((action) => {
          const Icon = action.icon;

          return (
            <Link
              key={action.to}
              to={action.to}
              className="group flex items-center gap-4 rounded-[12px] border border-neutral-100 bg-neutral-50 p-4 transition hover:border-neutral-200 hover:bg-white hover:shadow-sm"
            >
              <div className="grid h-11 w-11 shrink-0 place-items-center rounded-[10px] bg-white text-neutral-700 ring-1 ring-neutral-200 group-hover:bg-neutral-950 group-hover:text-white">
                <Icon size={20} />
              </div>

              <div className="min-w-0 flex-1">
                <p className="font-black">{action.title}</p>
                <p className="mt-0.5 text-sm text-neutral-500">
                  {action.description}
                </p>
              </div>

              <ArrowRight
                size={18}
                className="text-neutral-400 transition group-hover:translate-x-1 group-hover:text-neutral-900"
              />
            </Link>
          );
        })}
      </div>
    </section>
  );
}

function RecentItemsCard({ items }) {
  return (
    <section className="rounded-[16px] border border-neutral-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-black uppercase tracking-[0.16em] text-neutral-400">
            Recent
          </p>

          <h2 className="mt-1 text-xl font-black">Một số món đang có</h2>

          <p className="mt-2 text-sm leading-6 text-neutral-500">
            Xem nhanh vài món đầu tiên theo thứ tự hiển thị.
          </p>
        </div>

        <Link
          to="/admin/menu"
          className="rounded-[10px] bg-neutral-100 px-3 py-2 text-xs font-black text-neutral-700"
        >
          Xem tất cả
        </Link>
      </div>

      <div className="mt-5 space-y-3">
        {items.length === 0 && (
          <div className="rounded-[12px] bg-neutral-50 p-5 text-center">
            <Soup className="mx-auto text-neutral-400" />
            <p className="mt-3 text-sm text-neutral-500">
              Chưa có món nào trong menu.
            </p>
          </div>
        )}

        {items.map((item) => (
          <div
            key={item.id}
            className="flex items-center gap-3 rounded-[12px] bg-neutral-50 p-3"
          >
            <div className="h-14 w-14 shrink-0 overflow-hidden rounded-[10px] bg-neutral-100">
              {item.imageUrl ? (
                <img
                  src={item.imageUrl}
                  alt={item.name}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="grid h-full w-full place-items-center text-neutral-400">
                  <Soup size={20} />
                </div>
              )}
            </div>

            <div className="min-w-0 flex-1">
              <p className="truncate font-black">{item.name}</p>

              <div className="mt-1 flex flex-wrap gap-2">
                <span className="text-sm font-bold text-neutral-700">
                  {formatPrice(item.price)}
                </span>

                <span
                  className={`rounded-[7px] px-2 py-0.5 text-[11px] font-black ${
                    item.isAvailable !== false
                      ? "bg-green-100 text-green-700"
                      : "bg-neutral-200 text-neutral-500"
                  }`}
                >
                  {item.isAvailable !== false ? "Còn bán" : "Tạm hết"}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function InfoRow({ label, value }) {
  return (
    <div className="rounded-[12px] bg-neutral-50 p-4">
      <p className="text-sm font-bold text-neutral-400">{label}</p>
      <p className="mt-1 break-words font-black text-neutral-800">{value}</p>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div>
      <div className="h-24 animate-pulse rounded-[16px] bg-white" />

      <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className="h-40 animate-pulse rounded-[16px] bg-white"
          />
        ))}
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-2">
        <div className="h-96 animate-pulse rounded-[16px] bg-white" />
        <div className="h-96 animate-pulse rounded-[16px] bg-white" />
      </div>
    </div>
  );
}