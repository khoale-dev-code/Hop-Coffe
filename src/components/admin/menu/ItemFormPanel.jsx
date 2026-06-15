import {
  ImagePlus,
  Loader2,
  Plus,
  Save,
  Trash,
  Upload,
  X,
} from "lucide-react";

export default function ItemFormPanel({
  categories,
  itemForm,
  updateItemForm,
  editingItemId,
  imageFile,
  setImageFile,
  imagePreviewUrl,
  itemSubmitting,
  onSubmit,
  onReset,
  onAddSize,
  onUpdateSize,
  onRemoveSize,
}) {
  return (
    <section className="rounded-[12px] border border-neutral-200 bg-white p-3 shadow-sm sm:p-5">
      <div className="flex items-start justify-between gap-3 border-b border-neutral-200 pb-4">
        <div className="min-w-0">
          <h2 className="text-xl font-black text-neutral-950">
            {editingItemId ? "Sửa món" : "Thêm món mới"}
          </h2>

          <p className="mt-1 text-sm leading-6 text-neutral-500">
            Nhập thông tin món, giá bán, ảnh và size nếu món có nhiều lựa chọn.
          </p>
        </div>

        {editingItemId && (
          <button
            type="button"
            onClick={onReset}
            className="grid h-10 w-10 shrink-0 place-items-center rounded-[8px] bg-neutral-100 text-neutral-600 transition hover:bg-neutral-200"
            aria-label="Hủy sửa món"
          >
            <X size={18} />
          </button>
        )}
      </div>

      <form onSubmit={onSubmit} className="mt-4 space-y-4">
        <FormSection title="Thông tin cơ bản">
          <FormInput
            label="Tên món"
            value={itemForm.name}
            onChange={(value) => updateItemForm("name", value)}
            placeholder="Bạc xỉu đá"
            required
          />

          <div>
            <label className="text-sm font-black text-neutral-800">
              Danh mục
            </label>

            <select
              value={itemForm.categoryId}
              onChange={(event) =>
                updateItemForm("categoryId", event.target.value)
              }
              className="mt-2 h-12 w-full rounded-[8px] border border-neutral-200 bg-white px-4 text-sm font-bold text-neutral-900 outline-none transition focus:border-neutral-950"
              required
            >
              <option value="">Chọn danh mục</option>

              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          <div className="grid gap-3 min-[430px]:grid-cols-2">
            <FormInput
              label="Giá mặc định"
              type="number"
              value={itemForm.price}
              onChange={(value) => updateItemForm("price", value)}
              placeholder="Dùng khi món không có size"
            />

            <FormInput
              label="Giá cũ"
              type="number"
              value={itemForm.oldPrice}
              onChange={(value) => updateItemForm("oldPrice", value)}
              placeholder="30000"
            />
          </div>
        </FormSection>

        <SizeEditor
          sizes={itemForm.sizes || []}
          onAddSize={onAddSize}
          onUpdateSize={onUpdateSize}
          onRemoveSize={onRemoveSize}
        />

        <FormSection title="Mô tả và hình ảnh">
          <div>
            <label className="text-sm font-black text-neutral-800">Mô tả</label>

            <textarea
              value={itemForm.description}
              onChange={(event) =>
                updateItemForm("description", event.target.value)
              }
              rows={4}
              placeholder="Mô tả ngắn về món..."
              className="mt-2 w-full resize-none rounded-[8px] border border-neutral-200 bg-white px-4 py-3 text-sm font-medium text-neutral-900 outline-none transition placeholder:text-neutral-400 focus:border-neutral-950"
            />
          </div>

          <FormInput
            label="Image URL"
            value={itemForm.imageUrl}
            onChange={(value) => {
              setImageFile(null);
              updateItemForm("imageUrl", value);
            }}
            placeholder="Dán link ảnh hoặc upload bên dưới"
          />

          <div className="grid gap-3 sm:grid-cols-[150px_1fr]">
            <div className="overflow-hidden rounded-[10px] border border-neutral-200 bg-neutral-50">
              {imagePreviewUrl ? (
                <img
                  src={imagePreviewUrl}
                  alt="Preview món"
                  className="h-44 w-full object-cover sm:h-full sm:min-h-[150px]"
                />
              ) : (
                <div className="grid h-44 place-items-center text-neutral-400 sm:h-full sm:min-h-[150px]">
                  <div className="text-center">
                    <ImagePlus size={34} className="mx-auto" />
                    <p className="mt-2 text-xs font-bold">Chưa có ảnh</p>
                  </div>
                </div>
              )}
            </div>

            <label className="flex min-h-[150px] cursor-pointer flex-col items-center justify-center rounded-[10px] border border-dashed border-neutral-300 bg-neutral-50 p-4 text-center transition hover:bg-neutral-100">
              <Upload className="text-neutral-400" size={28} />

              <p className="mt-3 line-clamp-2 text-sm font-black text-neutral-900">
                {imageFile ? imageFile.name : "Upload ảnh món"}
              </p>

              <p className="mt-1 max-w-xs text-xs leading-5 text-neutral-400">
                Ảnh upload sẽ thay Image URL hiện tại. Nên dùng ảnh vuông hoặc
                ảnh rõ nền.
              </p>

              <input
                type="file"
                accept="image/*"
                onChange={(event) =>
                  setImageFile(event.target.files?.[0] || null)
                }
                className="hidden"
              />
            </label>
          </div>

          <FormInput
            label="Tags"
            value={itemForm.tagsText}
            onChange={(value) => updateItemForm("tagsText", value)}
            placeholder="best seller, đá xay, topping"
          />
        </FormSection>

        <FormSection title="Trạng thái hiển thị">
          <div className="grid gap-3 min-[430px]:grid-cols-2">
            <ToggleCard
              label="Món còn bán"
              description="Khách vẫn nhìn thấy và có thể chọn món này."
              checked={itemForm.isAvailable}
              onChange={(checked) => updateItemForm("isAvailable", checked)}
            />

            <ToggleCard
              label="Món nổi bật"
              description="Hiển thị trong khu vực sản phẩm nổi bật."
              checked={itemForm.isFeatured}
              onChange={(checked) => updateItemForm("isFeatured", checked)}
            />
          </div>
        </FormSection>

        <div className="sticky bottom-3 z-10 rounded-[12px] bg-white/95 pt-2 backdrop-blur sm:static sm:bg-transparent sm:pt-0">
          <button
            type="submit"
            disabled={itemSubmitting}
            className="inline-flex w-full items-center justify-center gap-2 rounded-[8px] bg-neutral-950 px-4 py-4 text-sm font-black uppercase tracking-[0.08em] text-white shadow-[0_12px_26px_rgba(0,0,0,0.16)] transition hover:bg-neutral-800 disabled:opacity-60 sm:py-3 sm:shadow-none"
          >
            {itemSubmitting ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <Save size={18} />
            )}

            {itemSubmitting
              ? "Đang lưu..."
              : editingItemId
                ? "Cập nhật món"
                : "Thêm món vào menu"}
          </button>
        </div>
      </form>
    </section>
  );
}

function FormSection({ title, children }) {
  return (
    <div className="rounded-[12px] border border-neutral-200 bg-white p-3 sm:p-4">
      <p className="mb-4 text-sm font-black text-neutral-950">{title}</p>

      <div className="space-y-4">{children}</div>
    </div>
  );
}

function SizeEditor({ sizes, onAddSize, onUpdateSize, onRemoveSize }) {
  return (
    <div className="rounded-[12px] border border-neutral-200 bg-neutral-50 p-3 sm:p-4">
      <div className="flex flex-col gap-3 min-[430px]:flex-row min-[430px]:items-start min-[430px]:justify-between">
        <div>
          <p className="text-sm font-black text-neutral-950">
            Size và giá từng size
          </p>

          <p className="mt-1 text-xs leading-5 text-neutral-500">
            Không bắt buộc. Nếu món có nhiều size, thêm từng size và nhập giá
            riêng cho từng ly.
          </p>
        </div>

        <button
          type="button"
          onClick={onAddSize}
          className="inline-flex w-full shrink-0 items-center justify-center gap-2 rounded-[8px] bg-neutral-950 px-3 py-2.5 text-xs font-black uppercase tracking-[0.08em] text-white transition hover:bg-neutral-800 min-[430px]:w-auto"
        >
          <Plus size={14} />
          Thêm size
        </button>
      </div>

      {sizes.length === 0 ? (
        <div className="mt-4 rounded-[10px] border border-dashed border-neutral-300 bg-white p-4 text-sm leading-6 text-neutral-500">
          Chưa thêm size. Món sẽ dùng giá mặc định bên trên.
        </div>
      ) : (
        <div className="mt-4 space-y-3">
          {sizes.map((size, index) => (
            <div
              key={size.id}
              className="rounded-[10px] border border-neutral-200 bg-white p-3 shadow-sm"
            >
              <div className="mb-3 flex items-center justify-between gap-3 border-b border-neutral-100 pb-3">
                <p className="text-xs font-black uppercase tracking-[0.12em] text-neutral-400">
                  Size {index + 1}
                </p>

                <button
                  type="button"
                  onClick={() => onRemoveSize(size.id)}
                  className="grid h-9 w-9 place-items-center rounded-[8px] bg-red-50 text-red-600 transition hover:bg-red-100"
                  aria-label="Xóa size"
                >
                  <Trash size={14} />
                </button>
              </div>

              <div className="grid gap-3 min-[430px]:grid-cols-2">
                <Field
                  label="Tên size"
                  value={size.name}
                  onChange={(value) => onUpdateSize(size.id, "name", value)}
                  placeholder="M, L, XL..."
                />

                <Field
                  label="Giá size"
                  type="number"
                  value={size.price}
                  onChange={(value) => onUpdateSize(size.id, "price", value)}
                  placeholder="29000"
                />

                <Field
                  label="Giá cũ của size"
                  type="number"
                  value={size.oldPrice}
                  onChange={(value) => onUpdateSize(size.id, "oldPrice", value)}
                  placeholder="35000"
                />

                <Field
                  label="Ghi chú size"
                  value={size.description}
                  onChange={(value) =>
                    onUpdateSize(size.id, "description", value)
                  }
                  placeholder="500ml, 700ml..."
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function ToggleCard({ label, description, checked, onChange }) {
  return (
    <label className="flex cursor-pointer items-start gap-3 rounded-[10px] border border-neutral-200 bg-white p-3 transition hover:border-neutral-300">
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="mt-0.5 h-5 w-5 shrink-0"
      />

      <span>
        <span className="block text-sm font-black text-neutral-950">
          {label}
        </span>

        <span className="mt-1 block text-xs leading-5 text-neutral-500">
          {description}
        </span>
      </span>
    </label>
  );
}

function Field({ label, value, onChange, placeholder, type = "text" }) {
  return (
    <div>
      <label className="text-xs font-black text-neutral-600">{label}</label>

      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="mt-1.5 h-11 w-full rounded-[8px] border border-neutral-200 bg-white px-3 text-sm font-bold text-neutral-900 outline-none transition placeholder:text-neutral-400 focus:border-neutral-950"
      />
    </div>
  );
}

function FormInput({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  required = false,
}) {
  return (
    <div>
      <label className="text-sm font-black text-neutral-800">{label}</label>

      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        required={required}
        className="mt-2 h-12 w-full rounded-[8px] border border-neutral-200 bg-white px-4 text-sm font-bold text-neutral-900 outline-none transition placeholder:text-neutral-400 focus:border-neutral-950"
      />
    </div>
  );
}