import { useEffect, useState } from "react";
import { FolderTree, ListChecks, PlusCircle } from "lucide-react";

import PageHeader from "../../components/admin/menu/PageHeader";
import Notice from "../../components/admin/menu/Notice";
import MenuStats from "../../components/admin/menu/MenuStats";
import CategoryPanel from "../../components/admin/menu/CategoryPanel";
import ItemFormPanel from "../../components/admin/menu/ItemFormPanel";
import MenuListPanel from "../../components/admin/menu/MenuListPanel";

import { useMenuItemsAdmin } from "../../hooks/admin/useMenuItemsAdmin";

const mobileTabs = [
  {
    id: "list",
    label: "Danh sách",
    icon: ListChecks,
  },
  {
    id: "form",
    label: "Thêm/Sửa",
    icon: PlusCircle,
  },
  {
    id: "category",
    label: "Danh mục",
    icon: FolderTree,
  },
];

export default function MenuItemsPage() {
  const menu = useMenuItemsAdmin();
  const [mobileTab, setMobileTab] = useState("list");

  useEffect(() => {
    if (menu.editingItemId) {
      setMobileTab("form");
    }
  }, [menu.editingItemId]);

  function handleEditItem(item) {
    menu.handleEditItem(item);
    setMobileTab("form");
  }

  function handleResetForm() {
    menu.resetItemForm();
  }

  return (
    <div className="space-y-4 sm:space-y-5">
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

      <MobileTabBar activeTab={mobileTab} setActiveTab={setMobileTab} />

      <div className="xl:hidden">
        {mobileTab === "list" && (
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
        )}

        {mobileTab === "form" && (
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
            onReset={handleResetForm}
            onAddSize={menu.handleAddSize}
            onUpdateSize={menu.handleUpdateSize}
            onRemoveSize={menu.handleRemoveSize}
          />
        )}

        {mobileTab === "category" && (
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
        )}
      </div>

      <div className="hidden gap-6 xl:grid xl:grid-cols-[420px_1fr]">
        <aside className="space-y-5 xl:sticky xl:top-24 xl:self-start">
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
            onReset={handleResetForm}
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
          onEditItem={handleEditItem}
          onDeleteItem={menu.handleDeleteItem}
          onToggleAvailable={menu.handleToggleAvailable}
          onToggleFeatured={menu.handleToggleFeatured}
        />
      </div>
    </div>
  );
}

function MobileTabBar({ activeTab, setActiveTab }) {
  return (
    <div className="sticky top-0 z-30 -mx-3 border-y border-neutral-200 bg-white/95 px-3 py-2 backdrop-blur-xl sm:-mx-5 sm:px-5 xl:hidden">
      <div className="grid grid-cols-3 gap-2 rounded-[12px] border border-neutral-200 bg-neutral-50 p-1">
        {mobileTabs.map((tab) => {
          const Icon = tab.icon;
          const active = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={[
                "inline-flex min-h-11 items-center justify-center gap-1.5 rounded-[9px] px-2 text-xs font-black transition",
                active
                  ? "bg-neutral-950 text-white shadow-sm"
                  : "bg-transparent text-neutral-500 hover:bg-white hover:text-neutral-950",
              ].join(" ")}
            >
              <Icon size={15} />
              <span className="line-clamp-1">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}