import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ChevronLeft, Newspaper } from "lucide-react";

import { useShopMenu } from "../../hooks/useShopMenu";

import MenuHeader from "../../components/public/menu/MenuHeader";
import ShopFooter from "../../components/public/menu/ShopFooter";
import BlogSection from "../../components/public/menu/BlogSection";
import { LoadingScreen, StateBox } from "../../components/public/menu/MenuStates";

export default function BlogPage() {
  const { shopSlug } = useParams();

  const { shop, posts = [], loading, error } = useShopMenu(shopSlug);
  const [mobileOpen, setMobileOpen] = useState(false);

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
          title="Không tìm thấy cửa hàng"
          description="Cửa hàng chưa được public hoặc đường dẫn không đúng."
        />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-white text-[#2F221C] selection:bg-[#7CAEB8]/30">
      <MenuHeader
        shop={shop}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
      />

      <section className="relative overflow-hidden border-b border-neutral-200 bg-white pt-16 lg:pt-20">
        <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_top_left,rgba(124,174,184,0.18),transparent_38%),radial-gradient(circle_at_top_right,rgba(201,165,141,0.22),transparent_34%)]" />

        <div className="relative mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8 lg:py-12">
          <Link
            to={`/${shop.slug}`}
            className="inline-flex items-center gap-1.5 rounded-[8px] border border-neutral-200 bg-white px-4 py-2.5 text-xs font-black uppercase tracking-[0.1em] text-[#6B4B3E] shadow-sm transition hover:bg-neutral-50 hover:text-[#2F221C]"
          >
            <ChevronLeft size={16} />
            Xem thực đơn
          </Link>

          <div className="mt-6 max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#7CAEB8]/25 bg-[#7CAEB8]/10 px-3 py-1.5 text-xs font-black uppercase tracking-[0.14em] text-[#5C929B]">
              <Newspaper size={14} />
              Tin mới từ quán
            </div>

            <h1 className="mt-4 text-4xl font-black leading-tight tracking-tight text-[#2F221C] sm:text-5xl lg:text-6xl">
              Blog & cập nhật mới nhất
            </h1>

            <p className="mt-4 max-w-2xl text-sm font-medium leading-7 text-[#73584D] sm:text-base sm:leading-8">
              Theo dõi các bài đăng mới, món mới, ưu đãi và hoạt động mới nhất
              từ {shop.name || "quán"}.
            </p>
          </div>
        </div>
      </section>

      <BlogSection posts={posts} shop={shop} />

      <ShopFooter shop={shop} />
    </main>
  );
}