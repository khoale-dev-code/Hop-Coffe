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
          <section className="overflow-hidden rounded-[16px] border border-neutral-200 bg-white shadow-sm">
            <div className="border-b border-neutral-200 px-3 py-3 sm:px-4">
              <p className="text-sm font-black text-neutral-950">
                Quản lý danh mục
              </p>

              <p className="mt-1 text-xs font-medium text-neutral-500">
                Thêm, sửa, ẩn hoặc hiện danh mục sản phẩm.
              </p>
            </div>

            <div className="p-3 sm:p-4">
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
          </section>
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
    <section className="overflow-hidden rounded-[16px] border border-neutral-200 bg-white shadow-sm">
      <div className="flex flex-col gap-3 p-3 sm:flex-row sm:items-center sm:justify-between sm:p-4">
        <div className="min-w-0">
          <p className="text-xs font-black uppercase tracking-[0.16em] text-[#7CAEB8]">
            Product manager
          </p>

          <h2 className="mt-1 text-lg font-black tracking-tight text-neutral-950 sm:text-xl">
            Sản phẩm đã tạo
          </h2>

          <p className="mt-1 text-sm font-medium leading-6 text-neutral-500">
            Quản lý {total || 0} sản phẩm, tìm kiếm, lọc, phân trang và kéo thả
            sắp xếp.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-2 min-[430px]:grid-cols-2 sm:flex sm:shrink-0 sm:items-center">
          <button
            type="button"
            onClick={onToggleCategory}
            className={[
              "inline-flex h-10 items-center justify-center gap-2 rounded-[10px] border px-4 text-sm font-black transition",
              categoryOpen
                ? "border-neutral-950 bg-neutral-950 text-white"
                : "border-neutral-200 bg-white text-neutral-800 hover:bg-neutral-50",
            ].join(" ")}
          >
            <FolderTree size={16} />
            Danh mục
          </button>

          <button
            type="button"
            onClick={onOpenCreateForm}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-[10px] bg-neutral-950 px-4 text-sm font-black text-white shadow-sm transition hover:bg-neutral-800"
          >
            <PlusCircle size={17} />
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
    <div className="fixed inset-0 z-[120] flex items-end justify-center bg-black/45 px-0 backdrop-blur-sm sm:items-center sm:p-4">
      <CompactProductFormStyle />

      <button
        type="button"
        onClick={onClose}
        disabled={submitting}
        className="absolute inset-0 cursor-default disabled:cursor-not-allowed"
        aria-label="Đóng form sản phẩm"
      />

      <div className="relative z-10 flex max-h-[92dvh] w-full flex-col overflow-hidden rounded-t-[18px] bg-[#F6F7F9] shadow-2xl sm:max-h-[88vh] sm:max-w-[820px] sm:rounded-[16px]">
        <div className="flex min-h-[54px] items-center justify-between gap-3 border-b border-neutral-200 bg-white px-3 py-2 sm:px-4">
          <div className="min-w-0">
            <p className="text-[10px] font-black uppercase tracking-[0.16em] text-[#7CAEB8]">
              {editingItemId ? "Edit product" : "New product"}
            </p>

            <h2 className="truncate text-base font-black text-neutral-950 sm:text-lg">
              {editingItemId ? "Chỉnh sửa sản phẩm" : "Thêm sản phẩm mới"}
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="grid h-9 w-9 shrink-0 place-items-center rounded-[9px] bg-neutral-100 text-neutral-700 transition hover:bg-neutral-200 disabled:cursor-not-allowed disabled:opacity-50"
            aria-label="Đóng popup"
          >
            <X size={18} />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto p-2 sm:p-3">
          <div className="compact-product-form mx-auto w-full max-w-[720px]">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}

function CompactProductFormStyle() {
  return (
    <style>
      {`
        .compact-product-form > section {
          border-radius: 14px !important;
          box-shadow: none !important;
        }

        .compact-product-form section > div:first-child {
          padding: 12px 14px !important;
        }

        .compact-product-form section > div:first-child h2 {
          font-size: 18px !important;
          line-height: 24px !important;
        }

        .compact-product-form section > div:first-child p {
          font-size: 12px !important;
          line-height: 18px !important;
        }

        .compact-product-form form {
          padding: 12px !important;
        }

        .compact-product-form form > * + * {
          margin-top: 12px !important;
        }

        .compact-product-form form section,
        .compact-product-form form > div {
          border-radius: 12px !important;
        }

        .compact-product-form input,
        .compact-product-form select {
          height: 42px !important;
          font-size: 13px !important;
          border-radius: 9px !important;
        }

        .compact-product-form textarea {
          min-height: 84px !important;
          max-height: 120px !important;
          font-size: 13px !important;
          border-radius: 9px !important;
        }

        .compact-product-form label {
          font-size: 12px !important;
        }

        .compact-product-form .aspect-square {
          aspect-ratio: 16 / 9 !important;
          max-height: 150px !important;
          min-height: 110px !important;
        }

        .compact-product-form .aspect-\\[16\\/10\\] {
          aspect-ratio: 16 / 8 !important;
          max-height: 150px !important;
          min-height: 110px !important;
        }

        .compact-product-form img,
        .compact-product-form video {
          max-height: 145px !important;
          object-fit: contain !important;
        }

        .compact-product-form [class*="min-h-\\[150px\\]"],
        .compact-product-form [class*="min-h-\\[170px\\]"],
        .compact-product-form [class*="min-h-\\[190px\\]"] {
          min-height: 116px !important;
        }

        .compact-product-form [class*="h-52"] {
          height: 120px !important;
        }

        .compact-product-form button[type="submit"] {
          min-height: 42px !important;
          padding-top: 10px !important;
          padding-bottom: 10px !important;
          border-radius: 10px !important;
          font-size: 12px !important;
        }

        @media (max-width: 640px) {
          .compact-product-form {
            max-width: 100% !important;
          }

          .compact-product-form .aspect-square,
          .compact-product-form .aspect-\\[16\\/10\\] {
            max-height: 130px !important;
            min-height: 96px !important;
          }

          .compact-product-form img,
          .compact-product-form video {
            max-height: 125px !important;
          }

          .compact-product-form form {
            padding: 10px !important;
          }

          .compact-product-form form > * + * {
            margin-top: 10px !important;
          }
        }
      `}
    </style>
  );
}