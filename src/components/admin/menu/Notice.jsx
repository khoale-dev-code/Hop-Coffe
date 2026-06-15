import { AlertTriangle, CheckCircle2, Loader2 } from "lucide-react";

export default function Notice({ message, error, savingOrder }) {
  if (!message && !error && !savingOrder) return null;

  return (
    <div className="mt-5 grid gap-3">
      {message && (
        <NoticeItem
          type="success"
          icon={CheckCircle2}
          title="Thành công"
          description={message}
        />
      )}

      {error && (
        <NoticeItem
          type="error"
          icon={AlertTriangle}
          title="Có lỗi xảy ra"
          description={error}
        />
      )}

      {savingOrder && (
        <NoticeItem
          type="loading"
          icon={Loader2}
          title="Đang xử lý"
          description="Đang lưu thứ tự món..."
        />
      )}
    </div>
  );
}

function NoticeItem({ type, icon: Icon, title, description }) {
  const styles = {
    success: {
      wrapper:
        "border-emerald-200 bg-emerald-50 text-emerald-800 shadow-[0_10px_24px_rgba(16,185,129,0.08)]",
      iconBox: "bg-white text-emerald-600 ring-emerald-200",
      title: "text-emerald-900",
      desc: "text-emerald-700",
    },
    error: {
      wrapper:
        "border-red-200 bg-red-50 text-red-800 shadow-[0_10px_24px_rgba(239,68,68,0.08)]",
      iconBox: "bg-white text-red-600 ring-red-200",
      title: "text-red-900",
      desc: "text-red-700",
    },
    loading: {
      wrapper:
        "border-blue-200 bg-blue-50 text-blue-800 shadow-[0_10px_24px_rgba(59,130,246,0.08)]",
      iconBox: "bg-white text-blue-600 ring-blue-200",
      title: "text-blue-900",
      desc: "text-blue-700",
    },
  };

  const current = styles[type] || styles.success;
  const isLoading = type === "loading";

  return (
    <div
      role={type === "error" ? "alert" : "status"}
      className={[
        "flex items-start gap-3 rounded-[12px] border px-3 py-3 sm:px-4 sm:py-3.5",
        "transition duration-200",
        current.wrapper,
      ].join(" ")}
    >
      <div
        className={[
          "mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-[10px] ring-1",
          current.iconBox,
        ].join(" ")}
      >
        <Icon size={18} className={isLoading ? "animate-spin" : ""} />
      </div>

      <div className="min-w-0 flex-1">
        <p
          className={[
            "text-sm font-black leading-5 sm:text-[15px]",
            current.title,
          ].join(" ")}
        >
          {title}
        </p>

        <p
          className={[
            "mt-0.5 break-words text-sm font-semibold leading-6",
            current.desc,
          ].join(" ")}
        >
          {description}
        </p>
      </div>
    </div>
  );
}