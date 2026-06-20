import { useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { CalendarCheck } from "lucide-react";

import { useShopMenu } from "../../hooks/useShopMenu";

import CategorySidebar from "../../components/public/menu/CategorySidebar";
import FeaturedProducts from "../../components/public/menu/FeaturedProducts";
import HeroBanner from "../../components/public/menu/HeroBanner";
import MenuHeader from "../../components/public/menu/MenuHeader";
import MenuToolbar from "../../components/public/menu/MenuToolbar";
import ProductGrid from "../../components/public/menu/ProductGrid";
import PromotionModal from "../../components/public/menu/PromotionModal";
import PromotionStrip from "../../components/public/menu/PromotionStrip";
import QuickActions from "../../components/public/menu/QuickActions";
import ReservationModal from "../../components/public/menu/ReservationModal";
import ShopFooter from "../../components/public/menu/ShopFooter";
import {
  LoadingScreen,
  StateBox,
} from "../../components/public/menu/MenuStates";

import {
  getCategoryCountMap,
  sortMenuItems,
} from "../../components/public/menu/publicMenuUtils";

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
  const [sortMode, setSortMode] = useState("default");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [selectedPromotion, setSelectedPromotion] = useState(null);
  const [reservationOpen, setReservationOpen] = useState(false);

  const visibleCategories = useMemo(() => {
    return categories.filter((category) => category.isActive !== false);
  }, [categories]);

  const sortedItems = useMemo(() => {
    return sortMenuItems(items, sortMode);
  }, [items, sortMode]);

  const categoryCountMap = useMemo(() => {
    return getCategoryCountMap(items);
  }, [items]);

  const featuredItems = useMemo(() => {
    return items
      .filter((item) => item.isFeatured === true)
      .sort((a, b) => Number(a.order || 0) - Number(b.order || 0))
      .slice(0, 10);
  }, [items]);

  const filteredItems = useMemo(() => {
    const keywordLower = keyword.trim().toLowerCase();

    return sortedItems.filter((item) => {
      const tagsText = Array.isArray(item.tags)
        ? item.tags.join(" ").toLowerCase()
        : "";

      const matchKeyword =
        !keywordLower ||
        item.name?.toLowerCase().includes(keywordLower) ||
        item.description?.toLowerCase().includes(keywordLower) ||
        tagsText.includes(keywordLower);

      const matchCategory =
        activeCategory === "all" || item.categoryId === activeCategory;

      return matchKeyword && matchCategory;
    });
  }, [sortedItems, keyword, activeCategory]);

  const activeCategoryName = useMemo(() => {
    if (activeCategory === "all") return "Tất cả sản phẩm";

    return (
      visibleCategories.find((category) => category.id === activeCategory)
        ?.name || "Danh mục"
    );
  }, [activeCategory, visibleCategories]);

  const shouldShowFeatured = activeCategory === "all" && !keyword.trim();

  if (loading) return <LoadingScreen />;

  if (error) {
    return (
      <main className="grid min-h-[100dvh] place-items-center bg-white px-4">
        <StateBox title="Có lỗi xảy ra" description={error} />
      </main>
    );
  }

  if (!shop) {
    return (
      <main className="grid min-h-[100dvh] place-items-center bg-white px-4">
        <StateBox
          title="Không tìm thấy menu"
          description="Menu chưa được public hoặc đường dẫn không đúng."
        />
      </main>
    );
  }

  return (
    <main className="min-h-[100dvh] overflow-x-hidden bg-white text-[#2F221C]">
      <MenuHeader
        shop={shop}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
        onOpenReservation={() => setReservationOpen(true)}
      />

      <HeroBanner shop={shop} totalItems={items.length} />

      <QuickActions shop={shop} />

      <ReservationCallout
        shop={shop}
        onOpen={() => setReservationOpen(true)}
      />

      <PromotionStrip
        promotions={promotions}
        onOpenPromotion={setSelectedPromotion}
      />

      {shouldShowFeatured && (
        <FeaturedProducts items={featuredItems} shop={shop} />
      )}

      <section
        id="menu"
        className="mx-auto max-w-7xl scroll-mt-24 px-3 pb-8 pt-3 sm:px-6 sm:pb-10 sm:pt-4 lg:px-8 lg:pb-12"
      >
        <div className="mb-3 border-b border-[#EEE3D8] pb-3 sm:mb-5 sm:pb-5 lg:flex lg:items-end lg:justify-between lg:gap-5">
          <div className="min-w-0">
            <p className="text-[11px] font-black uppercase tracking-[0.16em] text-[#7CAEB8] sm:text-sm sm:tracking-[0.18em]">
              Danh sách sản phẩm
            </p>

            <h2 className="mt-1 line-clamp-2 text-2xl font-black tracking-tight text-[#2F221C] sm:text-3xl lg:text-4xl">
              {activeCategoryName}
            </h2>

            <p className="mt-1.5 text-sm font-medium leading-6 text-[#73584D]">
              Đang hiển thị{" "}
              <span className="font-black text-[#2F221C]">
                {filteredItems.length}
              </span>
              /{items.length} sản phẩm.
            </p>
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-[240px_minmax(0,1fr)] xl:grid-cols-[260px_minmax(0,1fr)]">
          <CategorySidebar
            categories={visibleCategories}
            activeCategory={activeCategory}
            setActiveCategory={setActiveCategory}
            countMap={categoryCountMap}
            totalItems={items.length}
          />

          <div className="min-w-0">
            <MenuToolbar
              keyword={keyword}
              setKeyword={setKeyword}
              sortMode={sortMode}
              setSortMode={setSortMode}
              categories={visibleCategories}
              activeCategory={activeCategory}
              setActiveCategory={setActiveCategory}
            />

            <div className="mt-3 sm:mt-5">
              <ProductGrid
                items={filteredItems}
                shop={shop}
                emptyText={
                  keyword.trim()
                    ? `Không có món nào khớp với “${keyword}”.`
                    : "Danh mục này hiện chưa có món."
                }
              />
            </div>
          </div>
        </div>
      </section>

      <ShopFooter shop={shop} />

      <PromotionModal
        promotion={selectedPromotion}
        onClose={() => setSelectedPromotion(null)}
      />

      <ReservationModal
        open={reservationOpen}
        shop={shop}
        onClose={() => setReservationOpen(false)}
      />
    </main>
  );
}

function ReservationCallout({ shop, onOpen }) {
  return (
    <section className="bg-white">
      <div className="mx-auto max-w-7xl px-3 py-3 sm:px-6 lg:px-8">
        <div className="overflow-hidden rounded-[14px] border border-[#EEE3D8] bg-[#F8F2EA] shadow-sm">
          <div className="flex flex-col gap-3 p-3 sm:flex-row sm:items-center sm:justify-between sm:p-4 lg:p-5">
            <div className="min-w-0">
              <p className="text-[11px] font-black uppercase tracking-[0.16em] text-[#7CAEB8] sm:text-xs">
                Đặt lịch trước
              </p>

              <h2 className="mt-1 text-base font-black leading-6 text-[#2F221C] sm:text-xl">
                Đặt bàn / đặt lịch tại {shop?.name || "quán"}
              </h2>

              <p className="mt-1 max-w-2xl text-sm font-medium leading-6 text-[#73584D]">
                Chọn số lượng người, ngày giờ và để lại số điện thoại để quán
                liên hệ xác nhận.
              </p>
            </div>

            <button
              type="button"
              onClick={onOpen}
              className="inline-flex min-h-11 w-full shrink-0 items-center justify-center gap-2 rounded-[10px] bg-[#2F221C] px-5 py-3 text-sm font-black !text-white transition hover:bg-[#6B4B3E] active:scale-[0.98] sm:w-auto"
            >
              <CalendarCheck size={17} className="text-white" />
              <span className="text-white">Đặt lịch ngay</span>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}