import { useEffect, useMemo, useState } from "react";
import {
  CalendarCheck,
  CheckCircle2,
  Clock,
  Loader2,
  MessageSquareText,
  Phone,
  RefreshCcw,
  Search,
  Trash2,
  UserRound,
  Users,
  XCircle,
} from "lucide-react";

import {
  deleteReservation,
  getReservations,
  RESERVATION_STATUS,
  updateReservationStatus,
} from "../../services/reservationService";

const DEFAULT_SHOP_ID = import.meta.env.VITE_DEFAULT_SHOP_ID || "demo-shop";

const statusOptions = [
  {
    value: "all",
    label: "Tất cả",
    shortLabel: "Tất cả",
  },
  {
    value: RESERVATION_STATUS.PENDING,
    label: "Chờ xác nhận",
    shortLabel: "Chờ",
  },
  {
    value: RESERVATION_STATUS.CONFIRMED,
    label: "Đã xác nhận",
    shortLabel: "Xác nhận",
  },
  {
    value: RESERVATION_STATUS.DONE,
    label: "Hoàn tất",
    shortLabel: "Xong",
  },
  {
    value: RESERVATION_STATUS.CANCELLED,
    label: "Đã hủy",
    shortLabel: "Hủy",
  },
];

const statusMeta = {
  [RESERVATION_STATUS.PENDING]: {
    label: "Chờ xác nhận",
    dotClass: "bg-amber-500",
    badgeClass: "bg-amber-50 text-amber-700 ring-amber-100",
    cardClass: "border-amber-100 bg-amber-50/35",
  },
  [RESERVATION_STATUS.CONFIRMED]: {
    label: "Đã xác nhận",
    dotClass: "bg-emerald-500",
    badgeClass: "bg-emerald-50 text-emerald-700 ring-emerald-100",
    cardClass: "border-emerald-100 bg-emerald-50/35",
  },
  [RESERVATION_STATUS.DONE]: {
    label: "Hoàn tất",
    dotClass: "bg-blue-500",
    badgeClass: "bg-blue-50 text-blue-700 ring-blue-100",
    cardClass: "border-blue-100 bg-blue-50/35",
  },
  [RESERVATION_STATUS.CANCELLED]: {
    label: "Đã hủy",
    dotClass: "bg-red-500",
    badgeClass: "bg-red-50 text-red-700 ring-red-100",
    cardClass: "border-red-100 bg-red-50/35",
  },
};

function formatCreatedAt(value) {
  if (!value) return "Không rõ";

  try {
    const date = value?.toDate ? value.toDate() : new Date(value);

    return date.toLocaleString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  } catch {
    return "Không rõ";
  }
}

function formatDate(dateValue) {
  if (!dateValue) return "Chưa chọn";

  try {
    const [year, month, day] = String(dateValue).split("-");

    if (!year || !month || !day) return dateValue;

    return `${day}/${month}/${year}`;
  } catch {
    return dateValue;
  }
}

function normalizeSearchText(value = "") {
  return String(value || "").toLowerCase().trim();
}

function getStatus(reservation) {
  return reservation.status || RESERVATION_STATUS.PENDING;
}

export default function ReservationsPage() {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState("");
  const [deletingId, setDeletingId] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [keyword, setKeyword] = useState("");
  const [error, setError] = useState("");

  async function loadReservations() {
    try {
      setLoading(true);
      setError("");

      const data = await getReservations(DEFAULT_SHOP_ID);

      setReservations(data);
    } catch (loadError) {
      setError(loadError.message || "Không thể tải danh sách đặt lịch.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadReservations();
  }, []);

  const stats = useMemo(() => {
    return reservations.reduce(
      (result, reservation) => {
        const status = getStatus(reservation);

        result.total += 1;
        result[status] = (result[status] || 0) + 1;

        return result;
      },
      {
        total: 0,
        pending: 0,
        confirmed: 0,
        done: 0,
        cancelled: 0,
      }
    );
  }, [reservations]);

  const filteredReservations = useMemo(() => {
    const search = normalizeSearchText(keyword);

    return reservations.filter((reservation) => {
      const status = getStatus(reservation);
      const matchStatus = statusFilter === "all" || status === statusFilter;

      const searchText = [
        reservation.customerName,
        reservation.phone,
        reservation.reservationDate,
        reservation.reservationTime,
        reservation.note,
        statusMeta[status]?.label,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      const matchKeyword = !search || searchText.includes(search);

      return matchStatus && matchKeyword;
    });
  }, [reservations, statusFilter, keyword]);

  async function handleChangeStatus(reservationId, status) {
    try {
      setUpdatingId(reservationId);
      setError("");

      await updateReservationStatus(DEFAULT_SHOP_ID, reservationId, status);
      await loadReservations();
    } catch (updateError) {
      setError(updateError.message || "Không thể cập nhật trạng thái.");
    } finally {
      setUpdatingId("");
    }
  }

  async function handleDelete(reservationId) {
    const confirmDelete = window.confirm(
      "Bạn có chắc muốn xóa lịch đặt này không?"
    );

    if (!confirmDelete) return;

    try {
      setDeletingId(reservationId);
      setError("");

      await deleteReservation(DEFAULT_SHOP_ID, reservationId);
      await loadReservations();
    } catch (deleteError) {
      setError(deleteError.message || "Không thể xóa lịch đặt.");
    } finally {
      setDeletingId("");
    }
  }

  return (
    <div className="mx-auto w-full max-w-7xl space-y-4">
      <section className="overflow-hidden rounded-[18px] border border-neutral-200 bg-white shadow-sm">
        <div className="relative overflow-hidden bg-neutral-950 p-4 text-white sm:p-5 lg:p-6">
          <div className="absolute -right-12 -top-12 h-40 w-40 rounded-full bg-[#7CAEB8]/20 blur-2xl" />
          <div className="absolute -bottom-16 left-10 h-44 w-44 rounded-full bg-[#B22830]/15 blur-3xl" />

          <div className="relative flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="min-w-0">
              <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-[11px] font-black uppercase tracking-[0.16em] text-white/75 ring-1 ring-white/10">
                <CalendarCheck size={14} className="text-white/75" />
                Reservation manager
              </div>

              <h1 className="mt-3 text-2xl font-black tracking-tight text-white sm:text-3xl">
                Quản lý đặt lịch / đặt bàn
              </h1>

              <p className="mt-2 max-w-2xl text-sm font-medium leading-6 text-white/65">
                Theo dõi thông tin khách đặt bàn, gọi xác nhận nhanh và cập nhật
                trạng thái lịch hẹn ngay trong admin.
              </p>
            </div>

            <button
              type="button"
              onClick={loadReservations}
              disabled={loading}
              className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-[12px] bg-white px-4 text-sm font-black text-neutral-950 shadow-sm transition hover:bg-neutral-100 disabled:cursor-not-allowed disabled:opacity-70 sm:w-auto"
            >
              {loading ? (
                <Loader2 size={16} className="animate-spin text-neutral-950" />
              ) : (
                <RefreshCcw size={16} className="text-neutral-950" />
              )}
              <span>Làm mới dữ liệu</span>
            </button>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        <StatCard
          label="Tổng lịch"
          value={stats.total}
          icon={CalendarCheck}
          tone="neutral"
        />

        <StatCard
          label="Chờ xác nhận"
          value={stats.pending}
          icon={Clock}
          tone="amber"
        />

        <StatCard
          label="Đã xác nhận"
          value={stats.confirmed}
          icon={CheckCircle2}
          tone="green"
        />

        <StatCard
          label="Hoàn tất"
          value={stats.done}
          icon={CheckCircle2}
          tone="blue"
        />
      </section>

      <section className="overflow-hidden rounded-[18px] border border-neutral-200 bg-white shadow-sm">
        <div className="border-b border-neutral-200 bg-white p-3 sm:p-4">
          <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
            <div className="relative min-w-0">
              <Search
                size={18}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400"
              />

              <input
                value={keyword}
                onChange={(event) => setKeyword(event.target.value)}
                placeholder="Tìm theo tên, số điện thoại, ngày giờ, ghi chú..."
                className="h-11 w-full rounded-[12px] border border-neutral-200 bg-neutral-50 pl-10 pr-3 text-sm font-bold text-neutral-900 outline-none transition placeholder:text-neutral-400 focus:border-neutral-950 focus:bg-white"
              />
            </div>

            <div className="hop-hide-scroll -mx-1 flex gap-2 overflow-x-auto px-1 pb-1 lg:mx-0 lg:overflow-visible lg:px-0 lg:pb-0">
              {statusOptions.map((option) => {
                const active = statusFilter === option.value;

                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setStatusFilter(option.value)}
                    className={[
                      "inline-flex h-10 shrink-0 items-center justify-center rounded-full border px-3 text-xs font-black transition sm:px-4",
                      active
                        ? "border-neutral-950 bg-neutral-950 !text-white"
                        : "border-neutral-200 bg-white text-neutral-600 hover:bg-neutral-50",
                    ].join(" ")}
                  >
                    <span className={active ? "text-white" : "text-neutral-600"}>
                      <span className="sm:hidden">{option.shortLabel}</span>
                      <span className="hidden sm:inline">{option.label}</span>
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {error && (
            <p className="mt-3 rounded-[12px] border border-red-100 bg-red-50 px-3 py-2 text-sm font-bold leading-6 text-red-600">
              {error}
            </p>
          )}
        </div>

        <div className="p-3 sm:p-4">
          <div className="mb-3 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm font-black text-neutral-950">
              Danh sách lịch đặt
            </p>

            <p className="text-xs font-bold text-neutral-400">
              Hiển thị {filteredReservations.length}/{reservations.length} lịch
            </p>
          </div>

          {loading ? (
            <LoadingState />
          ) : filteredReservations.length === 0 ? (
            <EmptyState />
          ) : (
            <div className="grid gap-3">
              {filteredReservations.map((reservation) => (
                <ReservationCard
                  key={reservation.id}
                  reservation={reservation}
                  updating={updatingId === reservation.id}
                  deleting={deletingId === reservation.id}
                  onChangeStatus={(status) =>
                    handleChangeStatus(reservation.id, status)
                  }
                  onDelete={() => handleDelete(reservation.id)}
                />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

function StatCard({ label, value, icon: Icon, tone = "neutral" }) {
  const toneMap = {
    neutral: {
      box: "bg-neutral-50 text-neutral-950",
      icon: "bg-white text-neutral-700",
    },
    amber: {
      box: "bg-amber-50 text-amber-700",
      icon: "bg-white text-amber-700",
    },
    green: {
      box: "bg-emerald-50 text-emerald-700",
      icon: "bg-white text-emerald-700",
    },
    blue: {
      box: "bg-blue-50 text-blue-700",
      icon: "bg-white text-blue-700",
    },
  };

  const toneClass = toneMap[tone] || toneMap.neutral;

  return (
    <div className="rounded-[16px] border border-neutral-200 bg-white p-3 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md sm:p-4">
      <div className="flex items-start justify-between gap-2">
        <p className="line-clamp-1 text-[10px] font-black uppercase tracking-[0.08em] text-neutral-400 sm:text-xs">
          {label}
        </p>

        <div
          className={`grid h-8 w-8 shrink-0 place-items-center rounded-[10px] ring-1 ring-neutral-100 ${toneClass.icon}`}
        >
          <Icon size={15} />
        </div>
      </div>

      <p
        className={`mt-3 rounded-[12px] px-3 py-2 text-2xl font-black sm:text-3xl ${toneClass.box}`}
      >
        {value}
      </p>
    </div>
  );
}

function ReservationCard({
  reservation,
  updating,
  deleting,
  onChangeStatus,
  onDelete,
}) {
  const status = getStatus(reservation);
  const meta = statusMeta[status] || statusMeta[RESERVATION_STATUS.PENDING];

  return (
    <article
      className={`overflow-hidden rounded-[16px] border bg-white shadow-sm transition hover:border-neutral-300 hover:shadow-md ${meta.cardClass}`}
    >
      <div className="grid gap-3 bg-white/80 p-3 sm:p-4 xl:grid-cols-[minmax(0,1fr)_auto] xl:items-start">
        <div className="min-w-0">
          <div className="flex min-w-0 flex-wrap items-center gap-2">
            <span className={`h-2.5 w-2.5 rounded-full ${meta.dotClass}`} />

            <h2 className="break-words text-base font-black leading-6 text-neutral-950 sm:text-lg">
              {reservation.customerName || "Khách hàng"}
            </h2>

            <span
              className={`inline-flex shrink-0 rounded-full px-2.5 py-1 text-xs font-black ring-1 ${meta.badgeClass}`}
            >
              {meta.label}
            </span>
          </div>

          <p className="mt-1 break-words text-xs font-bold leading-5 text-neutral-400">
            Gửi lúc: {formatCreatedAt(reservation.createdAt)}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-2 sm:flex sm:shrink-0">
          <a
            href={`tel:${reservation.phone || ""}`}
            className="inline-flex h-10 min-w-0 items-center justify-center gap-2 rounded-[12px] bg-[#2F221C] px-3 text-sm font-black !text-white transition hover:bg-neutral-800"
          >
            <Phone size={15} className="shrink-0 text-white" />
            <span className="truncate text-white">Gọi</span>
          </a>

          <button
            type="button"
            onClick={onDelete}
            disabled={deleting}
            className="inline-flex h-10 min-w-0 items-center justify-center gap-2 rounded-[12px] bg-red-50 px-3 text-sm font-black text-red-600 ring-1 ring-red-100 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {deleting ? (
              <Loader2 size={15} className="shrink-0 animate-spin text-red-600" />
            ) : (
              <Trash2 size={15} className="shrink-0 text-red-600" />
            )}
            <span className="truncate text-red-600">Xóa</span>
          </button>
        </div>
      </div>

      <div className="grid gap-2 border-y border-neutral-100 bg-white p-3 min-[560px]:grid-cols-2 sm:p-4 xl:grid-cols-4">
        <InfoBox
          icon={Phone}
          label="Số điện thoại"
          value={reservation.phone || "Chưa có"}
        />

        <InfoBox
          icon={Users}
          label="Số lượng người"
          value={`${Number(reservation.guestCount || 1)} người`}
        />

        <InfoBox
          icon={CalendarCheck}
          label="Ngày đặt"
          value={formatDate(reservation.reservationDate)}
        />

        <InfoBox
          icon={Clock}
          label="Giờ đặt"
          value={reservation.reservationTime || "Chưa chọn"}
        />
      </div>

      {reservation.note && (
        <div className="bg-white px-3 py-3 sm:px-4">
          <div className="rounded-[14px] border border-neutral-200 bg-neutral-50 p-3">
            <div className="flex items-start gap-2">
              <div className="grid h-8 w-8 shrink-0 place-items-center rounded-[10px] bg-white text-neutral-600 ring-1 ring-neutral-200">
                <MessageSquareText size={15} />
              </div>

              <div className="min-w-0">
                <p className="text-[10px] font-black uppercase tracking-[0.08em] text-neutral-400">
                  Ghi chú
                </p>

                <p className="mt-1 whitespace-pre-line break-words text-sm font-medium leading-6 text-neutral-700">
                  {reservation.note}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="grid gap-2 bg-neutral-50 p-3 sm:p-4 md:grid-cols-3">
        <button
          type="button"
          onClick={() => onChangeStatus(RESERVATION_STATUS.CONFIRMED)}
          disabled={updating || status === RESERVATION_STATUS.CONFIRMED}
          className="inline-flex h-10 min-w-0 items-center justify-center gap-2 rounded-[12px] bg-emerald-600 px-3 text-sm font-black !text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-45"
        >
          {updating ? (
            <Loader2 size={15} className="shrink-0 animate-spin text-white" />
          ) : (
            <CheckCircle2 size={15} className="shrink-0 text-white" />
          )}
          <span className="truncate text-white">Xác nhận</span>
        </button>

        <button
          type="button"
          onClick={() => onChangeStatus(RESERVATION_STATUS.DONE)}
          disabled={updating || status === RESERVATION_STATUS.DONE}
          className="inline-flex h-10 min-w-0 items-center justify-center gap-2 rounded-[12px] bg-blue-600 px-3 text-sm font-black !text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-45"
        >
          {updating ? (
            <Loader2 size={15} className="shrink-0 animate-spin text-white" />
          ) : (
            <CheckCircle2 size={15} className="shrink-0 text-white" />
          )}
          <span className="truncate text-white">Hoàn tất</span>
        </button>

        <button
          type="button"
          onClick={() => onChangeStatus(RESERVATION_STATUS.CANCELLED)}
          disabled={updating || status === RESERVATION_STATUS.CANCELLED}
          className="inline-flex h-10 min-w-0 items-center justify-center gap-2 rounded-[12px] bg-red-600 px-3 text-sm font-black !text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-45"
        >
          {updating ? (
            <Loader2 size={15} className="shrink-0 animate-spin text-white" />
          ) : (
            <XCircle size={15} className="shrink-0 text-white" />
          )}
          <span className="truncate text-white">Hủy lịch</span>
        </button>
      </div>
    </article>
  );
}

function InfoBox({ icon: Icon, label, value }) {
  return (
    <div className="min-w-0 rounded-[14px] border border-neutral-200 bg-neutral-50 p-3">
      <div className="flex min-w-0 items-start gap-2">
        <div className="grid h-9 w-9 shrink-0 place-items-center rounded-[11px] bg-white text-[#7CAEB8] ring-1 ring-neutral-200">
          <Icon size={16} className="text-[#7CAEB8]" />
        </div>

        <div className="min-w-0">
          <p className="line-clamp-1 text-[10px] font-black uppercase tracking-[0.08em] text-neutral-400">
            {label}
          </p>

          <p className="mt-1 break-words text-sm font-black leading-5 text-neutral-950">
            {value}
          </p>
        </div>
      </div>
    </div>
  );
}

function LoadingState() {
  return (
    <div className="grid gap-3">
      {Array.from({ length: 4 }).map((_, index) => (
        <div
          key={index}
          className="h-48 animate-pulse rounded-[16px] border border-neutral-200 bg-neutral-50"
        />
      ))}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="rounded-[16px] border border-dashed border-neutral-200 bg-neutral-50 px-5 py-12 text-center">
      <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-white text-neutral-400 ring-1 ring-neutral-200">
        <UserRound size={30} />
      </div>

      <p className="mt-3 text-base font-black text-neutral-800">
        Chưa có lịch đặt nào
      </p>

      <p className="mx-auto mt-1 max-w-sm text-sm leading-6 text-neutral-500">
        Khi khách gửi yêu cầu đặt bàn, thông tin sẽ hiển thị tại đây.
      </p>
    </div>
  );
}