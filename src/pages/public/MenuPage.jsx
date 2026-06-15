import { useMemo, useState } from "react";
import { useParams } from "react-router-dom";

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
      <MenuHeader
        shop={shop}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
      />

      <HeroBanner shop={shop} totalItems={items.length} />

      <QuickActions shop={shop} />

      <PromotionStrip
        promotions={promotions}
        onOpenPromotion={setSelectedPromotion}
      />

      {activeCategory === "all" && !keyword.trim() && (
        <FeaturedProducts items={featuredItems} shop={shop} />
      )}

      <section
        id="menu"
        className="mx-auto max-w-7xl px-4 pb-10 pt-4 sm:px-6 lg:px-8"
      >
        <div className="mb-5 flex flex-col justify-between gap-3 border-b border-[#EEE3D8] pb-5 lg:flex-row lg:items-end">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.18em] text-[#7CAEB8]">
              Danh sách sản phẩm
            </p>

            <h2 className="mt-1 text-3xl font-black tracking-tight text-[#2F221C] sm:text-4xl">
              {activeCategoryName}
            </h2>

            <p className="mt-2 text-sm font-medium text-[#73584D]">
              Đang hiển thị {filteredItems.length}/{items.length} sản phẩm.
            </p>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
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

            <div className="mt-5">
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
    </main>
  );
}