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
  Newspaper,
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
import { getPosts } from "../../services/postService";

function formatPrice(value) {
  return Number(value || 0).toLocaleString("vi-VN") + "đ";
}

function getPublicMenuUrl(shop) {
  if (!shop?.slug) return "";
  return `${window.location.origin}/${shop.slug}`;
}

function getItemImageUrl(item) {
  if (item.imageUrl) return item.imageUrl;

  if (Array.isArray(item.images) && item.images.length > 0) {
    const firstImage = item.images[0];

    if (typeof firstImage === "string") return firstImage;

    return firstImage?.url || "";
  }

  return "";
}

export default function DashboardPage() {
  const [shop, setShop] = useState(null);
  const [categories, setCategories] = useState([]);
  const [items, setItems] = useState([]);
  const [promotions, setPromotions] = useState([]);
  const [posts, setPosts] = useState([]);

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
    const activePosts = posts.filter(
      (post) => post.isActive !== false
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
      postCount: posts.length,
      activePostCount: activePosts.length,
    };
  }, [categories, items, promotions, posts]);

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

      const [shopData, categoriesData, itemsData, promotionsData, postsData] =
        await Promise.all([
          getShopById(DEFAULT_SHOP_ID),
          getCategories(DEFAULT_SHOP_ID),
          getItems(DEFAULT_SHOP_ID),
          getPromotions(DEFAULT_SHOP_ID).catch(() => []),
          getPosts(DEFAULT_SHOP_ID).catch(() => []),
        ]);

      setShop(shopData);
      setCategories(categoriesData);
      setItems(itemsData);
      setPromotions(promotionsData);
      setPosts(postsData);
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
    <div className="space-y-5 sm:space-y-6">
      <section className="rounded-[12px] border border-neutral-200 bg-white p-4 shadow-sm sm:p-5">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
          <div className="min-w-0">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-neutral-400 sm:text-sm">
              Dashboard
            </p>

            <h1 className="mt-1 text-2xl font-black tracking-tight text-neutral-950 sm:text-3xl">
              Tổng quan menu
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-neutral-500">
              Theo dõi nhanh trạng thái menu, số lượng món, danh mục, khuyến mãi
              và các bước cần hoàn thiện trước khi public cho khách.
            </p>
          </div>

          <div className="grid gap-2 min-[430px]:grid-cols-3 xl:flex xl:shrink-0">
            <button
              type="button"
              onClick={() => loadDashboard({ silent: true })}
              disabled={refreshing}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-[8px] border border-neutral-200 bg-white px-4 text-sm font-black text-neutral-700 transition hover:bg-neutral-50 disabled:opacity-60"
            >
              {refreshing ? (
                <Loader2 size={17} className="animate-spin" />
              ) : (
                <RefreshCw size={17} />
              )}
              Tải lại
            </button>

            {publicPath && (
              <Link
                to={publicPath}
                target="_blank"
                className="inline-flex h-11 items-center justify-center gap-2 rounded-[8px] bg-neutral-950 px-4 text-sm font-black !text-white transition hover:bg-neutral-800 hover:!text-white"
              >
                <Eye size={17} className="text-white" />
                <span className="text-white">Xem menu</span>
              </Link>
            )}

            <Link
              to="/admin/settings"
              className="inline-flex h-11 items-center justify-center gap-2 rounded-[8px] border border-neutral-200 bg-white px-4 text-sm font-black text-neutral-700 transition hover:bg-neutral-50"
            >
              <Settings size={17} />
              Cài đặt
            </Link>
          </div>
        </div>
      </section>

      {message && (
        <NoticeBox type="success" message={message} />
      )}

      {error && (
        <NoticeBox type="error" message={error} />
      )}

      {!shop && <EmptyShopNotice />}

      {shop && !shop.isPublished && <UnpublishedNotice />}

      <section className="grid grid-cols-2 gap-3 lg:grid-cols-3 xl:grid-cols-5">
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
          description={`${stats.unavailableCount} món tạm hết`}
        />

        <StatCard
          icon={Star}
          label="Nổi bật"
          value={stats.featuredCount}
          highlight="Best seller"
          description="Các món được đẩy lên khu vực gợi ý"
        />

        <StatCard
          icon={Megaphone}
          label="Khuyến mãi"
          value={stats.promotionCount}
          highlight={`${stats.activePromotionCount} đang bật`}
          description="Banner ưu đãi ở trang khách"
        />

        <StatCard
          icon={Newspaper}
          label="Bản tin"
          value={stats.postCount}
          highlight={`${stats.activePostCount} đang bật`}
          description="Bài viết hiển thị trên blog"
        />
      </section>

      <section className="grid gap-5 xl:grid-cols-[1.1fr_0.9fr]">
        <PublicInfoCard
          shop={shop}
          publicMenuUrl={publicMenuUrl}
          onCopyUrl={handleCopyUrl}
        />

        <SetupChecklist checks={setupChecks} />
      </section>

      <section className="grid gap-5 xl:grid-cols-[1fr_1fr]">
        <QuickActionsCard publicPath={publicPath} />

        <RecentItemsCard items={recentItems} />
      </section>
    </div>
  );
}

function NoticeBox({ type, message }) {
  const isSuccess = type === "success";

  return (
    <div
      className={`rounded-[10px] border px-4 py-3 text-sm font-bold ${
        isSuccess
          ? "border-green-100 bg-green-50 text-green-700"
          : "border-red-100 bg-red-50 text-red-700"
      }`}
    >
      {message}
    </div>
  );
}

function EmptyShopNotice() {
  return (
    <div className="rounded-[12px] border border-amber-200 bg-amber-50 p-4 sm:p-5">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <AlertTriangle size={20} className="shrink-0 text-amber-700" />
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
          className="inline-flex h-11 items-center justify-center gap-2 rounded-[8px] bg-amber-900 px-4 text-sm font-black text-white"
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
    <div className="rounded-[12px] border border-orange-200 bg-orange-50 p-4 sm:p-5">
      <div className="flex items-start gap-3">
        <div className="grid h-10 w-10 shrink-0 place-items-center rounded-[8px] bg-orange-100 text-orange-700">
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
    <div className="rounded-[12px] border border-neutral-200 bg-white p-3 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md sm:p-5">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="line-clamp-1 text-xs font-black uppercase tracking-[0.08em] text-neutral-400 sm:text-sm sm:tracking-normal">
            {label}
          </p>

          <p className="mt-2 text-3xl font-black tracking-tight text-neutral-950 sm:text-4xl">
            {value}
          </p>
        </div>

        <div className="grid h-10 w-10 shrink-0 place-items-center rounded-[10px] bg-neutral-950 text-white sm:h-12 sm:w-12">
          <Icon size={20} />
        </div>
      </div>

      <p className="mt-3 inline-flex rounded-[7px] bg-neutral-100 px-2.5 py-1 text-[11px] font-black text-neutral-700 sm:px-3 sm:py-1.5 sm:text-xs">
        {highlight}
      </p>

      <p className="mt-2 line-clamp-2 text-xs leading-5 text-neutral-500 sm:mt-3 sm:text-sm sm:leading-6">
        {description}
      </p>
    </div>
  );
}

function PublicInfoCard({ shop, publicMenuUrl, onCopyUrl }) {
  return (
    <section className="rounded-[12px] border border-neutral-200 bg-white p-4 shadow-sm sm:p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.16em] text-neutral-400 sm:text-sm">
            Public
          </p>

          <h2 className="mt-1 text-xl font-black text-neutral-950">
            Thông tin menu khách hàng
          </h2>

          <p className="mt-2 text-sm leading-6 text-neutral-500">
            Đây là thông tin khách sẽ thấy khi mở QR hoặc Google Maps link.
          </p>
        </div>

        {shop?.isPublished ? (
          <StatusBadge
            icon={CheckCircle2}
            label="Đã public"
            className="bg-green-50 text-green-700"
          />
        ) : (
          <StatusBadge
            icon={EyeOff}
            label="Chưa public"
            className="bg-neutral-100 text-neutral-500"
          />
        )}
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <InfoRow label="Tên quán" value={shop?.name || "Chưa nhập"} />
        <InfoRow label="Slug" value={shop?.slug || "Chưa nhập"} />
        <InfoRow
          label="Số điện thoại"
          value={shop?.phone || "Chưa nhập"}
          icon={Phone}
        />
        <InfoRow
          label="Địa chỉ"
          value={shop?.address || "Chưa nhập"}
          icon={MapPin}
        />
      </div>

      <div className="mt-4 rounded-[12px] border border-neutral-200 bg-neutral-50 p-3 sm:p-4">
        <p className="text-sm font-black text-neutral-600">Link menu</p>

        <div className="mt-2 grid gap-2 lg:grid-cols-[1fr_auto] lg:items-center">
          <p className="min-w-0 break-all rounded-[8px] bg-white px-3 py-3 text-sm font-bold text-neutral-700 ring-1 ring-neutral-200">
            {publicMenuUrl || "Chưa có link"}
          </p>

          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={onCopyUrl}
              disabled={!publicMenuUrl}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-[8px] bg-neutral-950 px-4 text-sm font-black text-white transition hover:bg-neutral-800 disabled:opacity-50"
            >
              <Copy size={16} />
              Copy
            </button>

            {publicMenuUrl && (
              <a
                href={publicMenuUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex h-11 items-center justify-center gap-2 rounded-[8px] border border-neutral-200 bg-white px-4 text-sm font-black text-neutral-700 transition hover:bg-neutral-50"
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

function StatusBadge({ icon: Icon, label, className }) {
  return (
    <span
      className={`inline-flex w-fit items-center gap-2 rounded-[8px] px-3 py-2 text-xs font-black ${className}`}
    >
      <Icon size={15} />
      {label}
    </span>
  );
}

function SetupChecklist({ checks }) {
  const doneCount = checks.filter((check) => check.done).length;
  const percent = Math.round((doneCount / checks.length) * 100);

  return (
    <section className="rounded-[12px] border border-neutral-200 bg-white p-4 shadow-sm sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.16em] text-neutral-400 sm:text-sm">
            Setup
          </p>

          <h2 className="mt-1 text-xl font-black text-neutral-950">
            Mức độ hoàn thiện
          </h2>

          <p className="mt-2 text-sm leading-6 text-neutral-500">
            Hoàn thiện các mục này để menu hoạt động tốt nhất.
          </p>
        </div>

        <div className="shrink-0 text-right">
          <p className="text-3xl font-black text-neutral-950">{percent}%</p>
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
            className="flex items-start gap-3 rounded-[10px] border border-neutral-100 bg-neutral-50 p-3"
          >
            <div
              className={`mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-[8px] ${
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
              <p className="font-black text-neutral-950">{check.label}</p>
              <p className="mt-0.5 break-words text-sm leading-6 text-neutral-500">
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
      to: "/admin/posts",
      title: "Bản tin quán",
      description: "Đăng bài viết, thông báo mới",
      icon: Newspaper,
    },
    {
      to: "/admin/settings",
      title: "Cài đặt quán",
      description: "Logo, ảnh bìa, số điện thoại, bản đồ",
      icon: Settings,
    },
  ];

  return (
    <section className="rounded-[12px] border border-neutral-200 bg-white p-4 shadow-sm sm:p-5">
      <div className="flex flex-col gap-3 min-[430px]:flex-row min-[430px]:items-start min-[430px]:justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.16em] text-neutral-400 sm:text-sm">
            Shortcut
          </p>

          <h2 className="mt-1 text-xl font-black text-neutral-950">
            Thao tác nhanh
          </h2>
        </div>

        {publicPath && (
        <Link
          to={publicPath}
          target="_blank"
          className="inline-flex h-10 items-center justify-center gap-2 rounded-[8px] bg-neutral-950 px-3 text-xs font-black !text-white transition hover:bg-neutral-800 hover:!text-white"
        >
          <span className="text-white">Xem menu</span>
          <ExternalLink size={14} className="text-white" />
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
              className="group flex items-center gap-3 rounded-[10px] border border-neutral-100 bg-neutral-50 p-3 transition hover:border-neutral-200 hover:bg-white hover:shadow-sm sm:gap-4 sm:p-4"
            >
              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-[9px] bg-white text-neutral-700 ring-1 ring-neutral-200 group-hover:bg-neutral-950 group-hover:text-white sm:h-11 sm:w-11">
                <Icon size={19} />
              </div>

              <div className="min-w-0 flex-1">
                <p className="font-black text-neutral-950">{action.title}</p>
                <p className="mt-0.5 line-clamp-2 text-sm leading-6 text-neutral-500">
                  {action.description}
                </p>
              </div>

              <ArrowRight
                size={18}
                className="shrink-0 text-neutral-400 transition group-hover:translate-x-1 group-hover:text-neutral-900"
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
    <section className="rounded-[12px] border border-neutral-200 bg-white p-4 shadow-sm sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.16em] text-neutral-400 sm:text-sm">
            Recent
          </p>

          <h2 className="mt-1 text-xl font-black text-neutral-950">
            Một số món đang có
          </h2>

          <p className="mt-2 text-sm leading-6 text-neutral-500">
            Xem nhanh vài món đầu tiên theo thứ tự hiển thị.
          </p>
        </div>

        <Link
          to="/admin/menu"
          className="inline-flex h-10 shrink-0 items-center rounded-[8px] bg-neutral-100 px-3 text-xs font-black text-neutral-700 transition hover:bg-neutral-200"
        >
          Xem tất cả
        </Link>
      </div>

      <div className="mt-5 space-y-3">
        {items.length === 0 && (
          <div className="rounded-[10px] border border-dashed border-neutral-200 bg-neutral-50 p-6 text-center">
            <Soup className="mx-auto text-neutral-400" />
            <p className="mt-3 text-sm text-neutral-500">
              Chưa có món nào trong menu.
            </p>
          </div>
        )}

        {items.map((item) => {
          const imageUrl = getItemImageUrl(item);

          return (
            <div
              key={item.id}
              className="grid grid-cols-[64px_1fr] gap-3 rounded-[10px] border border-neutral-100 bg-neutral-50 p-3"
            >
              <div className="h-16 w-16 overflow-hidden rounded-[9px] bg-neutral-100">
                {imageUrl ? (
                  <img
                    src={imageUrl}
                    alt={item.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="grid h-full w-full place-items-center text-neutral-400">
                    <Soup size={20} />
                  </div>
                )}
              </div>

              <div className="min-w-0">
                <p className="line-clamp-1 font-black text-neutral-950">
                  {item.name}
                </p>

                <div className="mt-1 flex flex-wrap gap-2">
                  <span className="text-sm font-black text-neutral-800">
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

                  {item.isFeatured && (
                    <span className="rounded-[7px] bg-amber-100 px-2 py-0.5 text-[11px] font-black text-amber-700">
                      Nổi bật
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function InfoRow({ label, value, icon: Icon }) {
  return (
    <div className="rounded-[10px] border border-neutral-100 bg-neutral-50 p-3 sm:p-4">
      <div className="flex items-center gap-2">
        {Icon && <Icon size={15} className="shrink-0 text-neutral-400" />}

        <p className="text-xs font-black uppercase tracking-[0.08em] text-neutral-400 sm:text-sm sm:tracking-normal">
          {label}
        </p>
      </div>

      <p className="mt-1 break-words font-black text-neutral-800">{value}</p>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-5 sm:space-y-6">
      <div className="h-36 animate-pulse rounded-[12px] bg-white" />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-3 xl:grid-cols-5">
        {Array.from({ length: 5 }).map((_, index) => (
          <div
            key={index}
            className="h-36 animate-pulse rounded-[12px] bg-white"
          />
        ))}
      </div>

      <div className="grid gap-5 xl:grid-cols-2">
        <div className="h-96 animate-pulse rounded-[12px] bg-white" />
        <div className="h-96 animate-pulse rounded-[12px] bg-white" />
      </div>
    </div>
  );
}