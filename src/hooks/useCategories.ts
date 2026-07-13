import { useState, useEffect } from "react";
import { getSiteSettings } from "@/lib/firestoreService";
import { GIFT_CATEGORIES } from "@/lib/constants";

interface Category {
  value: string;
  label: string;
  icon: string;
}

export function clearCategoriesCache() {
  try {
    sessionStorage.removeItem("allCategoriesCache");
  } catch {}
}

export function useCategories() {
  const [customCategories, setCustomCategories] = useState<Category[]>([]);

  useEffect(() => {
    getSiteSettings()
      .then((s) => {
        setCustomCategories(s.customCategories || []);
      })
      .catch(() => {});
  }, []);

  const allCategories: Category[] = [...GIFT_CATEGORIES, ...customCategories];

  return { allCategories, customCategories };
}
