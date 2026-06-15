import {
  ArrowUp,
  AtSign,
  Camera,
  Coffee,
  ExternalLink,
  MapPin,
  MessageCircle,
  Phone,
  Send,
} from "lucide-react";

const SOCIAL_LINKS = [
  {
    key: "messenger",
    href: "https://www.facebook.com/messages/t/572092459324685",
    icon: MessageCircle,
    label: "Messenger",
    colorClass: "bg-[#0084FF] text-white",
  },
  {
    key: "instagram",
    href: "https://www.instagram.com/hop.cafe_",
    icon: Camera,
    label: "Instagram",
    // Instagram gradient via inline style
    colorClass: "text-white",
    style: {
      background:
        "radial-gradient(circle at 30% 107%, #fdf497 0%, #fdf497 5%, #fd5949 45%, #d6249f 60%, #285AEB 90%)",
    },
  },
  {
    key: "threads",
    href: "https://www.threads.com/@hop.cafe_",
    icon: AtSign,
    label: "Threads",
    colorClass: "bg-black text-white",
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
            icon: ExternalLink,
            label: "Facebook",
            colorClass: "bg-[#1877F2] text-white",
          },
        ]
      : []),
    ...(shop?.zaloUrl
      ? [
          {
            key: "zalo",
            href: shop.zaloUrl,
            icon: Send,
            label: "Zalo",
            colorClass: "bg-[#0068FF] text-white",
          },
        ]
      : []),
  ];

  const allSocials = [...SOCIAL_LINKS, ...dynamicSocials];

  return (
    <footer
      id="about"
      className="border-t border-neutral-200 bg-white px-4 pb-24 pt-8 text-neutral-900 sm:px-6 sm:pb-12 sm:pt-10 lg:px-8"
    >
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-[1.25fr_0.875fr_0.875fr]">
          <BrandCard shop={shop} shopName={shopName} description={description} />
          <ContactCard shop={shop} />
          <SocialCard socials={allSocials} shopName={shopName} />
        </div>

        <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-neutral-200 pt-5">
          <p className="text-xs font-bold text-neutral-400">
            © {new Date().getFullYear()} {shopName}. All rights reserved.
          </p>

          <nav className="flex flex-wrap items-center gap-2" aria-label="Footer navigation">
            <FooterLink href="#menu" label="Sản phẩm" />
            <FooterLink href="#promotions" label="Khuyến mãi" />
            <a
              href="#"
              className="inline-flex items-center gap-1.5 rounded-lg bg-neutral-900 px-3 py-2 text-xs font-black !text-white transition hover:bg-neutral-700 hover:!text-white active:scale-95"
              aria-label="Về đầu trang"
            >
              <ArrowUp size={13} aria-hidden="true" />
              Về đầu trang
            </a>
          </nav>
        </div>
      </div>
    </footer>
  );
}

/* ─── Brand card ──────────────────────────────────────────── */
function BrandCard({ shop, shopName, description }) {
  return (
    <Card className="sm:col-span-2 lg:col-span-1">
      <div className="flex items-center gap-3.5">
        <div className="grid h-[52px] w-[52px] shrink-0 place-items-center overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-sm">
          {shop?.logoUrl ? (
            <img src={shop.logoUrl} alt={shopName} className="h-full w-full object-contain p-1" />
          ) : (
            <Coffee size={24} className="text-[#6B4B3E]" aria-hidden="true" />
          )}
        </div>

        <div className="min-w-0">
          <h2 className="truncate text-[22px] font-black tracking-tight text-neutral-900">
            {shopName}
          </h2>
          <p className="mt-0.5 text-[10px] font-black uppercase tracking-[0.18em] text-[#7CAEB8]">
            Coffee · Tea · Drinks
          </p>
        </div>
      </div>

      <p className="mt-4 max-w-sm text-sm leading-7 text-neutral-500">{description}</p>

      <div className="mt-4 grid grid-cols-2 gap-2">
        {shop?.phone && (
          <a
            href={`tel:${shop.phone}`}
            className="inline-flex items-center justify-center gap-2 rounded-[9px] bg-[#B22830] px-4 py-2.5 text-sm font-black !text-white transition hover:bg-[#8A1F26] hover:!text-white active:scale-95"
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
            className="inline-flex items-center justify-center gap-2 rounded-[9px] border border-neutral-200 bg-white px-4 py-2.5 text-sm font-black text-neutral-700 transition hover:bg-neutral-50 hover:border-neutral-300 active:scale-95"
          >
            <MapPin size={16} aria-hidden="true" />
            Chỉ đường
          </a>
        )}
      </div>
    </Card>
  );
}

/* ─── Contact card ──────────────────────────────────────────── */
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
          <p className="rounded-[10px] bg-neutral-100 p-3 text-sm leading-6 text-neutral-400">
            Thông tin liên hệ sẽ được cập nhật sớm.
          </p>
        )}
      </div>
    </Card>
  );
}

/* ─── Social card ───────────────────────────────────────────── */
function SocialCard({ socials, shopName }) {
  return (
    <Card>
      <SectionTitle title={`Kết nối với ${shopName}`} />
      <div className="mt-3 space-y-2">
        {socials.map(({ key, href, icon, label, colorClass, style }) => (
          <SocialLink
            key={key}
            href={href}
            icon={icon}
            label={label}
            colorClass={colorClass}
            iconStyle={style}
          />
        ))}
      </div>
    </Card>
  );
}

/* ─── Shared primitives ─────────────────────────────────────── */
function Card({ children, className = "" }) {
  return (
    <div
      className={`rounded-[14px] border border-neutral-200 bg-neutral-50 p-4 transition hover:border-neutral-300 hover:bg-neutral-100/60 sm:p-5 ${className}`}
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

function SocialLink({ href, icon: Icon, label, colorClass = "bg-neutral-200 text-neutral-600", iconStyle }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="group flex items-center justify-between gap-3 rounded-[10px] border border-neutral-200 bg-white px-3 py-2.5 transition hover:border-neutral-300 hover:bg-neutral-50 active:scale-[0.98]"
    >
      <span className="flex min-w-0 items-center gap-2.5">
        <span
          className={`grid h-8 w-8 shrink-0 place-items-center rounded-[8px] transition-transform group-hover:scale-110 ${colorClass}`}
          style={iconStyle}
        >
          <Icon size={15} aria-hidden="true" />
        </span>
        <span className="truncate text-sm font-black text-neutral-800">{label}</span>
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
      className="rounded-lg bg-neutral-100 px-3 py-2 text-xs font-black text-neutral-500 transition hover:bg-neutral-200 hover:text-neutral-900"
    >
      {label}
    </a>
  );
}