import { useEffect, useMemo, useState } from "react";
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  Edit,
  Eye,
  EyeOff,
  Filter,
  FolderPlus,
  GripVertical,
  ImagePlus,
  Loader2,
  Package,
  Plus,
  RefreshCw,
  Save,
  Search,
  Star,
  Trash,
  Upload,
  X,
} from "lucide-react";

import { DEFAULT_SHOP_ID } from "../../services/shopService";
import {
  createCategory,
  deleteCategory,
  getCategories,
  updateCategory,
} from "../../services/categoryService";
import {
  createItem,
  deleteItem,
  getItems,
  reorderItems,
  updateItem,
  uploadItemImage,
} from "../../services/itemService";

const emptyItemForm = {
  name: "",
  description: "",
  price: "",
  oldPrice: "",
  imageUrl: "",
  categoryId: "",
  isAvailable: true,
  isFeatured: false,
  tagsText: "",
};

function cn(...classes) {
  return classes.filter(Boolean).join(" ");
}

function formatPrice(value) {
  return Number(value || 0).toLocaleString("vi-VN") + "đ";
}

function parseTags(tagsText) {
  return tagsText
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean);
}

export default function MenuItemsPage() {
  const [categories, setCategories] = useState([]);
  const [items, setItems] = useState([]);

  const [newCategoryName, setNewCategoryName] = useState("");
  const [editingCategoryId, setEditingCategoryId] = useState(null);
  const [editingCategoryName, setEditingCategoryName] = useState("");
  const [categorySubmitting, setCategorySubmitting] = useState(false);

  const [itemForm, setItemForm] = useState(emptyItemForm);
  const [editingItemId, setEditingItemId] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState("");

  const [searchText, setSearchText] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const [loading, setLoading] = useState(true);
  const [itemSubmitting, setItemSubmitting] = useState(false);
  const [savingOrder, setSavingOrder] = useState(false);

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 6,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const sortedItems = useMemo(() => {
    return [...items].sort((a, b) => Number(a.order || 0) - Number(b.order || 0));
  }, [items]);

  const categoryMap = useMemo(() => {
    return Object.fromEntries(
      categories.map((category) => [category.id, category])
    );
  }, [categories]);

  const itemCountByCategory = useMemo(() => {
    return items.reduce((result, item) => {
      if (!item.categoryId) return result;

      result[item.categoryId] = (result[item.categoryId] || 0) + 1;
      return result;
    }, {});
  }, [items]);

  const filteredItems = useMemo(() => {
    const keyword = searchText.trim().toLowerCase();

    return sortedItems.filter((item) => {
      const matchKeyword =
        !keyword ||
        item.name?.toLowerCase().includes(keyword) ||
        item.description?.toLowerCase().includes(keyword);

      const matchCategory =
        categoryFilter === "all" || item.categoryId === categoryFilter;

      const matchStatus =
        statusFilter === "all" ||
        (statusFilter === "available" && item.isAvailable !== false) ||
        (statusFilter === "unavailable" && item.isAvailable === false) ||
        (statusFilter === "featured" && item.isFeatured === true);

      return matchKeyword && matchCategory && matchStatus;
    });
  }, [sortedItems, searchText, categoryFilter, statusFilter]);

  const canReorder =
    !searchText.trim() && categoryFilter === "all" && statusFilter === "all";

  const itemIds = useMemo(() => {
    return sortedItems.map((item) => item.id);
  }, [sortedItems]);

  const stats = useMemo(() => {
    return {
      total: items.length,
      available: items.filter((item) => item.isAvailable !== false).length,
      unavailable: items.filter((item) => item.isAvailable === false).length,
      featured: items.filter((item) => item.isFeatured).length,
    };
  }, [items]);

  async function loadData() {
    try {
      setLoading(true);
      setError("");

      const [categoryData, itemData] = await Promise.all([
        getCategories(DEFAULT_SHOP_ID),
        getItems(DEFAULT_SHOP_ID),
      ]);

      setCategories(categoryData);
      setItems(itemData);
    } catch (err) {
      console.error(err);
      setError("Không thể tải dữ liệu menu.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (!imageFile) {
      setImagePreviewUrl(itemForm.imageUrl || "");
      return;
    }

    const objectUrl = URL.createObjectURL(imageFile);
    setImagePreviewUrl(objectUrl);

    return () => URL.revokeObjectURL(objectUrl);
  }, [imageFile, itemForm.imageUrl]);

  function updateItemForm(name, value) {
    setItemForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  function getNextOrder() {
    if (items.length === 0) return 1;

    const maxOrder = Math.max(...items.map((item) => Number(item.order || 0)));
    return maxOrder + 1;
  }

  function resetItemForm() {
    setEditingItemId(null);
    setItemForm(emptyItemForm);
    setImageFile(null);
    setImagePreviewUrl("");
  }

  function clearNotice() {
    setMessage("");
    setError("");
  }

  async function handleCreateCategory(event) {
    event.preventDefault();

    if (!newCategoryName.trim()) return;

    try {
      setCategorySubmitting(true);
      clearNotice();

      await createCategory(DEFAULT_SHOP_ID, {
        name: newCategoryName.trim(),
        order: categories.length + 1,
        isActive: true,
      });

      setNewCategoryName("");
      setMessage("Đã thêm danh mục.");
      await loadData();
    } catch (err) {
      console.error(err);
      setError("Không thể thêm danh mục.");
    } finally {
      setCategorySubmitting(false);
    }
  }

  function startEditCategory(category) {
    setEditingCategoryId(category.id);
    setEditingCategoryName(category.name || "");
  }

  function cancelEditCategory() {
    setEditingCategoryId(null);
    setEditingCategoryName("");
  }

  async function handleUpdateCategory(categoryId) {
    if (!editingCategoryName.trim()) {
      setError("Tên danh mục không được để trống.");
      return;
    }

    try {
      clearNotice();

      await updateCategory(DEFAULT_SHOP_ID, categoryId, {
        name: editingCategoryName.trim(),
      });

      setMessage("Đã cập nhật danh mục.");
      cancelEditCategory();
      await loadData();
    } catch (err) {
      console.error(err);
      setError("Không thể cập nhật danh mục.");
    }
  }

  async function handleToggleCategory(category) {
    try {
      clearNotice();

      await updateCategory(DEFAULT_SHOP_ID, category.id, {
        isActive: !category.isActive,
      });

      await loadData();
    } catch (err) {
      console.error(err);
      setError("Không thể cập nhật danh mục.");
    }
  }

  async function handleDeleteCategory(categoryId) {
    const ok = window.confirm(
      "Bạn có chắc muốn xóa danh mục này? Món thuộc danh mục này sẽ không bị xóa."
    );

    if (!ok) return;

    try {
      clearNotice();

      await deleteCategory(DEFAULT_SHOP_ID, categoryId);
      setMessage("Đã xóa danh mục.");
      await loadData();
    } catch (err) {
      console.error(err);
      setError("Không thể xóa danh mục.");
    }
  }

  async function handleSubmitItem(event) {
    event.preventDefault();

    if (!itemForm.name.trim()) {
      setError("Vui lòng nhập tên món.");
      return;
    }

    if (!itemForm.categoryId) {
      setError("Vui lòng chọn danh mục.");
      return;
    }

    try {
      setItemSubmitting(true);
      clearNotice();

      let imageUrl = itemForm.imageUrl.trim();

      if (imageFile) {
        imageUrl = await uploadItemImage(DEFAULT_SHOP_ID, imageFile);
      }

      const payload = {
        name: itemForm.name,
        description: itemForm.description,
        price: Number(itemForm.price || 0),
        oldPrice: Number(itemForm.oldPrice || 0),
        imageUrl,
        categoryId: itemForm.categoryId,
        isAvailable: itemForm.isAvailable,
        isFeatured: itemForm.isFeatured,
        tags: parseTags(itemForm.tagsText),
      };

      if (editingItemId) {
        await updateItem(DEFAULT_SHOP_ID, editingItemId, payload);
        setMessage("Đã cập nhật món.");
      } else {
        await createItem(DEFAULT_SHOP_ID, {
          ...payload,
          order: getNextOrder(),
        });
        setMessage("Đã thêm món mới.");
      }

      resetItemForm();
      await loadData();
    } catch (err) {
      console.error(err);
      setError("Không thể lưu món.");
    } finally {
      setItemSubmitting(false);
    }
  }

  function handleEditItem(item) {
    setEditingItemId(item.id);
    setImageFile(null);

    setItemForm({
      name: item.name || "",
      description: item.description || "",
      price: item.price || "",
      oldPrice: item.oldPrice || "",
      imageUrl: item.imageUrl || "",
      categoryId: item.categoryId || "",
      isAvailable: item.isAvailable ?? true,
      isFeatured: item.isFeatured ?? false,
      tagsText: Array.isArray(item.tags) ? item.tags.join(", ") : "",
    });

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  async function handleDeleteItem(itemId) {
    const ok = window.confirm("Bạn có chắc muốn xóa món này?");

    if (!ok) return;

    try {
      clearNotice();

      await deleteItem(DEFAULT_SHOP_ID, itemId);
      setMessage("Đã xóa món.");
      await loadData();
    } catch (err) {
      console.error(err);
      setError("Không thể xóa món.");
    }
  }

  async function handleToggleAvailable(item) {
    try {
      clearNotice();

      await updateItem(DEFAULT_SHOP_ID, item.id, {
        isAvailable: !(item.isAvailable ?? true),
      });

      await loadData();
    } catch (err) {
      console.error(err);
      setError("Không thể cập nhật trạng thái món.");
    }
  }

  async function handleToggleFeatured(item) {
    try {
      clearNotice();

      await updateItem(DEFAULT_SHOP_ID, item.id, {
        isFeatured: !item.isFeatured,
      });

      await loadData();
    } catch (err) {
      console.error(err);
      setError("Không thể cập nhật món nổi bật.");
    }
  }

  async function handleDragEnd(event) {
    if (!canReorder) return;

    const { active, over } = event;

    if (!over || active.id === over.id) return;

    const oldIndex = sortedItems.findIndex((item) => item.id === active.id);
    const newIndex = sortedItems.findIndex((item) => item.id === over.id);

    if (oldIndex === -1 || newIndex === -1) return;

    const reordered = arrayMove(sortedItems, oldIndex, newIndex).map(
      (item, index) => ({
        ...item,
        order: index + 1,
      })
    );

    setItems(reordered);

    try {
      setSavingOrder(true);
      clearNotice();

      await reorderItems(DEFAULT_SHOP_ID, reordered);
      setMessage("Đã cập nhật thứ tự món.");
    } catch (err) {
      console.error(err);
      setError("Không thể lưu thứ tự món. Đang tải lại dữ liệu cũ.");
      await loadData();
    } finally {
      setSavingOrder(false);
    }
  }

  return (
    <div>
      <PageHeader
        loading={loading}
        onRefresh={loadData}
        savingOrder={savingOrder}
      />

      <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Tổng số món"
          value={stats.total}
          icon={Package}
          description="Tất cả sản phẩm"
        />
        <StatCard
          label="Còn bán"
          value={stats.available}
          icon={Eye}
          description="Đang hiển thị"
        />
        <StatCard
          label="Tạm hết"
          value={stats.unavailable}
          icon={EyeOff}
          description="Khách vẫn thấy trạng thái"
        />
        <StatCard
          label="Nổi bật"
          value={stats.featured}
          icon={Star}
          description="Hiện ở mục gợi ý"
        />
      </div>

      <Notice message={message} error={error} savingOrder={savingOrder} />

      <div className="mt-6 grid gap-6 xl:grid-cols-[420px_1fr]">
        <aside className="space-y-6 xl:sticky xl:top-24 xl:self-start">
          <CategoryPanel
            categories={categories}
            itemCountByCategory={itemCountByCategory}
            newCategoryName={newCategoryName}
            setNewCategoryName={setNewCategoryName}
            categorySubmitting={categorySubmitting}
            editingCategoryId={editingCategoryId}
            editingCategoryName={editingCategoryName}
            setEditingCategoryName={setEditingCategoryName}
            onCreateCategory={handleCreateCategory}
            onStartEdit={startEditCategory}
            onCancelEdit={cancelEditCategory}
            onUpdateCategory={handleUpdateCategory}
            onToggleCategory={handleToggleCategory}
            onDeleteCategory={handleDeleteCategory}
          />

          <ItemFormPanel
            categories={categories}
            itemForm={itemForm}
            updateItemForm={updateItemForm}
            editingItemId={editingItemId}
            imageFile={imageFile}
            setImageFile={setImageFile}
            imagePreviewUrl={imagePreviewUrl}
            setImagePreviewUrl={setImagePreviewUrl}
            itemSubmitting={itemSubmitting}
            onSubmit={handleSubmitItem}
            onReset={resetItemForm}
          />
        </aside>

        <MenuListPanel
          loading={loading}
          sortedItems={sortedItems}
          filteredItems={filteredItems}
          itemIds={itemIds}
          categoryMap={categoryMap}
          searchText={searchText}
          setSearchText={setSearchText}
          categoryFilter={categoryFilter}
          setCategoryFilter={setCategoryFilter}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          categories={categories}
          canReorder={canReorder}
          sensors={sensors}
          onDragEnd={handleDragEnd}
          onEditItem={handleEditItem}
          onDeleteItem={handleDeleteItem}
          onToggleAvailable={handleToggleAvailable}
          onToggleFeatured={handleToggleFeatured}
        />
      </div>
    </div>
  );
}

function PageHeader({ loading, onRefresh, savingOrder }) {
  return (
    <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
      <div>
        <p className="text-sm font-black uppercase tracking-[0.18em] text-neutral-400">
          Menu
        </p>

        <h1 className="mt-1 text-3xl font-black tracking-tight">
          Quản lý menu
        </h1>

        <p className="mt-2 max-w-2xl text-sm leading-6 text-neutral-500">
          Thêm món, sửa giá, bật/tắt trạng thái, đánh dấu món nổi bật và kéo thả
          để đổi thứ tự hiển thị trên menu khách hàng.
        </p>
      </div>

      <button
        type="button"
        onClick={onRefresh}
        disabled={loading || savingOrder}
        className="inline-flex items-center justify-center gap-2 rounded-[10px] border border-neutral-200 bg-white px-4 py-3 text-sm font-bold text-neutral-700 transition hover:bg-neutral-50 disabled:opacity-60"
      >
        <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
        Tải lại dữ liệu
      </button>
    </div>
  );
}

function Notice({ message, error, savingOrder }) {
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

function StatCard({ label, value, icon: Icon, description }) {
  return (
    <div className="rounded-[14px] border border-neutral-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-bold text-neutral-500">{label}</p>
          <p className="mt-2 text-3xl font-black tracking-tight">{value}</p>
        </div>

        <div className="grid h-11 w-11 place-items-center rounded-[10px] bg-neutral-100 text-neutral-700">
          <Icon size={21} />
        </div>
      </div>

      <p className="mt-3 text-xs font-medium text-neutral-400">
        {description}
      </p>
    </div>
  );
}

function CategoryPanel({
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

function ItemFormPanel({
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
}) {
  return (
    <section className="rounded-[16px] border border-neutral-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-xl font-black">
            {editingItemId ? "Sửa món" : "Thêm món mới"}
          </h2>

          <p className="mt-1 text-sm text-neutral-500">
            Điền thông tin món. Có thể dán link ảnh hoặc upload ảnh trực tiếp.
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
            label="Giá"
            type="number"
            value={itemForm.price}
            onChange={(value) => updateItemForm("price", value)}
            placeholder="25000"
            required
          />

          <FormInput
            label="Giá cũ"
            type="number"
            value={itemForm.oldPrice}
            onChange={(value) => updateItemForm("oldPrice", value)}
            placeholder="30000"
          />
        </div>

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

function MenuListPanel({
  loading,
  sortedItems,
  filteredItems,
  itemIds,
  categoryMap,
  searchText,
  setSearchText,
  categoryFilter,
  setCategoryFilter,
  statusFilter,
  setStatusFilter,
  categories,
  canReorder,
  sensors,
  onDragEnd,
  onEditItem,
  onDeleteItem,
  onToggleAvailable,
  onToggleFeatured,
}) {
  return (
    <section className="rounded-[16px] border border-neutral-200 bg-white p-5 shadow-sm">
      <div className="flex flex-col justify-between gap-3 xl:flex-row xl:items-end">
        <div>
          <h2 className="text-xl font-black">Danh sách món</h2>

          <p className="mt-1 text-sm text-neutral-500">
            {canReorder
              ? "Kéo biểu tượng bên trái để đổi vị trí món trên menu public."
              : "Đang lọc danh sách, kéo thả tạm ẩn để tránh sai thứ tự."}
          </p>
        </div>

        <p className="text-sm font-bold text-neutral-400">
          {filteredItems.length}/{sortedItems.length} món
        </p>
      </div>

      <div className="mt-4 grid gap-3 xl:grid-cols-[1fr_180px_170px]">
        <div className="relative">
          <Search
            size={18}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400"
          />

          <input
            value={searchText}
            onChange={(event) => setSearchText(event.target.value)}
            placeholder="Tìm món theo tên hoặc mô tả..."
            className="h-12 w-full rounded-[10px] border border-neutral-200 bg-neutral-50 pl-11 pr-4 text-sm font-medium outline-none transition focus:border-neutral-950 focus:bg-white"
          />
        </div>

        <select
          value={categoryFilter}
          onChange={(event) => setCategoryFilter(event.target.value)}
          className="h-12 rounded-[10px] border border-neutral-200 bg-neutral-50 px-4 text-sm font-bold outline-none focus:border-neutral-950 focus:bg-white"
        >
          <option value="all">Tất cả danh mục</option>

          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>

        <select
          value={statusFilter}
          onChange={(event) => setStatusFilter(event.target.value)}
          className="h-12 rounded-[10px] border border-neutral-200 bg-neutral-50 px-4 text-sm font-bold outline-none focus:border-neutral-950 focus:bg-white"
        >
          <option value="all">Tất cả trạng thái</option>
          <option value="available">Còn bán</option>
          <option value="unavailable">Tạm hết</option>
          <option value="featured">Nổi bật</option>
        </select>
      </div>

      {!canReorder && (
        <div className="mt-3 inline-flex items-center gap-2 rounded-[10px] bg-amber-50 px-3 py-2 text-xs font-bold text-amber-700">
          <Filter size={14} />
          Xóa tìm kiếm/lọc để bật kéo thả sắp xếp thứ tự.
        </div>
      )}

      {loading ? (
        <LoadingList />
      ) : (
        <div className="mt-5">
          {filteredItems.length === 0 && (
            <p className="rounded-[12px] bg-neutral-50 p-5 text-center text-sm text-neutral-500">
              Không tìm thấy món nào phù hợp.
            </p>
          )}

          {canReorder ? (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={onDragEnd}
            >
              <SortableContext
                items={itemIds}
                strategy={verticalListSortingStrategy}
              >
                <div className="space-y-3">
                  {sortedItems.map((item, index) => (
                    <SortableMenuItem
                      key={item.id}
                      item={item}
                      index={index}
                      categoryName={
                        categoryMap[item.categoryId]?.name || "Chưa có danh mục"
                      }
                      onEdit={onEditItem}
                      onDelete={onDeleteItem}
                      onToggleAvailable={onToggleAvailable}
                      onToggleFeatured={onToggleFeatured}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          ) : (
            <div className="space-y-3">
              {filteredItems.map((item, index) => (
                <MenuItemCard
                  key={item.id}
                  item={item}
                  index={index}
                  categoryName={
                    categoryMap[item.categoryId]?.name || "Chưa có danh mục"
                  }
                  onEdit={onEditItem}
                  onDelete={onDeleteItem}
                  onToggleAvailable={onToggleAvailable}
                  onToggleFeatured={onToggleFeatured}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </section>
  );
}

function SortableMenuItem(props) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: props.item.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style}>
      <MenuItemCard
        {...props}
        isDragging={isDragging}
        dragHandleProps={{
          ...attributes,
          ...listeners,
        }}
      />
    </div>
  );
}

function MenuItemCard({
  item,
  index,
  categoryName,
  onEdit,
  onDelete,
  onToggleAvailable,
  onToggleFeatured,
  dragHandleProps,
  isDragging = false,
}) {
  const hasSale = Number(item.oldPrice || 0) > Number(item.price || 0);
  const isAvailable = item.isAvailable !== false;
  const canDrag = Boolean(dragHandleProps);

  return (
    <article
      className={cn(
        "rounded-[14px] border border-neutral-200 bg-white p-3 shadow-sm transition",
        "grid gap-3 md:grid-cols-[44px_116px_1fr]",
        isDragging && "relative z-50 scale-[1.01] shadow-2xl"
      )}
    >
      <button
        type="button"
        {...dragHandleProps}
        disabled={!canDrag}
        className={cn(
          "flex h-10 w-full items-center justify-center rounded-[10px] text-neutral-400 md:h-full md:w-11",
          canDrag
            ? "cursor-grab bg-neutral-100 active:cursor-grabbing"
            : "cursor-default bg-neutral-50"
        )}
      >
        {canDrag ? (
          <GripVertical size={20} />
        ) : (
          <span className="text-xs font-black">#{index + 1}</span>
        )}
      </button>

      <div className="h-28 overflow-hidden rounded-[12px] bg-neutral-100 md:h-full">
        {item.imageUrl ? (
          <img
            src={item.imageUrl}
            alt={item.name}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="grid h-full w-full place-items-center text-xs font-medium text-neutral-400">
            No image
          </div>
        )}
      </div>

      <div className="min-w-0">
        <div className="flex flex-col justify-between gap-3 lg:flex-row lg:items-start">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="hidden h-7 w-7 place-items-center rounded-full bg-neutral-950 text-xs font-bold text-white md:grid">
                {index + 1}
              </span>

              <h3 className="line-clamp-1 font-black">{item.name}</h3>
            </div>

            <p className="mt-1 text-sm font-medium text-neutral-500">
              {categoryName}
            </p>
          </div>

          <div className="flex shrink-0 gap-2">
            <button
              type="button"
              onClick={() => onEdit(item)}
              className="grid h-9 w-9 place-items-center rounded-[9px] bg-neutral-100 text-neutral-700"
            >
              <Edit size={16} />
            </button>

            <button
              type="button"
              onClick={() => onDelete(item.id)}
              className="grid h-9 w-9 place-items-center rounded-[9px] bg-red-50 text-red-600"
            >
              <Trash size={16} />
            </button>
          </div>
        </div>

        {item.description && (
          <p className="mt-2 line-clamp-2 text-sm leading-6 text-neutral-500">
            {item.description}
          </p>
        )}

        <div className="mt-3 flex flex-wrap items-center gap-2">
          <span className="rounded-[8px] bg-neutral-950 px-3 py-1.5 text-sm font-black text-white">
            {formatPrice(item.price)}
          </span>

          {hasSale && (
            <span className="rounded-[8px] bg-neutral-100 px-3 py-1.5 text-sm font-bold text-neutral-400 line-through">
              {formatPrice(item.oldPrice)}
            </span>
          )}

          <button
            type="button"
            onClick={() => onToggleAvailable(item)}
            className={cn(
              "rounded-[8px] px-3 py-1.5 text-xs font-black",
              isAvailable
                ? "bg-green-50 text-green-700"
                : "bg-neutral-100 text-neutral-500"
            )}
          >
            {isAvailable ? "Còn bán" : "Tạm hết"}
          </button>

          <button
            type="button"
            onClick={() => onToggleFeatured(item)}
            className={cn(
              "rounded-[8px] px-3 py-1.5 text-xs font-black",
              item.isFeatured
                ? "bg-amber-50 text-amber-700"
                : "bg-neutral-100 text-neutral-500"
            )}
          >
            {item.isFeatured ? "Nổi bật" : "Không nổi bật"}
          </button>
        </div>
      </div>
    </article>
  );
}

function LoadingList() {
  return (
    <div className="mt-5 space-y-3">
      {Array.from({ length: 5 }).map((_, index) => (
        <div
          key={index}
          className="h-32 animate-pulse rounded-[14px] bg-neutral-100"
        />
      ))}
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