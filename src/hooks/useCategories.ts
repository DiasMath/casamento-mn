import { useState, useEffect } from "react";
import { getSiteSettings } from "@/lib/firestoreService";
import { GIFT_CATEGORIES } from "@/lib/constants";

interface Category {
  value: string;
  label: string;
  icon: string;
}

const CACHE_KEY = "allCategoriesCache";

function getCachedCustom(): Category[] | null {
  try {
    const cached = sessionStorage.getItem(CACHE_KEY);
    if (cached) return JSON.parse(cached);
  } catch { /* empty */ }
  return null;
}

function cacheCustom(categories: Category[]) {
  try {
    sessionStorage.setItem(CACHE_KEY, JSON.stringify(categories));
  } catch { /* empty */ }
}

export function clearCategoriesCache() {
  try {
    sessionStorage.removeItem(CACHE_KEY);
  } catch { /* empty */ }
}

export function useCategories() {
  const cached = getCachedCustom();
  const [customCategories, setCustomCategories] = useState<Category[]>(
    cached || [],
  );

  useEffect(() => {
    if (cached) return;
    getSiteSettings()
      .then((s) => {
        const cats = s.customCategories || [];
        setCustomCategories(cats);
        cacheCustom(cats);
      })
      .catch(() => {});
  }, [cached]);

  const allCategories: Category[] = [...GIFT_CATEGORIES, ...customCategories];

  return { allCategories, customCategories };
}
