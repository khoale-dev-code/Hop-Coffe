import {
  Edit,
  FolderPlus,
  Loader2,
  Plus,
  Trash,
} from "lucide-react";

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
    <section className="rounded-[16px] border border-neutral-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-xl font-black">Danh mục</h2>
          <p className="mt-1 text-sm text-neutral-500">
            Tạo nhóm món để khách lọc menu dễ hơn.
          </p>
        </div>

        <div className="grid h-11 w-11 place-items-center rounded-[10px] bg-neutral-100 text-neutral-700">
          <FolderPlus size={21} />
        </div>
      </div>

      <form onSubmit={onCreateCategory} className="mt-4 flex gap-2">
        <input
          value={newCategoryName}
          onChange={(event) => setNewCategoryName(event.target.value)}
          placeholder="Cà phê, Trà sữa..."
          className="min-w-0 flex-1 rounded-[10px] border border-neutral-200 px-4 py-3 text-sm outline-none transition focus:border-neutral-950"
        />

        <button
          type="submit"
          disabled={categorySubmitting}
          className="grid h-12 w-12 place-items-center rounded-[10px] bg-neutral-950 text-white disabled:opacity-60"
        >
          {categorySubmitting ? (
            <Loader2 size={20} className="animate-spin" />
          ) : (
            <Plus size={20} />
          )}
        </button>
      </form>

      <div className="mt-4 space-y-2">
        {categories.length === 0 && (
          <p className="rounded-[10px] bg-neutral-50 p-4 text-sm text-neutral-500">
            Chưa có danh mục.
          </p>
        )}

        {categories.map((category) => {
          const isEditing = editingCategoryId === category.id;

          return (
            <div
              key={category.id}
              className="rounded-[12px] border border-neutral-100 bg-neutral-50 p-3"
            >
              {isEditing ? (
                <div className="space-y-3">
                  <input
                    value={editingCategoryName}
                    onChange={(event) =>
                      setEditingCategoryName(event.target.value)
                    }
                    className="w-full rounded-[10px] border border-neutral-200 bg-white px-3 py-2.5 text-sm font-semibold outline-none focus:border-neutral-950"
                  />

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => onUpdateCategory(category.id)}
                      className="rounded-[10px] bg-neutral-950 px-3 py-2.5 text-sm font-bold text-white"
                    >
                      Lưu
                    </button>

                    <button
                      type="button"
                      onClick={onCancelEdit}
                      className="rounded-[10px] bg-white px-3 py-2.5 text-sm font-bold text-neutral-600 ring-1 ring-neutral-200"
                    >
                      Hủy
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate font-black">{category.name}</p>

                    <p className="mt-1 text-xs font-medium text-neutral-400">
                      {itemCountByCategory[category.id] || 0} món ·{" "}
                      {category.isActive ? "Đang hiển thị" : "Đang ẩn"}
                    </p>
                  </div>

                  <div className="flex shrink-0 gap-2">
                    <button
                      type="button"
                      onClick={() => onToggleCategory(category)}
                      className={cn(
                        "rounded-[8px] px-3 py-2 text-xs font-bold",
                        category.isActive
                          ? "bg-green-50 text-green-700"
                          : "bg-neutral-200 text-neutral-500"
                      )}
                    >
                      {category.isActive ? "Hiện" : "Ẩn"}
                    </button>

                    <button
                      type="button"
                      onClick={() => onStartEdit(category)}
                      className="grid h-9 w-9 place-items-center rounded-[8px] bg-white text-neutral-600 ring-1 ring-neutral-200"
                    >
                      <Edit size={15} />
                    </button>

                    <button
                      type="button"
                      onClick={() => onDeleteCategory(category.id)}
                      className="grid h-9 w-9 place-items-center rounded-[8px] bg-red-50 text-red-600"
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