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
} from "../../services/itemService";
import { uploadMediaFilesToCloudinary } from "../../services/cloudinaryService";

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

function getImageFiles(imageFile) {
  if (!imageFile) return [];

  if (Array.isArray(imageFile)) {
    return imageFile.filter(Boolean);
  }

  if (
    typeof FileList !== "undefined" &&
    imageFile instanceof FileList
  ) {
    return Array.from(imageFile).filter(Boolean);
  }

  return [imageFile];
}

function inferMediaTypeFromUrl(url = "") {
  const cleanUrl = String(url).toLowerCase().split("?")[0];

  if (
    cleanUrl.endsWith(".mp4") ||
    cleanUrl.endsWith(".webm") ||
    cleanUrl.endsWith(".mov") ||
    cleanUrl.endsWith(".m4v")
  ) {
    return "video";
  }

  return "image";
}

function normalizeItemImages(images = []) {
  if (!Array.isArray(images)) return [];

  return images
    .map((image, index) => {
      if (typeof image === "string") {
        return {
          url: image,
          type: inferMediaTypeFromUrl(image),
          name: `Media ${index + 1}`,
          mimeType: "",
          size: 0,
          publicId: "",
        };
      }

      return {
        url: image?.url || "",
        type: image?.type || inferMediaTypeFromUrl(image?.url || ""),
        name: image?.name || `Media ${index + 1}`,
        mimeType: image?.mimeType || "",
        size: Number(image?.size || 0),
        publicId: image?.publicId || "",
        width: Number(image?.width || 0),
        height: Number(image?.height || 0),
      };
    })
    .filter((image) => image.url);
}

function getPrimaryMediaUrl(images = []) {
  const normalizedImages = normalizeItemImages(images);

  return (
    normalizedImages.find((image) => image.type === "image")?.url ||
    normalizedImages[0]?.url ||
    ""
  );
}

function mergeMainUrlIntoImages(imageUrl, images = []) {
  const cleanUrl = imageUrl?.trim() || "";
  const normalizedImages = normalizeItemImages(images);

  if (!cleanUrl) return normalizedImages;

  const exists = normalizedImages.some((image) => image.url === cleanUrl);

  if (exists) return normalizedImages;

  return [
    {
      url: cleanUrl,
      type: inferMediaTypeFromUrl(cleanUrl),
      name: "Media chính",
      mimeType: "",
      size: 0,
      publicId: "",
    },
    ...normalizedImages,
  ];
}

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
    const files = getImageFiles(imageFile);

    if (files.length === 0) {
      const savedImages = normalizeItemImages(itemForm.images);
      setImagePreviewUrl(itemForm.imageUrl || savedImages[0]?.url || "");
      return;
    }

    const firstFile = files[0];

    if (!(firstFile instanceof Blob)) {
      setImagePreviewUrl(itemForm.imageUrl || getPrimaryMediaUrl(itemForm.images));
      return;
    }

    const objectUrl = URL.createObjectURL(firstFile);
    setImagePreviewUrl(objectUrl);

    return () => URL.revokeObjectURL(objectUrl);
  }, [imageFile, itemForm.imageUrl, itemForm.images]);

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
    setItemForm({
      ...createEmptyItemForm(),
      images: [],
    });
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

      const filesToUpload = getImageFiles(imageFile);

      let finalImages = mergeMainUrlIntoImages(
        itemForm.imageUrl || "",
        itemForm.images || []
      );

      if (filesToUpload.length > 0) {
        const uploadedImages = await uploadMediaFilesToCloudinary(
          filesToUpload,
          `hop-cafe/${DEFAULT_SHOP_ID}/items`
        );

        finalImages = [
          ...normalizeItemImages(uploadedImages),
          ...normalizeItemImages(finalImages),
        ];
      }

      const imageUrl = getPrimaryMediaUrl(finalImages);

      const payload = {
        name: itemForm.name,
        description: itemForm.description,
        price: mainPrice,
        oldPrice: mainOldPrice,
        imageUrl,
        images: finalImages,
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
      setError(
        err?.message ||
          "Không thể lưu món. Vui lòng kiểm tra Cloudinary hoặc dữ liệu món."
      );
    } finally {
      setItemSubmitting(false);
    }
  }

  function handleEditItem(item) {
    setEditingItemId(item.id);
    setImageFile(null);

    const itemImages = normalizeItemImages(item.images);
    const imageUrl = item.imageUrl || getPrimaryMediaUrl(itemImages);

    setItemForm({
      name: item.name || "",
      description: item.description || "",
      price: item.price || "",
      oldPrice: item.oldPrice || "",
      imageUrl,
      images: itemImages,
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