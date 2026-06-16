import {
  ArrowUp,
  Coffee,
  ExternalLink,
  MapPin,
  Phone,
} from "lucide-react";

const SOCIAL_LINKS = [
  {
    key: "messenger",
    href: "https://www.facebook.com/messages/t/572092459324685",
    icon: MessengerLogo,
    label: "Messenger",
    brandStyle: {
      background: "#0084FF",
    },
  },
  {
    key: "instagram",
    href: "https://www.instagram.com/hop.cafe_",
    icon: InstagramLogo,
    label: "Instagram",
    brandStyle: {
      background:
        "radial-gradient(circle at 30% 107%, #fdf497 0%, #fdf497 8%, #fd5949 42%, #d6249f 62%, #285AEB 100%)",
    },
  },
  {
    key: "threads",
    href: "https://www.threads.com/@hop.cafe_",
    icon: ThreadsLogo,
    label: "Threads",
    brandStyle: {
      background: "#000000",
    },
  },
];

export default function ShopFooter({ shop }) {
  const shopName = shop?.name || "Hớp";

  const description =
    shop?.description ||
    "Menu online giúp khách xem sản phẩm nhanh hơn, rõ giá hơn và dễ liên hệ với quán.";

  const dynamicSocials = [
    ...(shop?.facebookUrl
      ? [
          {
            key: "facebook",
            href: shop.facebookUrl,
            icon: FacebookLogo,
            label: "Facebook",
            brandStyle: {
              background: "#1877F2",
            },
          },
        ]
      : []),
    ...(shop?.zaloUrl
      ? [
          {
            key: "zalo",
            href: shop.zaloUrl,
            icon: ZaloLogo,
            label: "Zalo",
            brandStyle: {
              background: "#0068FF",
            },
          },
        ]
      : []),
  ];

  const allSocials = [...SOCIAL_LINKS, ...dynamicSocials];

  return (
    <footer
      id="about"
      className="border-t border-neutral-200 bg-white px-3 pb-[calc(18px+env(safe-area-inset-bottom))] pt-6 text-neutral-900 sm:px-6 sm:pb-8 sm:pt-8 lg:px-8 lg:pb-10"
    >
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-[1.2fr_0.9fr_0.9fr]">
          <BrandCard
            shop={shop}
            shopName={shopName}
            description={description}
          />

          <ContactCard shop={shop} />

          <SocialCard socials={allSocials} shopName={shopName} />
        </div>

        <div className="mt-4 flex flex-col gap-3 border-t border-neutral-200 pt-4 sm:mt-5 sm:flex-row sm:items-center sm:justify-between sm:pt-5">
          <p className="text-center text-xs font-bold text-neutral-400 sm:text-left">
            © {new Date().getFullYear()} {shopName}. All rights reserved.
          </p>

          <nav
            className="flex flex-wrap items-center justify-center gap-2 sm:justify-end"
            aria-label="Footer navigation"
          >
            <FooterLink href="#menu" label="Sản phẩm" />
            <FooterLink href="#promotions" label="Khuyến mãi" />

            <a
              href="#"
              className="inline-flex items-center gap-1.5 rounded-[9px] bg-neutral-900 px-3 py-2 text-xs font-black !text-white transition hover:bg-neutral-700 hover:!text-white active:scale-95"
              aria-label="Về đầu trang"
            >
              <ArrowUp size={13} aria-hidden="true" />
              Về đầu
            </a>
          </nav>
        </div>
      </div>
    </footer>
  );
}

function BrandCard({ shop, shopName, description }) {
  return (
    <Card className="md:col-span-2 xl:col-span-1">
      <div className="flex items-center gap-3">
        <div className="grid h-12 w-12 shrink-0 place-items-center overflow-hidden rounded-[12px] border border-neutral-200 bg-white shadow-sm sm:h-[52px] sm:w-[52px]">
          {shop?.logoUrl ? (
            <img
              src={shop.logoUrl}
              alt={shopName}
              className="h-full w-full object-contain p-1"
            />
          ) : (
            <Coffee size={23} className="text-[#6B4B3E]" aria-hidden="true" />
          )}
        </div>

        <div className="min-w-0">
          <h2 className="truncate text-xl font-black tracking-tight text-neutral-900 sm:text-[22px]">
            {shopName}
          </h2>

          <p className="mt-0.5 text-[10px] font-black uppercase tracking-[0.18em] text-[#7CAEB8]">
            Coffee · Tea · Drinks
          </p>
        </div>
      </div>

      <p className="mt-3 max-w-xl text-sm leading-6 text-neutral-500 sm:mt-4 sm:leading-7">
        {description}
      </p>

      {(shop?.phone || shop?.googleMapUrl) && (
        <div className="mt-4 grid gap-2 min-[420px]:grid-cols-2">
          {shop?.phone && (
            <a
              href={`tel:${shop.phone}`}
              className="inline-flex min-h-10 items-center justify-center gap-2 rounded-[9px] bg-[#B22830] px-4 py-2.5 text-sm font-black !text-white transition hover:bg-[#8A1F26] hover:!text-white active:scale-95"
            >
              <Phone size={16} aria-hidden="true" />
              Gọi quán
            </a>
          )}

          {shop?.googleMapUrl && (
            <a
              href={shop.googleMapUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex min-h-10 items-center justify-center gap-2 rounded-[9px] border border-neutral-200 bg-white px-4 py-2.5 text-sm font-black text-neutral-700 transition hover:border-neutral-300 hover:bg-neutral-50 active:scale-95"
            >
              <MapPin size={16} aria-hidden="true" />
              Chỉ đường
            </a>
          )}
        </div>
      )}
    </Card>
  );
}

function ContactCard({ shop }) {
  const hasContact = shop?.phone || shop?.address;

  return (
    <Card>
      <SectionTitle title="Liên hệ" />

      <div className="mt-3 space-y-2">
        {shop?.phone && (
          <ContactLine
            icon={Phone}
            label="Số điện thoại"
            value={shop.phone}
            href={`tel:${shop.phone}`}
          />
        )}

        {shop?.address && (
          <ContactLine
            icon={MapPin}
            label="Địa chỉ"
            value={shop.address}
            href={shop.googleMapUrl}
          />
        )}

        {!hasContact && (
          <p className="rounded-[10px] bg-white p-3 text-sm leading-6 text-neutral-400 ring-1 ring-neutral-200">
            Thông tin liên hệ sẽ được cập nhật sớm.
          </p>
        )}
      </div>
    </Card>
  );
}

function SocialCard({ socials, shopName }) {
  return (
    <Card>
      <SectionTitle title={`Kết nối với ${shopName}`} />

      <div className="mt-3 grid gap-2 min-[420px]:grid-cols-2 md:grid-cols-1">
        {socials.map(({ key, href, icon, label, brandStyle }) => (
          <SocialLink
            key={key}
            href={href}
            icon={icon}
            label={label}
            brandStyle={brandStyle}
          />
        ))}
      </div>
    </Card>
  );
}

function Card({ children, className = "" }) {
  return (
    <div
      className={`rounded-[14px] border border-neutral-200 bg-neutral-50 p-3 transition hover:border-neutral-300 hover:bg-neutral-100/60 sm:p-4 lg:p-5 ${className}`}
    >
      {children}
    </div>
  );
}

function SectionTitle({ title }) {
  return (
    <div>
      <p className="text-sm font-black text-neutral-900">{title}</p>
      <div className="mt-2 h-[3px] w-8 rounded-full bg-[#7CAEB8]" />
    </div>
  );
}

function ContactLine({ icon: Icon, label, value, href }) {
  const inner = (
    <div className="flex items-start gap-2.5 rounded-[10px] border border-neutral-200 bg-white p-3 transition hover:border-neutral-300 hover:bg-neutral-50">
      <div className="grid h-8 w-8 shrink-0 place-items-center rounded-[8px] bg-neutral-100 text-[#7CAEB8]">
        <Icon size={15} aria-hidden="true" />
      </div>

      <div className="min-w-0">
        <p className="text-[10px] font-black uppercase tracking-[0.12em] text-neutral-400">
          {label}
        </p>

        <p className="mt-0.5 line-clamp-3 text-sm font-bold leading-6 text-neutral-700">
          {value}
        </p>
      </div>
    </div>
  );

  if (!href) return inner;

  return (
    <a
      href={href}
      className="block"
      target={href.startsWith("http") ? "_blank" : undefined}
      rel="noreferrer"
    >
      {inner}
    </a>
  );
}

function SocialLink({ href, icon: Icon, label, brandStyle }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="group flex min-h-12 items-center justify-between gap-3 rounded-[10px] border border-neutral-200 bg-white px-3 py-2 transition hover:border-neutral-300 hover:bg-neutral-50 active:scale-[0.98]"
    >
      <span className="flex min-w-0 items-center gap-2.5">
        <span
          className="grid h-9 w-9 shrink-0 place-items-center rounded-[10px] text-white shadow-sm transition-transform group-hover:scale-105"
          style={brandStyle}
        >
          <Icon className="h-[21px] w-[21px]" />
        </span>

        <span className="truncate text-sm font-black text-neutral-800">
          {label}
        </span>
      </span>

      <ExternalLink
        size={13}
        className="shrink-0 text-neutral-300 transition group-hover:text-neutral-500"
        aria-hidden="true"
      />
    </a>
  );
}

function FooterLink({ href, label }) {
  return (
    <a
      href={href}
      className="rounded-[9px] bg-neutral-100 px-3 py-2 text-xs font-black text-neutral-500 transition hover:bg-neutral-200 hover:text-neutral-900"
    >
      {label}
    </a>
  );
}

/* Social logos */

function MessengerLogo({ className = "" }) {
  return (
    <svg viewBox="0 0 36 36" className={className} aria-hidden="true">
      <path
        fill="#fff"
        d="M18 5.2C10.8 5.2 5.2 10.5 5.2 17.7c0 3.8 1.55 7.05 4.08 9.28.22.2.34.47.35.76l.08 2.3c.02.74.78 1.2 1.44.88l2.57-1.26c.23-.11.49-.13.73-.06 1.12.31 2.31.47 3.55.47 7.2 0 12.8-5.28 12.8-12.36C30.8 10.5 25.2 5.2 18 5.2Z"
      />
      <path
        fill="#0084FF"
        d="m10.4 21.35 3.76-5.96c.6-.95 1.87-1.19 2.77-.52l2.98 2.24c.28.2.66.2.93-.03l4.02-3.43c.54-.46 1.25.18.87.78l-3.76 5.96c-.6.95-1.87 1.19-2.77.52l-2.98-2.24c-.28-.2-.66-.2-.93.03l-4.02 3.43c-.54.46-1.25-.18-.87-.78Z"
      />
    </svg>
  );
}

function InstagramLogo({ className = "" }) {
  return (
    <svg viewBox="0 0 36 36" className={className} fill="none" aria-hidden="true">
      <rect
        x="8"
        y="8"
        width="20"
        height="20"
        rx="6"
        stroke="#fff"
        strokeWidth="3"
      />
      <circle cx="18" cy="18" r="4.6" stroke="#fff" strokeWidth="3" />
      <circle cx="24.2" cy="11.8" r="1.6" fill="#fff" />
    </svg>
  );
}

function ThreadsLogo({ className = "" }) {
  return (
    <svg viewBox="0 0 36 36" className={className} fill="none" aria-hidden="true">
      <path
        d="M18.15 31C10.8 31 6 26.05 6 18.1C6 10.05 10.95 5 18.35 5C24.95 5 29.1 8.65 30 14.7"
        stroke="#fff"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <path
        d="M23.15 16.4C22.6 13.35 20.8 11.8 18.25 11.8C15.15 11.8 13.35 13.95 13.35 17.85C13.35 22 15.25 24.2 18.7 24.2C21.8 24.2 23.65 22.55 23.65 20.25C23.65 18.05 22.05 16.85 19.15 16.85H16.85"
        stroke="#fff"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <path
        d="M23.1 16.45C27.4 17.15 30 19.45 30 22.9C30 27.65 25.9 31 19.15 31"
        stroke="#fff"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  );
}

function FacebookLogo({ className = "" }) {
  return (
    <svg viewBox="0 0 36 36" className={className} aria-hidden="true">
      <path
        fill="#fff"
        d="M20.35 31V19.65h3.8l.58-4.42h-4.38v-2.82c0-1.28.36-2.15 2.2-2.15h2.35V6.3C24.5 6.25 23.1 6.13 21.5 6.13c-3.36 0-5.66 2.05-5.66 5.82v3.28h-3.8v4.42h3.8V31h4.51Z"
      />
    </svg>
  );
}

function ZaloLogo({ className = "" }) {
  return (
    <svg viewBox="0 0 48 48" className={className} aria-hidden="true">
      <rect x="4" y="7" width="40" height="34" rx="10" fill="#fff" />
      <text
        x="24"
        y="29"
        textAnchor="middle"
        fontSize="13"
        fontWeight="900"
        fontFamily="Arial, sans-serif"
        fill="#0068FF"
      >
        Zalo
      </text>
    </svg>
  );
}