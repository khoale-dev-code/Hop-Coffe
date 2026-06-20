import { useEffect, useMemo, useState } from "react";
import {
  CalendarDays,
  CheckCircle2,
  Clock,
  Loader2,
  MessageSquare,
  Phone,
  UserRound,
  Users,
  X,
} from "lucide-react";

import { createReservation } from "../../../services/reservationService";

function getTodayValue() {
  const now = new Date();
  const offset = now.getTimezoneOffset();
  const localDate = new Date(now.getTime() - offset * 60 * 1000);

  return localDate.toISOString().slice(0, 10);
}

const initialForm = {
  customerName: "",
  phone: "",
  guestCount: 2,
  reservationDate: getTodayValue(),
  reservationTime: "",
  note: "",
};

export default function ReservationModal({ open, shop, onClose }) {
  const [form, setForm] = useState(initialForm);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const today = useMemo(() => getTodayValue(), []);

  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;

    function handleKeyDown(event) {
      if (event.key === "Escape" && !submitting) {
        onClose();
      }
    }

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, submitting, onClose]);

  useEffect(() => {
    if (!open) return;

    setError("");
    setSuccess(false);
  }, [open]);

  if (!open) return null;

  function updateForm(field, value) {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));

    setError("");
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (!shop?.id) {
      setError("Không tìm thấy thông tin quán để tạo đặt lịch.");
      return;
    }

    try {
      setSubmitting(true);
      setError("");

      await createReservation(shop.id, form);

      setSuccess(true);
      setForm({
        ...initialForm,
        reservationDate: getTodayValue(),
      });
    } catch (submitError) {
      setError(submitError.message || "Không thể gửi đặt lịch. Vui lòng thử lại.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[130] flex items-end justify-center bg-black/55 px-0 backdrop-blur-sm sm:items-center sm:p-4">
      <button
        type="button"
        onClick={onClose}
        disabled={submitting}
        className="absolute inset-0 cursor-default disabled:cursor-not-allowed"
        aria-label="Đóng đặt lịch"
      />

      <div className="relative z-10 flex max-h-[92dvh] w-full flex-col overflow-hidden rounded-t-[18px] bg-white shadow-2xl sm:max-h-[90vh] sm:max-w-[520px] sm:rounded-[16px]">
        <div className="flex min-h-[58px] items-center justify-between gap-3 border-b border-neutral-200 bg-white px-3 py-2.5 sm:px-4">
          <div className="min-w-0">
            <p className="text-[10px] font-black uppercase tracking-[0.16em] text-[#7CAEB8]">
              Đặt lịch
            </p>

            <h2 className="truncate text-base font-black text-[#2F221C] sm:text-lg">
              {shop?.name || "Hớp Cafe"}
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="grid h-9 w-9 shrink-0 place-items-center rounded-[9px] bg-neutral-100 text-[#2F221C] transition hover:bg-neutral-200 disabled:cursor-not-allowed disabled:opacity-50"
            aria-label="Đóng popup"
          >
            <X size={18} />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto bg-[#F8F2EA] p-3">
          {success ? (
            <div className="rounded-[14px] border border-emerald-100 bg-white p-5 text-center shadow-sm">
              <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-emerald-50 text-emerald-700">
                <CheckCircle2 size={30} />
              </div>

              <h3 className="mt-4 text-lg font-black text-[#2F221C]">
                Đã gửi yêu cầu đặt lịch
              </h3>

              <p className="mt-2 text-sm font-medium leading-6 text-[#73584D]">
                Quán sẽ kiểm tra và liên hệ lại với bạn qua số điện thoại đã cung
                cấp.
              </p>

              <button
                type="button"
                onClick={onClose}
                className="mt-5 inline-flex w-full items-center justify-center rounded-[10px] bg-[#2F221C] px-5 py-3 text-sm font-black text-white transition hover:bg-[#6B4B3E]"
              >
                Đóng
              </button>
            </div>
          ) : (
            <form
              onSubmit={handleSubmit}
              className="space-y-3 rounded-[14px] border border-[#EEE3D8] bg-white p-3 shadow-sm sm:p-4"
            >
              <Field label="Họ tên" icon={UserRound}>
                <input
                  value={form.customerName}
                  onChange={(event) =>
                    updateForm("customerName", event.target.value)
                  }
                  placeholder="Nhập tên của bạn"
                  className="h-11 w-full rounded-[10px] border border-neutral-200 bg-white px-3 text-sm font-bold text-[#2F221C] outline-none transition placeholder:text-neutral-400 focus:border-[#7CAEB8] focus:ring-2 focus:ring-[#7CAEB8]/20"
                />
              </Field>

              <Field label="Số điện thoại" icon={Phone}>
                <input
                  value={form.phone}
                  onChange={(event) => updateForm("phone", event.target.value)}
                  placeholder="Ví dụ: 0901234567"
                  inputMode="tel"
                  className="h-11 w-full rounded-[10px] border border-neutral-200 bg-white px-3 text-sm font-bold text-[#2F221C] outline-none transition placeholder:text-neutral-400 focus:border-[#7CAEB8] focus:ring-2 focus:ring-[#7CAEB8]/20"
                />
              </Field>

              <div className="grid gap-3 min-[430px]:grid-cols-2">
                <Field label="Số lượng người" icon={Users}>
                  <input
                    value={form.guestCount}
                    onChange={(event) =>
                      updateForm("guestCount", event.target.value)
                    }
                    type="number"
                    min="1"
                    max="100"
                    inputMode="numeric"
                    className="h-11 w-full rounded-[10px] border border-neutral-200 bg-white px-3 text-sm font-bold text-[#2F221C] outline-none transition focus:border-[#7CAEB8] focus:ring-2 focus:ring-[#7CAEB8]/20"
                  />
                </Field>

                <Field label="Ngày đặt" icon={CalendarDays}>
                  <input
                    value={form.reservationDate}
                    onChange={(event) =>
                      updateForm("reservationDate", event.target.value)
                    }
                    type="date"
                    min={today}
                    className="h-11 w-full rounded-[10px] border border-neutral-200 bg-white px-3 text-sm font-bold text-[#2F221C] outline-none transition focus:border-[#7CAEB8] focus:ring-2 focus:ring-[#7CAEB8]/20"
                  />
                </Field>
              </div>

              <Field label="Giờ đặt" icon={Clock}>
                <input
                  value={form.reservationTime}
                  onChange={(event) =>
                    updateForm("reservationTime", event.target.value)
                  }
                  type="time"
                  className="h-11 w-full rounded-[10px] border border-neutral-200 bg-white px-3 text-sm font-bold text-[#2F221C] outline-none transition focus:border-[#7CAEB8] focus:ring-2 focus:ring-[#7CAEB8]/20"
                />
              </Field>

              <Field label="Ghi chú" icon={MessageSquare}>
                <textarea
                  value={form.note}
                  onChange={(event) => updateForm("note", event.target.value)}
                  placeholder="Ví dụ: cần bàn gần cửa sổ, có trẻ em đi cùng..."
                  rows={3}
                  className="min-h-[92px] w-full resize-none rounded-[10px] border border-neutral-200 bg-white px-3 py-3 text-sm font-medium leading-6 text-[#2F221C] outline-none transition placeholder:text-neutral-400 focus:border-[#7CAEB8] focus:ring-2 focus:ring-[#7CAEB8]/20"
                />
              </Field>

              {error && (
                <p className="rounded-[10px] border border-red-100 bg-red-50 px-3 py-2 text-sm font-bold leading-6 text-red-600">
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-[10px] bg-[#2F221C] px-5 py-3 text-sm font-black text-white transition hover:bg-[#6B4B3E] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitting ? (
                  <>
                    <Loader2 size={17} className="animate-spin" />
                    Đang gửi...
                  </>
                ) : (
                  "Gửi yêu cầu đặt lịch"
                )}
              </button>

              <p className="text-center text-xs font-medium leading-5 text-[#73584D]">
                Đây là yêu cầu đặt lịch. Quán sẽ xác nhận lại qua điện thoại.
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

function Field({ label, icon: Icon, children }) {
  return (
    <label className="block">
      <span className="mb-1.5 flex items-center gap-1.5 text-xs font-black uppercase tracking-[0.08em] text-[#73584D]">
        <Icon size={14} />
        {label}
      </span>

      {children}
    </label>
  );
}