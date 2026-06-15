import { RefreshCw, Sparkles } from "lucide-react";

export default function PageHeader({ loading, onRefresh, savingOrder }) {
  const isDisabled = loading || savingOrder;

  return (
    <section className="rounded-[14px] border border-neutral-200 bg-white p-4 shadow-sm sm:p-5 lg:p-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="min-w-0">
          <div className="inline-flex items-center gap-2 rounded-full border border-neutral-200 bg-white px-3 py-1.5 text-xs font-black uppercase tracking-[0.14em] text-[#7CAEB8] shadow-sm">
            <Sparkles size={14} />
            Menu
          </div>

          <h1 className="mt-3 text-2xl font-black tracking-tight text-[#2F221C] sm:text-3xl lg:text-4xl">
            Quản lý menu
          </h1>

          <p className="mt-2 max-w-3xl text-sm leading-6 text-neutral-500 sm:text-[15px]">
            Thêm món, sửa giá, thêm size theo từng giá, bật/tắt trạng thái,
            đánh dấu món nổi bật và kéo thả để đổi thứ tự hiển thị trên menu
            khách hàng.
          </p>
        </div>

        <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center">
          {savingOrder && (
            <div className="inline-flex items-center justify-center rounded-[8px] border border-blue-100 bg-blue-50 px-4 py-3 text-sm font-black text-blue-700">
              Đang lưu thứ tự...
            </div>
          )}

          <button
            type="button"
            onClick={onRefresh}
            disabled={isDisabled}
            className="inline-flex w-full items-center justify-center gap-2 rounded-[8px] border border-[#2F221C] bg-white px-4 py-3 text-sm font-black text-[#2F221C] shadow-sm transition hover:bg-[#2F221C] hover:text-white disabled:cursor-not-allowed disabled:border-neutral-200 disabled:bg-neutral-100 disabled:text-neutral-400 sm:w-auto"
          >
            <RefreshCw
              size={18}
              className={loading ? "animate-spin" : ""}
            />

            <span>{loading ? "Đang tải..." : "Tải lại dữ liệu"}</span>
          </button>
        </div>
      </div>
    </section>
  );
}