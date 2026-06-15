export default function Notice({ message, error, savingOrder }) {
  if (!message && !error && !savingOrder) return null;

  return (
    <div className="mt-5 space-y-3">
      {message && (
        <div className="rounded-[10px] border border-green-100 bg-green-50 px-4 py-3 text-sm font-semibold text-green-700">
          {message}
        </div>
      )}

      {error && (
        <div className="rounded-[10px] border border-red-100 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
          {error}
        </div>
      )}

      {savingOrder && (
        <div className="rounded-[10px] border border-blue-100 bg-blue-50 px-4 py-3 text-sm font-semibold text-blue-700">
          Đang lưu thứ tự món...
        </div>
      )}
    </div>
  );
}