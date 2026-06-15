import { useEffect, useState } from "react";
import { FolderTree, PlusCircle, X } from "lucide-react";

import PageHeader from "../../components/admin/menu/PageHeader";
import Notice from "../../components/admin/menu/Notice";
import MenuStats from "../../components/admin/menu/MenuStats";
import CategoryPanel from "../../components/admin/menu/CategoryPanel";
import ItemFormPanel from "../../components/admin/menu/ItemFormPanel";
import MenuListPanel from "../../components/admin/menu/MenuListPanel";

import { useMenuItemsAdmin } from "../../hooks/admin/useMenuItemsAdmin";

export default function MenuItemsPage() {
  const menu = useMenuItemsAdmin();

  const [formOpen, setFormOpen] = useState(false);
  const [categoryOpen, setCategoryOpen] = useState(false);

  useEffect(() => {
    if (!formOpen) return;

    const savedMessages = ["Đã thêm món mới.", "Đã cập nhật món."];

    if (savedMessages.includes(menu.message)) {
      setFormOpen(false);
    }
  }, [menu.message, formOpen]);

  function handleOpenCreateForm() {
    menu.resetItemForm();
    setFormOpen(true);
  }

  function handleEditItem(item) {
    menu.handleEditItem(item);
    setFormOpen(true);
  }

  function handleCloseForm() {
    if (menu.itemSubmitting) return;

    menu.resetItemForm();
    setFormOpen(false);
  }

  return (
    <>
      <div className="mx-auto w-full max-w-[1680px] space-y-4 sm:space-y-5">
        <PageHeader
          loading={menu.loading}
          onRefresh={menu.loadData}
          savingOrder={menu.savingOrder}
        />

        <MenuStats stats={menu.stats} />

        <Notice
          message={menu.message}
          error={menu.error}
          savingOrder={menu.savingOrder}
        />

        <TopActionBar
          total={menu.stats.total}
          categoryOpen={categoryOpen}
          onOpenCreateForm={handleOpenCreateForm}
          onToggleCategory={() => setCategoryOpen((prev) => !prev)}
        />

        {categoryOpen && (
          <div className="rounded-[18px] border border-neutral-200 bg-white p-3 shadow-sm sm:p-5">
            <CategoryPanel
              categories={menu.categories}
              itemCountByCategory={menu.itemCountByCategory}
              newCategoryName={menu.newCategoryName}
              setNewCategoryName={menu.setNewCategoryName}
              categorySubmitting={menu.categorySubmitting}
              editingCategoryId={menu.editingCategoryId}
              editingCategoryName={menu.editingCategoryName}
              setEditingCategoryName={menu.setEditingCategoryName}
              onCreateCategory={menu.handleCreateCategory}
              onStartEdit={menu.startEditCategory}
              onCancelEdit={menu.cancelEditCategory}
              onUpdateCategory={menu.handleUpdateCategory}
              onToggleCategory={menu.handleToggleCategory}
              onDeleteCategory={menu.handleDeleteCategory}
            />
          </div>
        )}

        <MenuListPanel
          loading={menu.loading}
          sortedItems={menu.sortedItems}
          filteredItems={menu.filteredItems}
          itemIds={menu.itemIds}
          categoryMap={menu.categoryMap}
          searchText={menu.searchText}
          setSearchText={menu.setSearchText}
          categoryFilter={menu.categoryFilter}
          setCategoryFilter={menu.setCategoryFilter}
          statusFilter={menu.statusFilter}
          setStatusFilter={menu.setStatusFilter}
          categories={menu.categories}
          canReorder={menu.canReorder}
          sensors={menu.sensors}
          onDragEnd={menu.handleDragEnd}
          onEditItem={handleEditItem}
          onDeleteItem={menu.handleDeleteItem}
          onToggleAvailable={menu.handleToggleAvailable}
          onToggleFeatured={menu.handleToggleFeatured}
        />
      </div>

      <ProductFormModal
        open={formOpen}
        editingItemId={menu.editingItemId}
        submitting={menu.itemSubmitting}
        onClose={handleCloseForm}
      >
        <ItemFormPanel
          categories={menu.categories}
          itemForm={menu.itemForm}
          updateItemForm={menu.updateItemForm}
          editingItemId={menu.editingItemId}
          imageFile={menu.imageFile}
          setImageFile={menu.setImageFile}
          imagePreviewUrl={menu.imagePreviewUrl}
          itemSubmitting={menu.itemSubmitting}
          onSubmit={menu.handleSubmitItem}
          onReset={handleCloseForm}
          onAddSize={menu.handleAddSize}
          onUpdateSize={menu.handleUpdateSize}
          onRemoveSize={menu.handleRemoveSize}
        />
      </ProductFormModal>
    </>
  );
}

function TopActionBar({
  total,
  categoryOpen,
  onOpenCreateForm,
  onToggleCategory,
}) {
  return (
    <section className="overflow-hidden rounded-[18px] border border-neutral-200 bg-white shadow-sm">
      <div className="flex flex-col gap-3 p-3 sm:flex-row sm:items-center sm:justify-between sm:p-4 lg:p-5">
        <div className="min-w-0">
          <p className="text-xs font-black uppercase tracking-[0.16em] text-[#7CAEB8]">
            Product manager
          </p>

          <h2 className="mt-1 text-xl font-black tracking-tight text-neutral-950 sm:text-2xl">
            Sản phẩm đã tạo
          </h2>

          <p className="mt-1 text-sm font-medium leading-6 text-neutral-500">
            Quản lý {total || 0} sản phẩm, tìm kiếm, lọc, phân trang và kéo thả
            sắp xếp thứ tự hiển thị.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-2 min-[430px]:grid-cols-2 sm:flex sm:shrink-0 sm:items-center">
          <button
            type="button"
            onClick={onToggleCategory}
            className={[
              "inline-flex h-11 items-center justify-center gap-2 rounded-[10px] border px-4 text-sm font-black transition",
              categoryOpen
                ? "border-neutral-950 bg-neutral-950 text-white"
                : "border-neutral-200 bg-white text-neutral-800 hover:bg-neutral-50",
            ].join(" ")}
          >
            <FolderTree size={17} />
            Danh mục
          </button>

          <button
            type="button"
            onClick={onOpenCreateForm}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-[10px] bg-neutral-950 px-4 text-sm font-black text-white shadow-sm transition hover:bg-neutral-800"
          >
            <PlusCircle size={18} />
            Thêm sản phẩm
          </button>
        </div>
      </div>
    </section>
  );
}

function ProductFormModal({
  open,
  editingItemId,
  submitting,
  onClose,
  children,
}) {
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

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[120] flex items-end justify-center bg-black/55 px-0 py-0 backdrop-blur-sm sm:items-center sm:p-4 lg:p-6">
      <button
        type="button"
        onClick={onClose}
        disabled={submitting}
        className="absolute inset-0 cursor-default disabled:cursor-not-allowed"
        aria-label="Đóng form sản phẩm"
      />

      <div className="relative z-10 flex max-h-[94dvh] w-full flex-col overflow-hidden rounded-t-[20px] bg-[#F6F7F9] shadow-2xl sm:max-w-5xl sm:rounded-[18px] xl:max-w-6xl">
        <div className="flex items-center justify-between gap-3 border-b border-neutral-200 bg-white px-4 py-3 sm:px-5">
          <div className="min-w-0">
            <p className="text-xs font-black uppercase tracking-[0.16em] text-[#7CAEB8]">
              {editingItemId ? "Edit product" : "New product"}
            </p>

            <h2 className="truncate text-lg font-black text-neutral-950 sm:text-xl">
              {editingItemId ? "Chỉnh sửa sản phẩm" : "Thêm sản phẩm mới"}
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="grid h-10 w-10 shrink-0 place-items-center rounded-[10px] bg-neutral-100 text-neutral-700 transition hover:bg-neutral-200 disabled:cursor-not-allowed disabled:opacity-50"
            aria-label="Đóng popup"
          >
            <X size={19} />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto p-3 sm:p-4 lg:p-5">
          {children}
        </div>
      </div>
    </div>
  );
}