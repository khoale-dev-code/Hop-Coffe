import PageHeader from "../../components/admin/menu/PageHeader";
import Notice from "../../components/admin/menu/Notice";
import MenuStats from "../../components/admin/menu/MenuStats";
import CategoryPanel from "../../components/admin/menu/CategoryPanel";
import ItemFormPanel from "../../components/admin/menu/ItemFormPanel";
import MenuListPanel from "../../components/admin/menu/MenuListPanel";

import { useMenuItemsAdmin } from "../../hooks/admin/useMenuItemsAdmin";

export default function MenuItemsPage() {
  const menu = useMenuItemsAdmin();

  return (
    <div>
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

      <div className="mt-6 grid gap-6 xl:grid-cols-[420px_1fr]">
        <aside className="space-y-6 xl:sticky xl:top-24 xl:self-start">
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
            onReset={menu.resetItemForm}
            onAddSize={menu.handleAddSize}
            onUpdateSize={menu.handleUpdateSize}
            onRemoveSize={menu.handleRemoveSize}
          />
        </aside>

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
          onEditItem={menu.handleEditItem}
          onDeleteItem={menu.handleDeleteItem}
          onToggleAvailable={menu.handleToggleAvailable}
          onToggleFeatured={menu.handleToggleFeatured}
        />
      </div>
    </div>
  );
}