import { RefreshCw } from "lucide-react";

export default function PageHeader({ loading, onRefresh, savingOrder }) {
  return (
    <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
      <div>
        <p className="text-sm font-black uppercase tracking-[0.18em] text-neutral-400">
          Menu
        </p>

        <h1 className="mt-1 text-3xl font-black tracking-tight">
          Quản lý menu
        </h1>

        <p className="mt-2 max-w-2xl text-sm leading-6 text-neutral-500">
          Thêm món, sửa giá, thêm size theo từng giá, bật/tắt trạng thái, đánh
          dấu món nổi bật và kéo thả để đổi thứ tự hiển thị trên menu khách hàng.
        </p>
      </div>

      <button
        type="button"
        onClick={onRefresh}
        disabled={loading || savingOrder}
        className="inline-flex items-center justify-center gap-2 rounded-[10px] border border-neutral-200 bg-white px-4 py-3 text-sm font-bold text-neutral-700 transition hover:bg-neutral-50 disabled:opacity-60"
      >
        <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
        Tải lại dữ liệu
      </button>
    </div>
  );
}