import { useState, useEffect } from "react";
import { getSiteSettings, type SiteSettings } from "@/lib/firestoreService";

const DEFAULT_SETTINGS: SiteSettings = {
  coupleBride: "Nayana",
  coupleGroom: "Matheus",
  weddingDate: "2027-02-14",
  weddingTime: "15:00",
  weddingVenueName: "Quinta dos Jardins",
  weddingVenueAddress: "Estrada das Acácias, 1200 — Itaipava, RJ",
  chaDate: "2026-09-30",
  chaTime: "14:00",
  chaVenueAddress: "Rua Parintis, 516 — RJ",
};

export function useSiteSettings() {
  const [settings, setSettings] = useState<SiteSettings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getSiteSettings()
      .then((s) => {
        setSettings(s);
      })
      .catch(() => {})
      .finally(() => {
        setLoading(false);
      });
  }, []);

  return { settings, loading };
}
