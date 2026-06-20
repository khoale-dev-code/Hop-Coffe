import {
  CalendarCheck,
  Coffee,
  MapPin,
  Menu,
  Phone,
  ShoppingBag,
  Tag,
  X,
  Newspaper,
} from "lucide-react";
import { Link } from "react-router-dom";

const mobileMenuItemClass =
  "flex min-h-12 w-full appearance-none items-center justify-between gap-3 rounded-[10px] border border-neutral-200 bg-white px-4 py-3 text-left text-sm !font-black uppercase tracking-[0.08em] text-[#2F221C] shadow-sm transition hover:bg-neutral-50 active:scale-[0.99]";
const mobileIconClass = "shrink-0 text-[#7CAEB8]";

export default function MenuHeader({
  shop,
  mobileOpen,
  setMobileOpen,
  onOpenReservation,
}) {
  const shopName = shop?.name || "Hớp";
  const logoUrl = shop?.logoUrl || "";
  const phone = shop?.phone || "";
  const googleMapUrl = shop?.googleMapUrl || "";

  const shopPath = shop?.slug ? `/${shop.slug}` : "";

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
      href: `${shopPath}/blog`,
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

  function handleOpenReservation() {
    setMobileOpen(false);
    onOpenReservation?.();
  }

  return (
    <header className="fixed left-0 right-0 top-0 z-50 border-b border-neutral-200 bg-white/95 shadow-[0_8px_28px_rgba(47,34,28,0.06)] backdrop-blur-xl">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between gap-2 px-3 sm:h-16 sm:px-5 lg:h-18 lg:px-6 xl:h-20 xl:px-8">
        <Link
          to={shopPath || "/"}
          className="flex min-w-0 flex-1 items-center gap-2.5 sm:max-w-xs sm:gap-3 lg:max-w-[260px] xl:max-w-[300px]"
          aria-label={`Về trang chủ ${shopName}`}
        >
          <div className="grid h-9 w-9 shrink-0 place-items-center overflow-hidden rounded-[8px] border border-neutral-200 bg-white shadow-sm sm:h-11 sm:w-11">
            {logoUrl ? (
              <img
                src={logoUrl}
                alt={shopName}
                className="h-full w-full object-contain p-1"
              />
            ) : (
              <Coffee size={21} className="text-[#6B4B3E]" />
            )}
          </div>

          <div className="min-w-0">
            <p className="truncate text-base font-black leading-none tracking-tight text-[#2F221C] sm:text-xl">
              {shopName}
            </p>

            <p className="mt-1 truncate text-[9px] font-black uppercase tracking-[0.1em] text-[#7CAEB8] max-[360px]:hidden sm:text-[11px] sm:tracking-[0.16em]">
              Coffee · Tea · Drinks
            </p>
          </div>
        </Link>

        <nav className="hidden min-w-0 items-center rounded-full border border-neutral-200 bg-white px-1.5 py-1 shadow-sm xl:flex">
          {navItems.map((item) => {
            const Icon = item.icon;

            return (
              <a
                key={item.href}
                href={item.href}
                className="inline-flex shrink-0 items-center gap-2 rounded-full px-3 py-2.5 text-xs font-black uppercase tracking-[0.1em] text-[#6B4B3E] transition hover:bg-neutral-50 hover:text-[#2F221C] 2xl:px-4 2xl:tracking-[0.12em]"
              >
                <Icon size={15} className="shrink-0" />
                <span>{item.label}</span>
              </a>
            );
          })}
        </nav>

        <div className="hidden shrink-0 items-center gap-2 lg:flex">
          {googleMapUrl && (
            <a
              href={googleMapUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex h-11 w-11 items-center justify-center rounded-[8px] border border-neutral-200 bg-white text-[#6B4B3E] shadow-sm transition hover:border-[#C9A58D] hover:bg-neutral-50"
              aria-label="Mở Google Maps"
              title="Chỉ đường"
            >
              <MapPin size={18} />
            </a>
          )}

          <button
            type="button"
            onClick={handleOpenReservation}
            className="inline-flex h-11 w-11 items-center justify-center rounded-[8px] border border-neutral-200 bg-white text-[#6B4B3E] shadow-sm transition hover:border-[#C9A58D] hover:bg-neutral-50"
            aria-label="Đặt bàn"
            title="Đặt bàn"
          >
            <CalendarCheck size={19} />
          </button>

          <a
            href={`${shopPath}#menu`}
            className="inline-flex h-11 w-11 items-center justify-center rounded-[8px] border border-neutral-200 bg-white text-[#6B4B3E] shadow-sm transition hover:border-[#C9A58D] hover:bg-neutral-50"
            aria-label="Xem sản phẩm"
            title="Xem sản phẩm"
          >
            <ShoppingBag size={19} />
          </a>

          {phone && (
            <a
              href={`tel:${phone}`}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-[8px] border border-[#B22830] bg-[#B22830] px-3 text-sm font-black !text-white shadow-[0_8px_20px_rgba(178,40,48,0.22)] transition hover:border-[#8A1F26] hover:bg-[#8A1F26] hover:shadow-[0_10px_24px_rgba(138,31,38,0.28)] xl:px-5"
              aria-label="Gọi quán"
            >
              <Phone size={17} className="shrink-0 text-white" />
              <span className="hidden text-white xl:inline">Gọi quán</span>
            </a>
          )}
        </div>

        <div className="flex shrink-0 items-center gap-1.5 lg:hidden">
          <button
            type="button"
            onClick={handleOpenReservation}
            className="grid h-9 w-9 place-items-center rounded-[8px] border border-neutral-200 bg-white text-[#6B4B3E] shadow-sm transition hover:bg-neutral-50 active:scale-[0.98] sm:h-10 sm:w-10"
            aria-label="Đặt bàn"
            title="Đặt bàn"
          >
            <CalendarCheck size={18} />
          </button>

          <button
            type="button"
            onClick={() => setMobileOpen((prev) => !prev)}
            className="grid h-9 w-9 place-items-center rounded-[8px] border border-neutral-200 bg-white text-[#2F221C] shadow-sm transition hover:bg-neutral-50 active:scale-[0.98] sm:h-10 sm:w-10"
            aria-label={mobileOpen ? "Đóng menu" : "Mở menu"}
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="fixed inset-x-0 top-14 z-50 max-h-[calc(100dvh-56px)] overflow-y-auto border-t border-neutral-200 bg-white/98 px-3 py-3 shadow-[0_18px_40px_rgba(47,34,28,0.14)] backdrop-blur-xl sm:top-16 sm:max-h-[calc(100dvh-64px)] sm:px-5 sm:py-4 lg:hidden">
          <div className="mx-auto max-w-2xl">
            <nav className="grid gap-2 sm:grid-cols-2">
              {navItems.map((item) => {
                const Icon = item.icon;

                return (
                  <a
                    key={item.href}
                    href={item.href}
                    onClick={closeMobileMenu}
                    className={mobileMenuItemClass}
                  >
                   <span className="truncate !font-black text-[#2F221C]">{item.label}</span>
                    <Icon size={17} className={mobileIconClass} />
                  </a>
                );
              })}

              <button
              type="button"
              onClick={handleOpenReservation}
              className={mobileMenuItemClass}
            >
              <span className="truncate !font-black text-[#2F221C]">Đặt bàn</span>
              <CalendarCheck size={17} className={mobileIconClass} />
            </button>
            </nav>

            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              {phone && (
                <a
                  href={`tel:${phone}`}
                  onClick={closeMobileMenu}
                  className="inline-flex min-h-12 items-center justify-center gap-2 rounded-[10px] border border-[#B22830] bg-[#B22830] px-4 py-3 text-sm font-black uppercase tracking-[0.08em] !text-white shadow-sm transition hover:border-[#8A1F26] hover:bg-[#8A1F26] hover:!text-white active:scale-[0.99]"
                >
                  <Phone size={17} className="shrink-0 text-white" />
                  <span className="truncate text-white">Gọi quán</span>
                </a>
              )}

              {googleMapUrl && (
                <a
                  href={googleMapUrl}
                  target="_blank"
                  rel="noreferrer"
                  onClick={closeMobileMenu}
                  className="inline-flex min-h-12 items-center justify-center gap-2 rounded-[10px] border border-neutral-200 bg-white px-4 py-3 text-sm font-black uppercase tracking-[0.08em] text-[#6B4B3E] shadow-sm transition hover:bg-neutral-50 active:scale-[0.99]"
                >
                  <MapPin size={17} className="shrink-0" />
                  <span className="truncate">Chỉ đường</span>
                </a>
              )}

              <a
                href={`${shopPath}#menu`}
                onClick={closeMobileMenu}
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-[10px] border border-neutral-200 bg-white px-4 py-3 text-sm font-black uppercase tracking-[0.08em] text-[#6B4B3E] shadow-sm transition hover:bg-neutral-50 active:scale-[0.99] sm:col-span-2"
              >
                <ShoppingBag size={17} className="shrink-0" />
                <span className="truncate">Xem sản phẩm</span>
              </a>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}