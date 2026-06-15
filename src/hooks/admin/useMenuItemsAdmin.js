import { useEffect, useMemo, useState } from "react";
import {
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  sortableKeyboardCoordinates,
} from "@dnd-kit/sortable";

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

import {
  createEmptyItemForm,
  createEmptySize,
  getMainOldPrice,
  getMainPrice,
  hasInvalidSize,
  mapSizeToForm,
  normalizeSizes,
  parseTags,
} from "../../utils/admin/menuItemUtils";

export function useMenuItemsAdmin() {
  const [categories, setCategories] = useState([]);
  const [items, setItems] = useState([]);

  const [newCategoryName, setNewCategoryName] = useState("");
  const [editingCategoryId, setEditingCategoryId] = useState(null);
  const [editingCategoryName, setEditingCategoryName] = useState("");
  const [categorySubmitting, setCategorySubmitting] = useState(false);

  const [itemForm, setItemForm] = useState(createEmptyItemForm);
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
      const tagsText = Array.isArray(item.tags)
        ? item.tags.join(" ").toLowerCase()
        : "";

      const sizesText = Array.isArray(item.sizes)
        ? item.sizes
            .map((size) => `${size.name || ""} ${size.description || ""}`)
            .join(" ")
            .toLowerCase()
        : "";

      const matchKeyword =
        !keyword ||
        item.name?.toLowerCase().includes(keyword) ||
        item.description?.toLowerCase().includes(keyword) ||
        tagsText.includes(keyword) ||
        sizesText.includes(keyword);

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

  function clearNotice() {
    setMessage("");
    setError("");
  }

  function updateItemForm(name, value) {
    setItemForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  function handleAddSize() {
    setItemForm((prev) => ({
      ...prev,
      sizes: [...(prev.sizes || []), createEmptySize()],
    }));
  }

  function handleUpdateSize(sizeId, field, value) {
    setItemForm((prev) => ({
      ...prev,
      sizes: (prev.sizes || []).map((size) =>
        size.id === sizeId
          ? {
              ...size,
              [field]: value,
            }
          : size
      ),
    }));
  }

  function handleRemoveSize(sizeId) {
    setItemForm((prev) => ({
      ...prev,
      sizes: (prev.sizes || []).filter((size) => size.id !== sizeId),
    }));
  }

  function getNextOrder() {
    if (items.length === 0) return 1;

    const maxOrder = Math.max(...items.map((item) => Number(item.order || 0)));
    return maxOrder + 1;
  }

  function resetItemForm() {
    setEditingItemId(null);
    setItemForm(createEmptyItemForm());
    setImageFile(null);
    setImagePreviewUrl("");
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
        isActive: !(category.isActive ?? true),
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

    if (hasInvalidSize(itemForm.sizes || [])) {
      setError("Mỗi size cần có tên size và giá tiền lớn hơn 0.");
      return;
    }

    const sizes = normalizeSizes(itemForm.sizes || []);
    const mainPrice = getMainPrice(itemForm, sizes);
    const mainOldPrice = getMainOldPrice(itemForm, sizes);

    if (mainPrice <= 0) {
      setError("Vui lòng nhập giá mặc định hoặc thêm ít nhất một size có giá.");
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
        price: mainPrice,
        oldPrice: mainOldPrice,
        imageUrl,
        categoryId: itemForm.categoryId,
        isAvailable: itemForm.isAvailable,
        isFeatured: itemForm.isFeatured,
        tags: parseTags(itemForm.tagsText),
        sizes,
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
      sizes: Array.isArray(item.sizes)
        ? item.sizes.map((size, index) => mapSizeToForm(size, index))
        : [],
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

  return {
    categories,
    items,
    newCategoryName,
    setNewCategoryName,
    editingCategoryId,
    editingCategoryName,
    setEditingCategoryName,
    categorySubmitting,

    itemForm,
    updateItemForm,
    editingItemId,
    imageFile,
    setImageFile,
    imagePreviewUrl,
    itemSubmitting,

    searchText,
    setSearchText,
    categoryFilter,
    setCategoryFilter,
    statusFilter,
    setStatusFilter,

    loading,
    savingOrder,
    error,
    message,

    sensors,
    sortedItems,
    categoryMap,
    itemCountByCategory,
    filteredItems,
    canReorder,
    itemIds,
    stats,

    loadData,
    handleCreateCategory,
    startEditCategory,
    cancelEditCategory,
    handleUpdateCategory,
    handleToggleCategory,
    handleDeleteCategory,

    handleAddSize,
    handleUpdateSize,
    handleRemoveSize,
    handleSubmitItem,
    handleEditItem,
    handleDeleteItem,
    handleToggleAvailable,
    handleToggleFeatured,
    handleDragEnd,
    resetItemForm,
  };
}