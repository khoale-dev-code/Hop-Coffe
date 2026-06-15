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
    <section className="rounded-[16px] border border-neutral-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-xl font-black">
            {editingItemId ? "Sửa món" : "Thêm món mới"}
          </h2>

          <p className="mt-1 text-sm text-neutral-500">
            Size là không bắt buộc, nhưng nếu thêm size thì mỗi size cần có giá
            riêng.
          </p>
        </div>

        {editingItemId && (
          <button
            type="button"
            onClick={onReset}
            className="grid h-10 w-10 place-items-center rounded-[10px] bg-neutral-100 text-neutral-600"
          >
            <X size={18} />
          </button>
        )}
      </div>

      <form onSubmit={onSubmit} className="mt-5 space-y-4">
        <FormInput
          label="Tên món"
          value={itemForm.name}
          onChange={(value) => updateItemForm("name", value)}
          placeholder="Bạc xỉu đá"
          required
        />

        <div>
          <label className="text-sm font-bold">Danh mục</label>
          <select
            value={itemForm.categoryId}
            onChange={(event) => updateItemForm("categoryId", event.target.value)}
            className="mt-2 w-full rounded-[10px] border border-neutral-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-neutral-950"
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

        <div className="grid grid-cols-2 gap-3">
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

        <SizeEditor
          sizes={itemForm.sizes || []}
          onAddSize={onAddSize}
          onUpdateSize={onUpdateSize}
          onRemoveSize={onRemoveSize}
        />

        <div>
          <label className="text-sm font-bold">Mô tả</label>
          <textarea
            value={itemForm.description}
            onChange={(event) =>
              updateItemForm("description", event.target.value)
            }
            rows={3}
            placeholder="Mô tả ngắn về món..."
            className="mt-2 w-full rounded-[10px] border border-neutral-200 px-4 py-3 text-sm outline-none transition focus:border-neutral-950"
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

        <div className="grid gap-3 sm:grid-cols-[130px_1fr]">
          <div className="overflow-hidden rounded-[12px] border border-neutral-200 bg-neutral-50">
            {imagePreviewUrl ? (
              <img
                src={imagePreviewUrl}
                alt="Preview món"
                className="h-32 w-full object-cover"
              />
            ) : (
              <div className="grid h-32 place-items-center text-neutral-400">
                <ImagePlus size={30} />
              </div>
            )}
          </div>

          <label className="grid cursor-pointer place-items-center rounded-[12px] border border-dashed border-neutral-300 bg-neutral-50 p-4 text-center hover:bg-neutral-100">
            <Upload className="mx-auto text-neutral-400" />

            <p className="mt-2 text-sm font-bold">
              {imageFile ? imageFile.name : "Upload ảnh món"}
            </p>

            <p className="mt-1 text-xs text-neutral-400">
              Ảnh upload sẽ thay Image URL hiện tại
            </p>

            <input
              type="file"
              accept="image/*"
              onChange={(event) => setImageFile(event.target.files?.[0] || null)}
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

        <div className="grid gap-3 sm:grid-cols-2">
          <label className="flex items-center gap-3 rounded-[10px] bg-neutral-50 p-3">
            <input
              type="checkbox"
              checked={itemForm.isAvailable}
              onChange={(event) =>
                updateItemForm("isAvailable", event.target.checked)
              }
              className="h-5 w-5"
            />

            <span className="text-sm font-bold">Món còn bán</span>
          </label>

          <label className="flex items-center gap-3 rounded-[10px] bg-neutral-50 p-3">
            <input
              type="checkbox"
              checked={itemForm.isFeatured}
              onChange={(event) =>
                updateItemForm("isFeatured", event.target.checked)
              }
              className="h-5 w-5"
            />

            <span className="text-sm font-bold">Món nổi bật</span>
          </label>
        </div>

        <button
          type="submit"
          disabled={itemSubmitting}
          className="inline-flex w-full items-center justify-center gap-2 rounded-[10px] bg-neutral-950 px-4 py-3 text-sm font-bold text-white transition hover:bg-neutral-800 disabled:opacity-60"
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
      </form>
    </section>
  );
}

function SizeEditor({ sizes, onAddSize, onUpdateSize, onRemoveSize }) {
  return (
    <div className="rounded-[12px] border border-neutral-200 bg-neutral-50 p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-black">Size và giá từng size</p>

          <p className="mt-1 text-xs leading-5 text-neutral-500">
            Không bắt buộc. Nếu món có nhiều size, thêm từng size và nhập giá
            riêng cho từng ly.
          </p>
        </div>

        <button
          type="button"
          onClick={onAddSize}
          className="inline-flex shrink-0 items-center gap-2 rounded-[9px] bg-neutral-950 px-3 py-2 text-xs font-black text-white"
        >
          <Plus size={14} />
          Thêm size
        </button>
      </div>

      {sizes.length === 0 ? (
        <div className="mt-4 rounded-[10px] border border-dashed border-neutral-300 bg-white p-4 text-sm text-neutral-500">
          Chưa thêm size. Món sẽ dùng giá mặc định bên trên.
        </div>
      ) : (
        <div className="mt-4 space-y-3">
          {sizes.map((size, index) => (
            <div
              key={size.id}
              className="rounded-[10px] border border-neutral-200 bg-white p-3"
            >
              <div className="mb-3 flex items-center justify-between gap-3">
                <p className="text-xs font-black uppercase tracking-[0.12em] text-neutral-400">
                  Size {index + 1}
                </p>

                <button
                  type="button"
                  onClick={() => onRemoveSize(size.id)}
                  className="grid h-8 w-8 place-items-center rounded-[8px] bg-red-50 text-red-600"
                >
                  <Trash size={14} />
                </button>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
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

function Field({ label, value, onChange, placeholder, type = "text" }) {
  return (
    <div>
      <label className="text-xs font-bold text-neutral-600">{label}</label>

      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="mt-1.5 w-full rounded-[9px] border border-neutral-200 px-3 py-2.5 text-sm outline-none transition focus:border-neutral-950"
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
      <label className="text-sm font-bold">{label}</label>

      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        required={required}
        className="mt-2 w-full rounded-[10px] border border-neutral-200 px-4 py-3 text-sm outline-none transition focus:border-neutral-950"
      />
    </div>
  );
}