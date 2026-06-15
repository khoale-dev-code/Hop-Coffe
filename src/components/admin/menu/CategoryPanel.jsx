import { Edit, FolderPlus, Loader2, Plus, Trash } from "lucide-react";

import { cn } from "../../../utils/admin/menuItemUtils";

export default function CategoryPanel({
  categories,
  itemCountByCategory,
  newCategoryName,
  setNewCategoryName,
  categorySubmitting,
  editingCategoryId,
  editingCategoryName,
  setEditingCategoryName,
  onCreateCategory,
  onStartEdit,
  onCancelEdit,
  onUpdateCategory,
  onToggleCategory,
  onDeleteCategory,
}) {
  return (
    <section className="rounded-[12px] border border-neutral-200 bg-white p-3 shadow-sm sm:p-5">
      <div className="flex items-start justify-between gap-3 border-b border-neutral-200 pb-4">
        <div className="min-w-0">
          <h2 className="text-xl font-black text-neutral-950">Danh mục</h2>

          <p className="mt-1 text-sm leading-6 text-neutral-500">
            Tạo nhóm món để khách lọc menu dễ hơn.
          </p>
        </div>

        <div className="grid h-11 w-11 shrink-0 place-items-center rounded-[8px] bg-neutral-100 text-neutral-700">
          <FolderPlus size={21} />
        </div>
      </div>

      <form
        onSubmit={onCreateCategory}
        className="mt-4 grid gap-2 min-[430px]:grid-cols-[1fr_52px]"
      >
        <input
          value={newCategoryName}
          onChange={(event) => setNewCategoryName(event.target.value)}
          placeholder="Cà phê, Trà sữa..."
          className="h-12 min-w-0 rounded-[8px] border border-neutral-200 bg-white px-4 text-sm font-bold text-neutral-900 outline-none transition placeholder:text-neutral-400 focus:border-neutral-950"
        />

        <button
          type="submit"
          disabled={categorySubmitting}
          className="inline-flex h-12 items-center justify-center gap-2 rounded-[8px] bg-neutral-950 px-4 text-sm font-black uppercase tracking-[0.08em] text-white transition hover:bg-neutral-800 disabled:opacity-60 min-[430px]:px-0"
        >
          {categorySubmitting ? (
            <Loader2 size={20} className="animate-spin" />
          ) : (
            <Plus size={20} />
          )}

          <span className="min-[430px]:hidden">Thêm danh mục</span>
        </button>
      </form>

      <div className="mt-4 space-y-3">
        {categories.length === 0 && (
          <div className="rounded-[10px] border border-dashed border-neutral-300 bg-neutral-50 p-5 text-center">
            <div className="mx-auto grid h-11 w-11 place-items-center rounded-[8px] bg-white text-neutral-500 ring-1 ring-neutral-200">
              <FolderPlus size={22} />
            </div>

            <p className="mt-3 text-sm font-bold text-neutral-500">
              Chưa có danh mục.
            </p>
          </div>
        )}

        {categories.map((category, index) => {
          const isEditing = editingCategoryId === category.id;
          const isActive = category.isActive !== false;
          const itemCount = itemCountByCategory[category.id] || 0;

          return (
            <div
              key={category.id}
              className="rounded-[12px] border border-neutral-200 bg-white p-3 shadow-sm transition hover:border-neutral-300 hover:shadow-md"
            >
              {isEditing ? (
                <EditCategoryForm
                  value={editingCategoryName}
                  setValue={setEditingCategoryName}
                  onSave={() => onUpdateCategory(category.id)}
                  onCancel={onCancelEdit}
                />
              ) : (
                <div className="flex flex-col gap-3 min-[430px]:flex-row min-[430px]:items-center min-[430px]:justify-between">
                  <div className="min-w-0">
                    <div className="flex items-start gap-2">
                      <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-neutral-950 text-xs font-black text-white">
                        {index + 1}
                      </span>

                      <div className="min-w-0">
                        <p className="line-clamp-1 font-black text-neutral-950">
                          {category.name}
                        </p>

                        <p className="mt-1 text-xs font-bold text-neutral-400">
                          {itemCount} món
                        </p>
                      </div>
                    </div>

                    <div className="mt-3 flex flex-wrap gap-2">
                      <span
                        className={cn(
                          "rounded-[7px] px-2.5 py-1 text-xs font-black",
                          isActive
                            ? "bg-green-50 text-green-700"
                            : "bg-neutral-100 text-neutral-500"
                        )}
                      >
                        {isActive ? "Đang hiển thị" : "Đang ẩn"}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-[1fr_44px_44px] gap-2 min-[430px]:w-auto min-[430px]:grid-cols-[auto_40px_40px]">
                    <button
                      type="button"
                      onClick={() => onToggleCategory(category)}
                      className={cn(
                        "h-10 rounded-[8px] px-3 text-xs font-black uppercase tracking-[0.06em] transition",
                        isActive
                          ? "bg-green-50 text-green-700 hover:bg-green-100"
                          : "bg-neutral-100 text-neutral-500 hover:bg-neutral-200"
                      )}
                    >
                      {isActive ? "Hiện" : "Ẩn"}
                    </button>

                    <button
                      type="button"
                      onClick={() => onStartEdit(category)}
                      className="grid h-10 w-11 place-items-center rounded-[8px] bg-neutral-100 text-neutral-700 transition hover:bg-neutral-200 min-[430px]:w-10"
                      aria-label="Sửa danh mục"
                    >
                      <Edit size={15} />
                    </button>

                    <button
                      type="button"
                      onClick={() => onDeleteCategory(category.id)}
                      className="grid h-10 w-11 place-items-center rounded-[8px] bg-red-50 text-red-600 transition hover:bg-red-100 min-[430px]:w-10"
                      aria-label="Xóa danh mục"
                    >
                      <Trash size={15} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}

function EditCategoryForm({ value, setValue, onSave, onCancel }) {
  return (
    <div className="space-y-3">
      <div>
        <label className="text-xs font-black uppercase tracking-[0.12em] text-neutral-400">
          Sửa tên danh mục
        </label>

        <input
          value={value}
          onChange={(event) => setValue(event.target.value)}
          className="mt-2 h-12 w-full rounded-[8px] border border-neutral-200 bg-white px-4 text-sm font-bold text-neutral-900 outline-none transition focus:border-neutral-950"
          autoFocus
        />
      </div>

      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={onSave}
          className="h-11 rounded-[8px] bg-neutral-950 px-3 text-sm font-black uppercase tracking-[0.08em] text-white transition hover:bg-neutral-800"
        >
          Lưu
        </button>

        <button
          type="button"
          onClick={onCancel}
          className="h-11 rounded-[8px] bg-white px-3 text-sm font-black uppercase tracking-[0.08em] text-neutral-600 ring-1 ring-neutral-200 transition hover:bg-neutral-50"
        >
          Hủy
        </button>
      </div>
    </div>
  );
}