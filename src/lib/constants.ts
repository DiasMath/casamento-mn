import { PIX_KEY } from "./firebase";
import type { GiftCategory, GiftPriority } from "./firestoreService";

export const COUPLE = {
  bride: "Nayana",
  groom: "Matheus",
} as const;

export const WEDDING_DATE = new Date("2027-02-14T15:00:00");

export const WEDDING_VENUE = {
  name: "Quinta dos Jardins",
  address: "Estrada das Acácias, 1200 — Itaipava, RJ",
  city: "Itaipava, RJ",
} as const;

export const GIFT_CATEGORIES: {
  value: GiftCategory;
  label: string;
  icon: string;
}[] = [
  { value: "cozinha", label: "Cozinha", icon: "🍳" },
  { value: "quarto", label: "Quarto", icon: "🛏️" },
  { value: "sala", label: "Sala", icon: "🛋️" },
  { value: "banheiro", label: "Banheiro", icon: "🚿" },
  { value: "lavanderia", label: "Lavanderia", icon: "👕" },
  { value: "decoracao", label: "Decoração", icon: "🎨" },
  { value: "outros", label: "Outros", icon: "📦" },
];

export const GIFT_PRIORITIES: {
  value: GiftPriority;
  label: string;
  icon: string;
}[] = [
  { value: "alta", label: "Alta", icon: "⭐" },
  { value: "media", label: "Média", icon: "✨" },
  { value: "baixa", label: "Baixa", icon: "○" },
];

export { PIX_KEY };
