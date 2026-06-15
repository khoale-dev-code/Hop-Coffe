import { MapPin, MessageCircle, Phone } from "lucide-react";

export default function QuickActions({ shop }) {
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
    <section className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
      <div className="grid gap-3 sm:grid-cols-3">
        {actions.map((action) => {
          const Icon = action.icon;

          return (
            <a
              key={action.title}
              href={action.href}
              target={action.href?.startsWith("http") ? "_blank" : undefined}
              rel={action.href?.startsWith("http") ? "noreferrer" : undefined}
              className="flex items-center gap-4 rounded-[14px] border border-[#EEE3D8] bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
            >
              <div className="grid h-11 w-11 shrink-0 place-items-center rounded-[10px] bg-[#E7F2F4] text-[#4E8791]">
                <Icon size={21} />
              </div>

              <div className="min-w-0">
                <p className="font-black text-[#2F221C]">{action.title}</p>
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