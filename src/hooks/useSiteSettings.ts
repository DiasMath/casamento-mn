import { useState, useEffect } from "react";
import { getSiteSettings, type SiteSettings } from "@/lib/firestoreService";

const DEFAULT_SETTINGS: SiteSettings = {
  coupleBride: "Nayana",
  coupleGroom: "Matheus",
  weddingDate: "2027-02-14",
  weddingTime: "15:00",
  weddingVenueName: "Quinta dos Jardins",
  weddingVenueAddress: "Estrada das Acácias, 1200 — Itaipava, RJ",
  weddingMapsUrl: "",
  chaDate: "2026-09-30",
  chaTime: "14:00",
  chaVenueAddress: "Rua Parintis, 516 — RJ",
  chaMapsUrl: "",
  chaDePanelaEnabled: true,
};

const CACHE_KEY = "siteSettingsCache";

function getCachedSettings(): SiteSettings | null {
  try {
    const cached = sessionStorage.getItem(CACHE_KEY);
    if (cached) return JSON.parse(cached);
  } catch {}
  return null;
}

function cacheSettings(settings: SiteSettings) {
  try {
    sessionStorage.setItem(CACHE_KEY, JSON.stringify(settings));
  } catch {}
}

export function useSiteSettings() {
  const cached = getCachedSettings();
  const [settings, setSettings] = useState<SiteSettings>(cached || DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(!cached);

  useEffect(() => {
    if (cached) return;
    getSiteSettings()
      .then((s) => {
        setSettings(s);
        cacheSettings(s);
      })
      .catch(() => {})
      .finally(() => {
        setLoading(false);
      });
  }, []);

  return { settings, loading };
}
