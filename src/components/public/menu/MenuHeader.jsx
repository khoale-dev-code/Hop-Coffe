import {
  Coffee,
  MapPin,
  Menu,
  Phone,
  ShoppingBag,
  Tag,
  X,
  Newspaper,
} from "lucide-react";
import { Link } from "react-router-dom"; // Import Link

export default function MenuHeader({ shop, mobileOpen, setMobileOpen }) {
  const shopName = shop?.name || "Hớp";
  const logoUrl = shop?.logoUrl || "";
  const phone = shop?.phone || "";
  const googleMapUrl = shop?.googleMapUrl || "";
  
  const shopPath = shop?.slug ? `/${shop.slug}` : "";

  // Thay đổi href thành các path tuyệt đối (từ gốc của shop)
  const navItems = [
    {
      href: `${shopPath}#menu`, 
      label: "Sản phẩm",
      icon: ShoppingBag,
    },
    {
      href: `${shopPath}#promotions`,
      label: "Khuyến mãi",
      icon: Tag,
    },
    {
      href: `${shopPath}/blog`, // Dẫn thẳng sang trang blog
      label: "Bản tin",
      icon: Newspaper,
    },
    {
      href: `${shopPath}#about`,
      label: "Cửa hàng",
      icon: MapPin,
    },
  ];

  function closeMobileMenu() {
    setMobileOpen(false);
  }

  return (
    <header className="fixed left-0 right-0 top-0 z-50 border-b border-neutral-200 bg-white/95 shadow-[0_8px_28px_rgba(47,34,28,0.06)] backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:h-20 lg:px-8">
        <Link to={shopPath || "/"} className="flex min-w-0 items-center gap-3">
          <div className="grid h-11 w-11 shrink-0 place-items-center overflow-hidden rounded-[8px] border border-neutral-200 bg-white shadow-sm">
            {logoUrl ? (
              <img src={logoUrl} alt={shopName} className="h-full w-full object-contain p-1" />
            ) : (
              <Coffee size={23} className="text-[#6B4B3E]" />
            )}
          </div>

          <div className="min-w-0">
            <p className="truncate text-xl font-black leading-none tracking-tight text-[#2F221C]">
              {shopName}
            </p>
            <p className="mt-1 truncate text-[11px] font-black uppercase tracking-[0.16em] text-[#7CAEB8]">
              Coffee · Tea · Drinks
            </p>
          </div>
        </Link>

        <nav className="hidden items-center rounded-full border border-neutral-200 bg-white px-1.5 py-1 shadow-sm lg:flex">
          {navItems.map((item) => {
            const Icon = item.icon;
            // Dùng thẻ a thường để xử lý anchor jump (#menu) mượt mà hơn với React Router khi ở khác trang
            return (
              <a
                key={item.href}
                href={item.href}
                className="inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-xs font-black uppercase tracking-[0.12em] text-[#6B4B3E] transition hover:bg-neutral-50 hover:text-[#2F221C]"
              >
                <Icon size={15} />
                {item.label}
              </a>
            );
          })}
        </nav>

        <div className="hidden items-center gap-2 lg:flex">
          {googleMapUrl && (
            <a
              href={googleMapUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex h-11 w-11 items-center justify-center rounded-[8px] border border-neutral-200 bg-white text-[#6B4B3E] shadow-sm transition hover:border-[#C9A58D] hover:bg-neutral-50"
              aria-label="Mở Google Maps"
            >
              <MapPin size={18} />
            </a>
          )}

          <a
            href={`${shopPath}#menu`}
            className="inline-flex h-11 w-11 items-center justify-center rounded-[8px] border border-neutral-200 bg-white text-[#6B4B3E] shadow-sm transition hover:border-[#C9A58D] hover:bg-neutral-50"
            aria-label="Xem sản phẩm"
          >
            <ShoppingBag size={19} />
          </a>

          {phone && (
            <a
              href={`tel:${phone}`}
              className="inline-flex items-center gap-2 rounded-[8px] border border-[#B22830] bg-[#B22830] px-5 py-3 text-sm font-black !text-white shadow-[0_8px_20px_rgba(178,40,48,0.22)] transition hover:border-[#8A1F26] hover:bg-[#8A1F26] hover:shadow-[0_10px_24px_rgba(138,31,38,0.28)]"
            >
              <Phone size={17} className="text-white" />
              <span className="text-white">Gọi quán</span>
            </a>
          )}
        </div>

        <button
          type="button"
          onClick={() => setMobileOpen((prev) => !prev)}
          className="grid h-10 w-10 place-items-center rounded-[8px] border border-neutral-200 bg-white text-[#2F221C] shadow-sm transition hover:bg-neutral-50 lg:hidden"
          aria-label={mobileOpen ? "Đóng menu" : "Mở menu"}
        >
          {mobileOpen ? <X size={21} /> : <Menu size={21} />}
        </button>
      </div>

      {mobileOpen && (
        <div className="border-t border-neutral-200 bg-white px-4 py-4 shadow-lg lg:hidden">
          <nav className="grid gap-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <a
                  key={item.href}
                  href={item.href}
                  onClick={closeMobileMenu}
                  className="flex items-center justify-between rounded-[8px] border border-neutral-200 bg-white px-4 py-3 text-sm font-black uppercase tracking-[0.12em] text-[#2F221C] shadow-sm transition hover:bg-neutral-50"
                >
                  <span>{item.label}</span>
                  <Icon size={17} className="text-[#7CAEB8]" />
                </a>
              );
            })}
          </nav>

          <div className="mt-3 grid gap-2">
            {phone && (
              <a
                href={`tel:${phone}`}
                onClick={closeMobileMenu}
                className="inline-flex items-center justify-center gap-2 rounded-[8px] border border-[#B22830] bg-[#B22830] px-4 py-3 text-sm font-black uppercase tracking-[0.08em] text-white shadow-sm transition hover:border-[#8A1F26] hover:bg-[#8A1F26]"
              >
                <Phone size={17} />
                Gọi quán
              </a>
            )}

            {googleMapUrl && (
              <a
                href={googleMapUrl}
                target="_blank"
                rel="noreferrer"
                onClick={closeMobileMenu}
                className="inline-flex items-center justify-center gap-2 rounded-[8px] border border-neutral-200 bg-white px-4 py-3 text-sm font-black uppercase tracking-[0.08em] text-[#6B4B3E] shadow-sm transition hover:bg-neutral-50"
              >
                <MapPin size={17} />
                Chỉ đường
              </a>
            )}
          </div>
        </div>
      )}
    </header>
  );
}