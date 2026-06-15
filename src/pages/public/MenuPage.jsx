import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import {
  ArrowRight,
  Coffee,
  MapPin,
  Menu,
  MessageCircle,
  Navigation,
  Phone,
  Search,
  Star,
  X,
} from "lucide-react";
import { useShopMenu } from "../../hooks/useShopMenu";

function cn(...classes) {
  return classes.filter(Boolean).join(" ");
}

function formatPrice(value) {
  return Number(value || 0).toLocaleString("vi-VN") + "đ";
}

function getPromotionMedia(promotion) {
  if (Array.isArray(promotion?.media) && promotion.media.length > 0) {
    return promotion.media;
  }

  if (promotion?.imageUrl) {
    return [
      {
        url: promotion.imageUrl,
        type: "image",
        name: promotion.title || "Khuyến mãi",
      },
    ];
  }

  return [];
}

export default function MenuPage() {
  const { shopSlug } = useParams();

  const {
    shop,
    categories = [],
    items = [],
    promotions = [],
    loading,
    error,
  } = useShopMenu(shopSlug);

  const [keyword, setKeyword] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [selectedPromotion, setSelectedPromotion] = useState(null);

  const visibleCategories = useMemo(() => {
    return categories.filter((category) => category.isActive !== false);
  }, [categories]);

  const availableItems = useMemo(() => {
    return items.sort((a, b) => Number(a.order || 0) - Number(b.order || 0));
  }, [items]);

  const featuredItems = useMemo(() => {
    return availableItems.filter((item) => item.isFeatured).slice(0, 8);
  }, [availableItems]);

  const filteredItems = useMemo(() => {
    const keywordLower = keyword.trim().toLowerCase();

    return availableItems.filter((item) => {
      const matchKeyword =
        !keywordLower ||
        item.name?.toLowerCase().includes(keywordLower) ||
        item.description?.toLowerCase().includes(keywordLower);

      const matchCategory =
        activeCategory === "all" || item.categoryId === activeCategory;

      return matchKeyword && matchCategory;
    });
  }, [availableItems, keyword, activeCategory]);

  const activeCategoryName = useMemo(() => {
    if (activeCategory === "all") return "Tất cả sản phẩm";

    return (
      visibleCategories.find((category) => category.id === activeCategory)
        ?.name || "Danh mục"
    );
  }, [activeCategory, visibleCategories]);

  if (loading) return <LoadingScreen />;

  if (error) {
    return (
      <main className="grid min-h-screen place-items-center bg-white px-4">
        <StateBox title="Có lỗi xảy ra" description={error} />
      </main>
    );
  }

  if (!shop) {
    return (
      <main className="grid min-h-screen place-items-center bg-white px-4">
        <StateBox
          title="Không tìm thấy menu"
          description="Menu chưa được public hoặc đường dẫn không đúng."
        />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-white text-[#2F221C]">
      <Header
        shop={shop}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
      />

      <Hero shop={shop} />

      <QuickActions shop={shop} />

      <PromotionBanners
        promotions={promotions}
        onOpenPromotion={setSelectedPromotion}
      />

      <section
        id="menu"
        className="mx-auto max-w-7xl px-4 pb-28 pt-8 sm:px-6 lg:px-8"
      >
        <MenuIntro shop={shop} totalItems={items.length} />

        <SearchCategoryBar
          keyword={keyword}
          setKeyword={setKeyword}
          categories={visibleCategories}
          activeCategory={activeCategory}
          setActiveCategory={setActiveCategory}
        />

        {featuredItems.length > 0 && activeCategory === "all" && !keyword && (
          <FeaturedSection items={featuredItems} />
        )}

        <div className="mt-8 flex flex-col gap-2 border-b border-[#EEE3D8] pb-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h3 className="text-2xl font-black tracking-tight sm:text-3xl">
              {activeCategoryName}
            </h3>

            <p className="mt-1 text-sm font-medium text-[#73584D]">
              {filteredItems.length} sản phẩm đang hiển thị
            </p>
          </div>

          <span className="inline-flex w-fit items-center gap-2 rounded-[5px] bg-[#E7F2F4] px-3 py-2 text-xs font-black uppercase tracking-[0.12em] text-[#4E8791]">
            <Coffee size={15} />
            Menu
          </span>
        </div>

        {filteredItems.length === 0 ? (
          <EmptyMenu keyword={keyword} />
        ) : (
          <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredItems.map((item, index) => (
              <ProductCard key={item.id} item={item} index={index} />
            ))}
          </div>
        )}
      </section>

      <ShopInfoSection shop={shop} />

      <PromotionModal
        promotion={selectedPromotion}
        onClose={() => setSelectedPromotion(null)}
      />

      <MobileBottomBar shop={shop} />
    </main>
  );
}

function Header({ shop, mobileOpen, setMobileOpen }) {
  return (
    <header className="fixed left-0 right-0 top-0 z-50 border-b border-[#EEE3D8] bg-white/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:h-20 lg:px-8">
        <a href="#" className="flex min-w-0 items-center gap-3">
          <div className="grid h-11 w-11 shrink-0 place-items-center overflow-hidden rounded-[8px] bg-[#F8F2EA] ring-1 ring-[#EEE3D8] lg:h-12 lg:w-12">
            {shop.logoUrl ? (
              <img
                src={shop.logoUrl}
                alt={shop.name}
                loading="eager"
                className="h-full w-full object-contain p-1"
              />
            ) : (
              <Coffee size={23} className="text-[#6B4B3E]" />
            )}
          </div>

          <div className="min-w-0">
            <p className="truncate text-xl font-black leading-none tracking-tight text-[#7CAEB8] lg:text-2xl">
              {shop.name || "Hớp"}
            </p>
            <p className="mt-1 truncate text-[11px] font-bold uppercase tracking-[0.14em] text-[#6B4B3E]/70">
              Coffee · Tea · Drinks
            </p>
          </div>
        </a>

        <nav className="hidden items-center gap-7 text-sm font-bold uppercase tracking-[0.12em] text-[#6B4B3E] lg:flex">
          <a href="#menu" className="transition hover:text-[#7CAEB8]">
            Menu
          </a>
          <a href="#promotions" className="transition hover:text-[#7CAEB8]">
            Khuyến mãi
          </a>
          <a href="#featured" className="transition hover:text-[#7CAEB8]">
            Nổi bật
          </a>
          <a href="#about" className="transition hover:text-[#7CAEB8]">
            Cửa hàng
          </a>
        </nav>

        <div className="hidden lg:block">
          {shop.phone && (
            <a
              href={`tel:${shop.phone}`}
              className="rounded-[5px] bg-[#6B4B3E] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#2F221C]"
            >
              Gọi quán
            </a>
          )}
        </div>

        <button
          type="button"
          onClick={() => setMobileOpen((prev) => !prev)}
          className="grid h-10 w-10 place-items-center rounded-[5px] bg-[#F8F2EA] text-[#6B4B3E] ring-1 ring-[#EEE3D8] lg:hidden"
        >
          {mobileOpen ? <X size={21} /> : <Menu size={21} />}
        </button>
      </div>

      {mobileOpen && (
        <div className="border-t border-[#EEE3D8] bg-white px-4 py-4 lg:hidden">
          <nav className="grid gap-2 text-sm font-bold uppercase tracking-[0.12em] text-[#6B4B3E]">
            {[
              ["#menu", "Menu"],
              ["#promotions", "Khuyến mãi"],
              ["#featured", "Món nổi bật"],
              ["#about", "Cửa hàng"],
            ].map(([href, label]) => (
              <a
                key={href}
                href={href}
                onClick={() => setMobileOpen(false)}
                className="rounded-[5px] bg-[#F8F2EA] px-4 py-3"
              >
                {label}
              </a>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}

function Hero({ shop }) {
  return (
    <section className="border-b border-[#EEE3D8] bg-white pt-16 lg:pt-20">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-8 sm:px-6 sm:py-12 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:px-8 lg:py-14">
        <div className="hop-reveal">
          <div className="inline-flex items-center gap-2 rounded-[5px] bg-[#F8F2EA] px-4 py-2 text-xs font-black uppercase tracking-[0.12em] text-[#6B4B3E] ring-1 ring-[#EEE3D8] sm:text-sm">
            <Coffee size={16} className="text-[#7CAEB8]" />
            Menu đồ uống online
          </div>

          <h1 className="mt-5 max-w-3xl text-5xl font-black leading-[0.98] tracking-[-0.05em] sm:text-6xl lg:text-7xl xl:text-8xl">
            {shop.name || "Hớp"}
            <span className="block text-[#7CAEB8]">coffee & drinks</span>
          </h1>

          <p className="mt-5 max-w-2xl text-base font-medium leading-8 text-[#73584D] sm:text-lg">
            {shop.description ||
              "Xem menu nhanh, rõ giá, dễ gọi quán và chỉ đường ngay trên điện thoại."}
          </p>

          <div className="mt-7 flex flex-col gap-3 sm:flex-row">
            <a
              href="#menu"
              className="inline-flex items-center justify-center gap-3 rounded-[5px] bg-[#6B4B3E] px-6 py-4 text-sm font-black uppercase tracking-[0.12em] text-white transition hover:bg-[#2F221C]"
            >
              Xem menu
              <ArrowRight size={18} />
            </a>

            {shop.googleMapUrl && (
              <a
                href={shop.googleMapUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center gap-3 rounded-[5px] bg-white px-6 py-4 text-sm font-black uppercase tracking-[0.12em] text-[#6B4B3E] ring-1 ring-[#EEE3D8] transition hover:bg-[#F8F2EA]"
              >
                Chỉ đường
                <Navigation size={18} />
              </a>
            )}
          </div>
        </div>

        <div className="hop-reveal">
          <div className="overflow-hidden rounded-[10px] border border-[#EEE3D8] bg-white shadow-sm">
            <div className="aspect-[4/3] bg-[#F8F2EA]">
              {shop.coverUrl ? (
                <img
                  src={shop.coverUrl}
                  alt={shop.name}
                  loading="eager"
                  className="h-full w-full object-cover"
                />
              ) : shop.logoUrl ? (
                <img
                  src={shop.logoUrl}
                  alt={shop.name}
                  loading="eager"
                  className="h-full w-full object-contain p-10"
                />
              ) : (
                <div className="grid h-full w-full place-items-center text-[#6B4B3E]">
                  <Coffee size={88} />
                </div>
              )}
            </div>

            <div className="flex flex-col gap-3 border-t border-[#EEE3D8] p-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.18em] text-[#7CAEB8]">
                  Fresh menu
                </p>
                <p className="mt-1 text-lg font-black">
                  Cập nhật món mỗi ngày
                </p>
              </div>

              <a
                href="#menu"
                className="inline-flex w-fit items-center gap-2 rounded-[5px] bg-[#F8F2EA] px-4 py-2 text-sm font-bold text-[#6B4B3E]"
              >
                Xem ngay
                <ArrowRight size={16} />
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function QuickActions({ shop }) {
  const actions = [
    {
      show: Boolean(shop.phone),
      href: `tel:${shop.phone}`,
      title: "Gọi quán",
      desc: shop.phone,
      icon: Phone,
    },
    {
      show: Boolean(shop.googleMapUrl),
      href: shop.googleMapUrl,
      title: "Chỉ đường",
      desc: "Google Maps",
      icon: MapPin,
    },
    {
      show: Boolean(shop.zaloUrl),
      href: shop.zaloUrl,
      title: "Nhắn Zalo",
      desc: "Tư vấn / đặt món",
      icon: MessageCircle,
    },
  ].filter((item) => item.show);

  if (actions.length === 0) return null;

  return (
    <section className="mx-auto max-w-7xl px-4 py-5 sm:px-6 lg:px-8">
      <div className="grid gap-3 sm:grid-cols-3">
        {actions.map((action, index) => {
          const Icon = action.icon;

          return (
            <a
              key={action.title}
              href={action.href}
              target={action.href?.startsWith("http") ? "_blank" : undefined}
              rel={action.href?.startsWith("http") ? "noreferrer" : undefined}
              style={{ animationDelay: `${index * 70}ms` }}
              className="hop-reveal flex items-center gap-4 rounded-[8px] border border-[#EEE3D8] bg-white p-4 transition hover:-translate-y-0.5 hover:shadow-md"
            >
              <div className="grid h-11 w-11 shrink-0 place-items-center rounded-[5px] bg-[#E7F2F4] text-[#4E8791]">
                <Icon size={21} />
              </div>

              <div className="min-w-0">
                <p className="font-black">{action.title}</p>
                <p className="mt-0.5 truncate text-sm font-medium text-[#73584D]">
                  {action.desc}
                </p>
              </div>
            </a>
          );
        })}
      </div>
    </section>
  );
}

function PromotionBanners({ promotions, onOpenPromotion }) {
  if (!promotions || promotions.length === 0) return null;

  return (
    <section
      id="promotions"
      className="mx-auto max-w-7xl px-4 py-5 sm:px-6 lg:px-8"
    >
      <SectionTitle
        eyebrow="Khuyến mãi"
        title="Ưu đãi đang diễn ra"
        description="Bấm vào banner để xem chi tiết chương trình."
      />

      <div className="hop-hide-scroll mt-4 flex gap-4 overflow-x-auto pb-3">
        {promotions.map((promotion, index) => {
          const mediaList = getPromotionMedia(promotion);
          const firstMedia = mediaList[0];

          return (
            <button
              key={promotion.id}
              type="button"
              onClick={() => onOpenPromotion(promotion)}
              style={{ animationDelay: `${index * 70}ms` }}
              className="hop-reveal w-[300px] shrink-0 overflow-hidden rounded-[10px] border border-[#EEE3D8] bg-white text-left transition hover:-translate-y-1 hover:shadow-lg sm:w-[460px]"
            >
              <PromotionMediaFrame media={firstMedia} mode="banner" />

              <div className="p-4">
                <h4 className="line-clamp-2 text-lg font-black">
                  {promotion.title}
                </h4>

                {promotion.subtitle && (
                  <p className="mt-1 line-clamp-2 text-sm font-medium leading-6 text-[#73584D]">
                    {promotion.subtitle}
                  </p>
                )}

                <div className="mt-4 flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center gap-2 rounded-[5px] bg-[#7CAEB8] px-4 py-2 text-sm font-black text-white">
                    {promotion.buttonText || "Xem chi tiết"}
                    <ArrowRight size={16} />
                  </span>

                  {mediaList.length > 1 && (
                    <span className="rounded-[5px] bg-[#F8F2EA] px-3 py-2 text-xs font-black text-[#6B4B3E]">
                      {mediaList.length} media
                    </span>
                  )}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
}

function MenuIntro({ shop, totalItems }) {
  return (
    <div className="mx-auto max-w-3xl text-center">
      <p className="text-sm font-black uppercase tracking-[0.22em] text-[#7CAEB8]">
        Menu Online
      </p>

      <h2 className="mt-2 text-3xl font-black tracking-tight sm:text-5xl">
        Thực đơn của {shop.name || "Hớp"}
      </h2>

      <p className="mt-3 text-base leading-7 text-[#73584D]">
        {totalItems} sản phẩm. Tìm món, lọc danh mục và xem trạng thái còn/hết
        nhanh chóng.
      </p>
    </div>
  );
}

function SearchCategoryBar({
  keyword,
  setKeyword,
  categories,
  activeCategory,
  setActiveCategory,
}) {
  return (
    <div className="sticky top-16 z-40 -mx-4 mt-7 border-y border-[#EEE3D8] bg-white/95 px-4 py-3 backdrop-blur sm:-mx-6 sm:px-6 lg:-mx-8 lg:top-20 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="relative">
          <Search
            size={20}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8A6B5F]"
          />

          <input
            value={keyword}
            onChange={(event) => setKeyword(event.target.value)}
            placeholder="Tìm trà, cà phê, nước ép, topping..."
            className="h-[52px] w-full rounded-[5px] bg-[#F8F2EA] pl-[48px] pr-12 text-sm font-bold text-[#2F221C] outline-none ring-1 ring-[#EEE3D8] transition focus:bg-white focus:ring-2 focus:ring-[#7CAEB8]"
          />

          {keyword && (
            <button
              type="button"
              onClick={() => setKeyword("")}
              className="absolute right-3 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-[5px] bg-white text-[#6B4B3E]"
            >
              <X size={16} />
            </button>
          )}
        </div>

        <div className="hop-hide-scroll mt-3 flex gap-2 overflow-x-auto pb-1">
          <CategoryChip
            label="Tất cả"
            active={activeCategory === "all"}
            onClick={() => setActiveCategory("all")}
          />

          {categories.map((category) => (
            <CategoryChip
              key={category.id}
              label={category.name}
              active={activeCategory === category.id}
              onClick={() => setActiveCategory(category.id)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function CategoryChip({ label, active, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "shrink-0 rounded-[5px] px-4 py-2.5 text-sm font-black transition active:scale-95",
        active
          ? "bg-[#6B4B3E] text-white"
          : "bg-[#F8F2EA] text-[#6B4B3E] ring-1 ring-[#EEE3D8] hover:bg-white"
      )}
    >
      {label}
    </button>
  );
}

function FeaturedSection({ items }) {
  return (
    <section id="featured" className="mt-9">
      <SectionTitle
        eyebrow="Best seller"
        title="Món nổi bật"
        description="Những món đang được gợi ý nhiều nhất."
      />

      <div className="hop-hide-scroll mt-4 flex gap-4 overflow-x-auto pb-3">
        {items.map((item, index) => (
          <ProductCard key={item.id} item={item} index={index} featured />
        ))}
      </div>
    </section>
  );
}

function ProductCard({ item, index, featured = false }) {
  const isUnavailable = item.isAvailable === false;
  const hasSale = Number(item.oldPrice || 0) > Number(item.price || 0);

  return (
    <article
      style={{ animationDelay: `${Math.min(index, 10) * 45}ms` }}
      className={cn(
        "hop-reveal group overflow-hidden rounded-[10px] border border-[#EEE3D8] bg-white transition hover:-translate-y-1 hover:shadow-lg",
        "grid grid-cols-[104px_1fr] sm:block",
        featured && "w-[280px] shrink-0 sm:w-[300px]",
        isUnavailable && "opacity-60 grayscale"
      )}
    >
      <div className="relative min-h-[132px] bg-[#F8F2EA] sm:aspect-[4/3] sm:min-h-0">
        {item.imageUrl ? (
          <img
            src={item.imageUrl}
            alt={item.name}
            loading="eager"
            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="grid h-full w-full place-items-center text-[#6B4B3E]">
            <Coffee size={40} />
          </div>
        )}

        <div className="absolute left-2 top-2 flex flex-wrap gap-1.5">
          {item.isFeatured && (
            <span className="inline-flex items-center gap-1 rounded-[5px] bg-[#7CAEB8] px-2 py-1 text-[10px] font-black uppercase text-white">
              <Star size={10} />
              Hot
            </span>
          )}

          {isUnavailable && (
            <span className="rounded-[5px] bg-[#2F221C] px-2 py-1 text-[10px] font-black uppercase text-white">
              Hết
            </span>
          )}
        </div>
      </div>

      <div className="flex min-w-0 flex-col p-3.5 sm:p-4">
        <div className="flex items-start justify-between gap-3">
          <h4 className="line-clamp-2 text-base font-black leading-snug sm:text-lg">
            {item.name}
          </h4>

          <p className="shrink-0 text-base font-black text-[#6B4B3E] sm:text-lg">
            {formatPrice(item.price)}
          </p>
        </div>

        {item.description && (
          <p className="mt-2 line-clamp-2 text-sm font-medium leading-6 text-[#73584D]">
            {item.description}
          </p>
        )}

        <div className="mt-auto flex flex-wrap items-center gap-2 pt-3">
          {hasSale && (
            <span className="rounded-[5px] bg-[#F8F2EA] px-2.5 py-1 text-xs font-bold text-[#8A6B5F] line-through">
              {formatPrice(item.oldPrice)}
            </span>
          )}

          <span
            className={cn(
              "rounded-[5px] px-2.5 py-1 text-xs font-bold",
              isUnavailable
                ? "bg-neutral-100 text-neutral-500"
                : "bg-[#E7F2F4] text-[#4E8791]"
            )}
          >
            {isUnavailable ? "Tạm hết" : "Còn bán"}
          </span>
        </div>
      </div>
    </article>
  );
}

function ShopInfoSection({ shop }) {
  return (
    <section
      id="about"
      className="mx-auto max-w-7xl px-4 pb-28 pt-2 sm:px-6 lg:px-8"
    >
      <div className="grid overflow-hidden rounded-[10px] border border-[#EEE3D8] bg-white lg:grid-cols-[1fr_0.8fr]">
        <div className="p-6 sm:p-8 lg:p-10">
          <p className="text-sm font-black uppercase tracking-[0.22em] text-[#7CAEB8]">
            Cửa hàng
          </p>

          <h2 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">
            {shop.name || "Hớp"}
          </h2>

          <p className="mt-4 max-w-xl text-base leading-8 text-[#73584D]">
            {shop.description ||
              "Menu online giúp khách xem sản phẩm nhanh hơn, rõ giá hơn và dễ liên hệ với quán khi cần đặt món hoặc tìm đường."}
          </p>

          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            {shop.phone && (
              <a
                href={`tel:${shop.phone}`}
                className="inline-flex items-center justify-center gap-2 rounded-[5px] bg-[#6B4B3E] px-5 py-3 text-sm font-black uppercase tracking-[0.12em] text-white"
              >
                <Phone size={18} />
                Gọi quán
              </a>
            )}

            {shop.googleMapUrl && (
              <a
                href={shop.googleMapUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-[5px] bg-[#F8F2EA] px-5 py-3 text-sm font-black uppercase tracking-[0.12em] text-[#6B4B3E] ring-1 ring-[#EEE3D8]"
              >
                <MapPin size={18} />
                Chỉ đường
              </a>
            )}
          </div>
        </div>

        <div className="min-h-[260px] bg-[#F8F2EA]">
          {shop.coverUrl ? (
            <img
              src={shop.coverUrl}
              alt={shop.name}
              loading="eager"
              className="h-full w-full object-cover"
            />
          ) : shop.logoUrl ? (
            <img
              src={shop.logoUrl}
              alt={shop.name}
              loading="eager"
              className="h-full w-full object-contain p-12"
            />
          ) : (
            <div className="grid h-full w-full place-items-center text-[#6B4B3E]">
              <Coffee size={96} />
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

function PromotionModal({ promotion, onClose }) {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    setActiveIndex(0);
  }, [promotion?.id]);

  if (!promotion) return null;

  const mediaList = getPromotionMedia(promotion);
  const activeMedia = mediaList[activeIndex] || mediaList[0];

  return (
    <div className="fixed inset-0 z-[100] grid place-items-center bg-black/55 px-4 py-6 backdrop-blur-sm">
      <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-[10px] bg-white shadow-2xl">
        <div className="relative bg-[#F8F2EA]">
          <PromotionMediaFrame media={activeMedia} mode="modal" />

          <button
            type="button"
            onClick={onClose}
            className="absolute right-4 top-4 grid h-10 w-10 place-items-center rounded-[5px] bg-white text-[#2F221C] shadow-lg"
          >
            <X size={20} />
          </button>
        </div>

        {mediaList.length > 1 && (
          <div className="hop-hide-scroll flex gap-3 overflow-x-auto border-b border-[#EEE3D8] bg-white p-4">
            {mediaList.map((media, index) => (
              <button
                key={`${media.url}-${index}`}
                type="button"
                onClick={() => setActiveIndex(index)}
                className={cn(
                  "h-20 w-28 shrink-0 overflow-hidden rounded-[5px] border bg-[#F8F2EA]",
                  activeIndex === index
                    ? "border-[#6B4B3E]"
                    : "border-[#EEE3D8]"
                )}
              >
                <PromotionMediaFrame media={media} mode="thumb" />
              </button>
            ))}
          </div>
        )}

        <div className="p-6 sm:p-8">
          <p className="text-sm font-black uppercase tracking-[0.22em] text-[#7CAEB8]">
            Chi tiết khuyến mãi
          </p>

          <h3 className="mt-3 text-3xl font-black tracking-tight">
            {promotion.title}
          </h3>

          {promotion.subtitle && (
            <p className="mt-3 text-base font-bold text-[#6B4B3E]">
              {promotion.subtitle}
            </p>
          )}

          {promotion.description && (
            <p className="mt-5 whitespace-pre-line text-base leading-8 text-[#73584D]">
              {promotion.description}
            </p>
          )}

          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            {promotion.startAt && (
              <InfoBox label="Bắt đầu" value={promotion.startAt} />
            )}

            {promotion.endAt && (
              <InfoBox label="Kết thúc" value={promotion.endAt} />
            )}
          </div>

          {promotion.terms && (
            <div className="mt-6 rounded-[5px] border border-[#EEE3D8] bg-[#FFFAF4] p-4">
              <p className="font-black">Điều kiện áp dụng</p>
              <p className="mt-2 whitespace-pre-line text-sm leading-6 text-[#73584D]">
                {promotion.terms}
              </p>
            </div>
          )}

          <button
            type="button"
            onClick={onClose}
            className="mt-7 w-full rounded-[5px] bg-[#6B4B3E] px-5 py-4 text-sm font-black uppercase tracking-[0.12em] text-white"
          >
            Đã hiểu
          </button>
        </div>
      </div>
    </div>
  );
}

function PromotionMediaFrame({ media, mode = "banner" }) {
  const wrapperClass =
    mode === "modal"
      ? "min-h-[240px] max-h-[70vh]"
      : mode === "thumb"
      ? "h-full"
      : "min-h-[170px] max-h-[340px]";

  const mediaClass =
    mode === "thumb"
      ? "h-full w-full object-contain"
      : mode === "modal"
      ? "max-h-[70vh] w-full object-contain"
      : "max-h-[340px] w-full object-contain";

  if (!media) {
    return (
      <div
        className={cn(
          "grid place-items-center bg-[#F8F2EA] text-[#4E8791]",
          wrapperClass
        )}
      >
        <Coffee size={mode === "thumb" ? 24 : 44} />
      </div>
    );
  }

  if (media.type === "video") {
    return (
      <div className={cn("grid place-items-center bg-black", wrapperClass)}>
        <video
          src={media.url}
          controls={mode === "modal"}
          muted={mode !== "modal"}
          playsInline
          preload="metadata"
          className={mediaClass}
        />
      </div>
    );
  }

  return (
    <div className={cn("grid place-items-center bg-[#F8F2EA]", wrapperClass)}>
      <img
        src={media.url}
        alt={media.name || "Khuyến mãi"}
        loading="eager"
        className={mediaClass}
      />
    </div>
  );
}

function MobileBottomBar({ shop }) {
  const actions = [
    {
      show: Boolean(shop.phone),
      href: `tel:${shop.phone}`,
      label: "Gọi",
      icon: Phone,
      className: "bg-[#6B4B3E] text-white",
    },
    {
      show: Boolean(shop.googleMapUrl),
      href: shop.googleMapUrl,
      label: "Map",
      icon: MapPin,
      className: "bg-[#7CAEB8] text-white",
    },
  ].filter((action) => action.show);

  if (actions.length === 0) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 rounded-[8px] border border-[#EEE3D8] bg-white/95 p-2 shadow-2xl backdrop-blur lg:hidden">
      <div
        className={cn(
          "grid gap-2",
          actions.length === 1 ? "grid-cols-1" : "grid-cols-2"
        )}
      >
        {actions.map((action) => {
          const Icon = action.icon;

          return (
            <a
              key={action.label}
              href={action.href}
              target={action.href?.startsWith("http") ? "_blank" : undefined}
              rel={action.href?.startsWith("http") ? "noreferrer" : undefined}
              className={cn(
                "inline-flex items-center justify-center gap-2 rounded-[5px] px-4 py-3 text-sm font-black",
                action.className
              )}
            >
              <Icon size={17} />
              {action.label}
            </a>
          );
        })}
      </div>
    </div>
  );
}

function SectionTitle({ eyebrow, title, description }) {
  return (
    <div className="max-w-3xl">
      <p className="text-sm font-black uppercase tracking-[0.22em] text-[#7CAEB8]">
        {eyebrow}
      </p>

      <h2 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">
        {title}
      </h2>

      {description && (
        <p className="mt-2 text-base leading-7 text-[#73584D]">
          {description}
        </p>
      )}
    </div>
  );
}

function InfoBox({ label, value }) {
  return (
    <div className="rounded-[5px] bg-[#F8F2EA] p-4">
      <p className="text-xs font-black uppercase tracking-[0.16em] text-[#7CAEB8]">
        {label}
      </p>
      <p className="mt-1 font-bold">{value}</p>
    </div>
  );
}

function EmptyMenu({ keyword }) {
  return (
    <div className="hop-reveal mt-8 rounded-[10px] border border-[#EEE3D8] bg-white p-10 text-center">
      <div className="mx-auto grid h-16 w-16 place-items-center rounded-[8px] bg-[#E7F2F4] text-[#4E8791]">
        <Search size={28} />
      </div>

      <h3 className="mt-5 text-2xl font-black">Không tìm thấy sản phẩm</h3>

      <p className="mt-2 font-medium text-[#73584D]">
        {keyword
          ? `Không có món nào khớp với “${keyword}”.`
          : "Danh mục này hiện chưa có món."}
      </p>
    </div>
  );
}

function StateBox({ title, description }) {
  return (
    <div className="max-w-md rounded-[10px] border border-[#EEE3D8] bg-white p-8 text-center shadow-xl">
      <div className="mx-auto grid h-16 w-16 place-items-center rounded-[8px] bg-[#E7F2F4] text-[#4E8791]">
        <Coffee size={30} />
      </div>

      <h1 className="mt-5 text-3xl font-black">{title}</h1>
      <p className="mt-2 font-medium text-[#73584D]">{description}</p>
    </div>
  );
}

function LoadingScreen() {
  return (
    <main className="min-h-screen bg-white px-4 py-24">
      <div className="mx-auto max-w-7xl">
        <div className="h-[420px] animate-pulse rounded-[10px] bg-[#F8F2EA]" />

        <div className="mt-6 grid gap-3 md:grid-cols-3">
          <div className="h-24 animate-pulse rounded-[10px] bg-[#F8F2EA]" />
          <div className="h-24 animate-pulse rounded-[10px] bg-[#F8F2EA]" />
          <div className="h-24 animate-pulse rounded-[10px] bg-[#F8F2EA]" />
        </div>

        <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, index) => (
            <div
              key={index}
              className="h-72 animate-pulse rounded-[10px] bg-[#F8F2EA]"
            />
          ))}
        </div>
      </div>
    </main>
  );
}