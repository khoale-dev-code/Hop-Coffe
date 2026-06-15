import { Eye, EyeOff, Package, Star } from "lucide-react";

export default function MenuStats({ stats }) {
  return (
    <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      <StatCard
        label="Tổng số món"
        value={stats.total}
        icon={Package}
        description="Tất cả sản phẩm"
      />

      <StatCard
        label="Còn bán"
        value={stats.available}
        icon={Eye}
        description="Đang hiển thị"
      />

      <StatCard
        label="Tạm hết"
        value={stats.unavailable}
        icon={EyeOff}
        description="Khách vẫn thấy trạng thái"
      />

      <StatCard
        label="Nổi bật"
        value={stats.featured}
        icon={Star}
        description="Hiện ở mục gợi ý"
      />
    </div>
  );
}

function StatCard({ label, value, icon: Icon, description }) {
  return (
    <div className="rounded-[14px] border border-neutral-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-bold text-neutral-500">{label}</p>
          <p className="mt-2 text-3xl font-black tracking-tight">{value}</p>
        </div>

        <div className="grid h-11 w-11 place-items-center rounded-[10px] bg-neutral-100 text-neutral-700">
          <Icon size={21} />
        </div>
      </div>

      <p className="mt-3 text-xs font-medium text-neutral-400">
        {description}
      </p>
    </div>
  );
}