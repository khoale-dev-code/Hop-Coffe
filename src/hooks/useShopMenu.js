import { useCallback, useEffect, useState } from "react";
import { getShopBySlug } from "../services/shopService";
import { getCategories } from "../services/categoryService";
import { getItems } from "../services/itemService";
import { getActivePromotions } from "../services/promotionService";

export function useShopMenu(shopSlug) {
  const [shop, setShop] = useState(null);
  const [categories, setCategories] = useState([]);
  const [items, setItems] = useState([]);
  const [promotions, setPromotions] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadMenu = useCallback(async () => {
    if (!shopSlug) return;

    try {
      setLoading(true);
      setError("");

      const shopData = await getShopBySlug(shopSlug);

      if (!shopData) {
        setShop(null);
        setCategories([]);
        setItems([]);
        setPromotions([]);
        return;
      }

      const [categoryData, itemData, promotionData] = await Promise.all([
        getCategories(shopData.id),
        getItems(shopData.id),
        getActivePromotions(shopData.id).catch((err) => {
          console.error("Không thể tải khuyến mãi:", err);
          return [];
        }),
      ]);

      setShop(shopData);
      setCategories(categoryData.filter((category) => category.isActive !== false));
      setItems(itemData);
      setPromotions(promotionData);

      console.log("SHOP CLIENT ĐANG ĐỌC:", shopData.id);
      console.log("PROMOTIONS CLIENT NHẬN:", promotionData);
    } catch (err) {
      console.error(err);
      setError("Không thể tải menu. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  }, [shopSlug]);

  useEffect(() => {
    loadMenu();
  }, [loadMenu]);

  return {
    shop,
    categories,
    items,
    promotions,
    loading,
    error,
    refresh: loadMenu,
  };
}