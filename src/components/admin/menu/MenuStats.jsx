import { Eye, EyeOff, Package, Star } from "lucide-react";

const statItems = [
  {
    key: "total",
    label: "Tổng số món",
    description: "Tất cả sản phẩm",
    icon: Package,
    tone: "neutral",
  },
  {
    key: "available",
    label: "Còn bán",
    description: "Đang hiển thị",
    icon: Eye,
    tone: "green",
  },
  {
    key: "unavailable",
    label: "Tạm hết",
    description: "Khách vẫn thấy trạng thái",
    icon: EyeOff,
    tone: "red",
  },
  {
    key: "featured",
    label: "Nổi bật",
    description: "Hiện ở mục gợi ý",
    icon: Star,
    tone: "amber",
  },
];

export default function MenuStats({ stats = {} }) {
  return (
    <section className="mt-5">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {statItems.map((item) => (
          <StatCard
            key={item.key}
            label={item.label}
            value={stats[item.key] || 0}
            description={item.description}
            icon={item.icon}
            tone={item.tone}
          />
        ))}
      </div>
    </section>
  );
}

function StatCard({ label, value, icon: Icon, description, tone }) {
  const toneClass = getToneClass(tone);

  return (
    <article className="group overflow-hidden rounded-[12px] border border-neutral-200 bg-white p-3 shadow-sm transition hover:-translate-y-0.5 hover:border-[#C9A58D] hover:shadow-[0_14px_32px_rgba(47,34,28,0.08)] sm:p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="line-clamp-1 text-xs font-black uppercase tracking-[0.08em] text-neutral-500 sm:text-sm sm:normal-case sm:tracking-normal">
            {label}
          </p>

          <p className="mt-2 text-2xl font-black leading-none tracking-tight text-[#2F221C] sm:text-3xl">
            {value}
          </p>
        </div>

        <div
          className={`grid h-10 w-10 shrink-0 place-items-center rounded-[10px] sm:h-11 sm:w-11 ${toneClass.iconBox}`}
        >
          <Icon size={20} className={toneClass.icon} />
        </div>
      </div>

      <p className="mt-3 line-clamp-2 text-[11px] font-semibold leading-5 text-neutral-400 sm:text-xs">
        {description}
      </p>

      <div className={`mt-3 h-1 rounded-full ${toneClass.bar}`} />
    </article>
  );
}

function getToneClass(tone) {
  switch (tone) {
    case "green":
      return {
        iconBox: "bg-green-50",
        icon: "text-green-700",
        bar: "bg-green-100",
      };

    case "red":
      return {
        iconBox: "bg-red-50",
        icon: "text-[#B22830]",
        bar: "bg-red-100",
      };

    case "amber":
      return {
        iconBox: "bg-amber-50",
        icon: "text-amber-700",
        bar: "bg-amber-100",
      };

    default:
      return {
        iconBox: "bg-neutral-100",
        icon: "text-[#6B4B3E]",
        bar: "bg-neutral-100",
      };
  }
}