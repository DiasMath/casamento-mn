import { db } from "./firebase";
import { devLog } from "./devLog";
import {
  collection,
  addDoc,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  DocumentData,
  serverTimestamp,
  Timestamp,
  increment,
  onSnapshot,
  runTransaction,
} from "firebase/firestore";

export type GiftCategory =
  | "cozinha"
  | "quarto"
  | "sala"
  | "banheiro"
  | "lavanderia"
  | "decoracao"
  | "outros";

export type GiftPriority = "premium" | "alta" | "media" | "baixa";

export interface Gift {
  id: string;
  title: string;
  marca?: string;
  image: string;
  imageDesktop?: string;
  total: number;
  raised: number;
  hidden: boolean;
  category: GiftCategory;
  priority: GiftPriority;
  chaMode?: boolean;
  reservedBy?: string;
  reservedAt?: Timestamp;
  buyLink?: string;
  noValue?: boolean;
}

export type RSVPType = "familia_matheus" | "familia_nayana" | "amigos";

export interface RSVP {
  id: string;
  name: string;
  email?: string;
  guestsCount: number;
  attending: boolean;
  confirmedAt: any;
  type?: RSVPType;
}

export interface Message {
  id: string;
  name: string;
  text: string;
  createdAt: Timestamp;
}

export interface Contribution {
  id: string;
  giftId: string;
  giftTitle: string;
  contributorName: string;
  value: number;
  paymentMethod?: string;
  date: Timestamp;
}

/**
 * Função utilitária (DRY) para garantir que o banco de dados foi inicializado
 * antes de qualquer operação. Lança um erro se houver falha na conexão.
 */
const getDb = () => {
  if (!db) {
    throw new Error(
      "Firestore not initialized. Verifique as variáveis de ambiente.",
    );
  }
  return db;
};

/**
 * Ordena presentes: ordem alfabética
 */
function sortGifts(gifts: Gift[]): Gift[] {
  return [...gifts].sort((a, b) => a.title.localeCompare(b.title, "pt-BR"));
}

/**
 * Puxa todos os presentes: incompletos primeiro, concluídos por último
 */
export const getGifts = async (): Promise<Gift[]> => {
  const giftsCol = collection(getDb(), "gifts");
  const giftSnap = await getDocs(query(giftsCol, orderBy("title")));

  const gifts = giftSnap.docs.map((doc) => {
    const data = doc.data() as DocumentData;
    return {
      id: doc.id,
      title: data.title,
      marca: data.marca || "",
      image: data.image,
      imageDesktop: data.imageDesktop || "",
      total: Number(data.total) || 0,
      raised: Number(data.raised) || 0,
      hidden: data.hidden ?? false,
      category: data.category ?? "outros",
      priority: data.priority ?? "media",
      chaMode: data.chaMode ?? false,
      reservedBy: data.reservedBy || null,
      reservedAt: data.reservedAt || null,
      buyLink: data.buyLink || "",
      noValue: data.noValue ?? false,
    } as Gift;
  });

  return sortGifts(gifts);
};

/**
 * Adiciona um novo presente e retorna o ID
 */
export const addGift = async (gift: Omit<Gift, "id">): Promise<string> => {
  const giftsCol = collection(getDb(), "gifts");
  const docRef = await addDoc(giftsCol, {
    title: gift.title,
    marca: gift.marca || "",
    image: gift.image,
    imageDesktop: gift.imageDesktop || "",
    total: gift.total,
    raised: gift.raised || 0,
    hidden: gift.hidden ?? false,
    category: gift.category ?? "outros",
    priority: gift.priority ?? "media",
    chaMode: gift.chaMode ?? false,
    buyLink: gift.buyLink || "",
    noValue: gift.noValue ?? false,
  });
  return docRef.id;
};

/**
 * Atualiza um presente existente
 */
export const updateGift = async (
  id: string,
  gift: Partial<Omit<Gift, "id">>,
): Promise<void> => {
  const giftRef = doc(getDb(), "gifts", id);
  await updateDoc(giftRef, gift);
};

/**
 * Deleta um presente
 */
export const deleteGift = async (id: string): Promise<void> => {
  const giftRef = doc(getDb(), "gifts", id);
  await deleteDoc(giftRef);
};

/**
 * Alterna a visibilidade de um presente (oculto/visível)
 */
export const toggleGiftVisibility = async (
  id: string,
  hidden: boolean,
): Promise<void> => {
  const giftRef = doc(getDb(), "gifts", id);
  await updateDoc(giftRef, { hidden });
};

/**
 * Puxa apenas os presentes visíveis: incompletos primeiro, concluídos por último
 */
export const getVisibleGifts = async (): Promise<Gift[]> => {
  const giftsCol = collection(getDb(), "gifts");
  const giftSnap = await getDocs(query(giftsCol, orderBy("title")));

  const gifts = giftSnap.docs
    .map((doc) => {
      const data = doc.data() as DocumentData;
      return {
        id: doc.id,
        title: data.title,
        marca: data.marca || "",
        image: data.image,
        imageDesktop: data.imageDesktop || "",
        total: Number(data.total) || 0,
        raised: Number(data.raised) || 0,
        hidden: data.hidden ?? false,
        category: data.category ?? "outros",
        priority: data.priority ?? "media",
        chaMode: data.chaMode ?? false,
        reservedBy: data.reservedBy || null,
        reservedAt: data.reservedAt || null,
        buyLink: data.buyLink || "",
        noValue: data.noValue ?? false,
      } as Gift;
    })
    .filter((gift) => !gift.hidden);

  return sortGifts(gifts);
};

/**
 * Procura todas as confirmações de presença (RSVP)
 */
export const getRSVPs = async (): Promise<RSVP[]> => {
  const rsvpCol = collection(getDb(), "rsvps");
  // Ordena pelas confirmações mais recentes
  const rsvpSnap = await getDocs(
    query(rsvpCol, orderBy("confirmedAt", "desc")),
  );

  return rsvpSnap.docs.map((doc) => {
    const data = doc.data() as DocumentData;
    return {
      id: doc.id,
      name: data.name,
      email: data.email,
      guestsCount: Number(data.guestsCount) || 1,
      attending: data.attending ?? true,
      confirmedAt: data.confirmedAt,
      type: data.type || undefined,
    } as RSVP;
  });
};

/**
 * Puxa todos os recados ordenados pelos mais recentes
 */
export const getMessages = async (): Promise<Message[]> => {
  const msgCol = collection(getDb(), "messages");
  const msgSnap = await getDocs(query(msgCol, orderBy("createdAt", "desc")));

  return msgSnap.docs.map((doc) => {
    const data = doc.data() as DocumentData;
    return {
      id: doc.id,
      name: data.name,
      text: data.text,
      createdAt: data.createdAt,
    } as Message;
  });
};

/**
 * Escuta recados em tempo real. Retorna uma função de cleanup para unsubscribe.
 */
export const subscribeMessages = (
  callback: (messages: Message[]) => void,
  onError?: (error: Error) => void,
): (() => void) => {
  const msgCol = collection(getDb(), "messages");
  const q = query(msgCol, orderBy("createdAt", "desc"));

  return onSnapshot(
    q,
    (snapshot) => {
      const messages = snapshot.docs.map((doc) => {
        const data = doc.data() as DocumentData;
        return {
          id: doc.id,
          name: data.name,
          text: data.text,
          createdAt: data.createdAt,
        } as Message;
      });
      callback(messages);
    },
    (error) => {
      devLog.error("Erro no listener de recados:", error);
      onError?.(error);
    },
  );
};

/**
 * Adiciona um novo recado
 */
export const addMessage = async (
  name: string,
  text: string,
): Promise<string> => {
  const msgCol = collection(getDb(), "messages");
  const docRef = await addDoc(msgCol, {
    name,
    text,
    createdAt: serverTimestamp(),
  });
  return docRef.id;
};

/**
 * Puxa todas as contribuições ordenadas por data (mais recentes primeiro)
 */
export const getContributions = async (): Promise<Contribution[]> => {
  const col = collection(getDb(), "contributions");
  const snap = await getDocs(query(col, orderBy("date", "desc")));
  return snap.docs.map((doc) => {
    const data = doc.data() as DocumentData;
    return {
      id: doc.id,
      giftId: data.giftId,
      giftTitle: data.giftTitle || "",
      contributorName: data.contributorName || "Anônimo",
      value: Number(data.value) || 0,
      date: data.date,
    } as Contribution;
  });
};

export const registerContribution = async (
  giftId: string,
  value: number,
  contributorName: string,
  paymentMethod?: string,
) => {
  const db = getDb();

  // 1. Registra a contribuição individual para o histórico
  await addDoc(collection(db, "contributions"), {
    giftId,
    giftTitle: "", // opcional: salvar o título para facilitar a leitura no admin
    contributorName: contributorName || "Anônimo",
    value,
    paymentMethod: paymentMethod || "pix",
    date: serverTimestamp(),
  });

  // 2. Atualiza o valor total arrecadado no presente (Incremento)
  const giftRef = doc(db, "gifts", giftId);
  await updateDoc(giftRef, {
    raised: increment(value),
  });
};

/**
 * Adiciona uma nova confirmação de presença (RSVP)
 */
export const addRSVP = async (
  name: string,
  phone: string,
  guestsCount: number,
  type?: RSVPType,
): Promise<string> => {
  const rsvpCol = collection(getDb(), "rsvps");
  const docRef = await addDoc(rsvpCol, {
    name: name.trim(),
    phone: phone.trim(),
    guestsCount: Number(guestsCount) || 1,
    attending: true,
    type: type || null,
    confirmedAt: serverTimestamp(),
  });
  return docRef.id;
};

/**
 * Registra uma recusa de presença (RSVP decline)
 */
export const declineRSVP = async (name: string): Promise<string> => {
  const rsvpCol = collection(getDb(), "rsvps");
  const docRef = await addDoc(rsvpCol, {
    name: name.trim(),
    guestsCount: 0,
    attending: false,
    confirmedAt: serverTimestamp(),
  });
  return docRef.id;
};

/**
 * Imagens do site
 * - carousel1–6: imagens do carrossel hero
 * - story1–4: imagens dos capítulos (NossaHistoria)
 */
export type SiteImageKey =
  | "carousel1"
  | "carousel2"
  | "carousel3"
  | "carousel4"
  | "carousel5"
  | "carousel6"
  | "carousel1Desktop"
  | "carousel2Desktop"
  | "carousel3Desktop"
  | "carousel4Desktop"
  | "carousel5Desktop"
  | "carousel6Desktop"
  | "story1"
  | "story2"
  | "story3"
  | "story4"
  | "story1Desktop"
  | "story2Desktop"
  | "story3Desktop"
  | "story4Desktop";

export interface SiteImages {
  carousel1: string;
  carousel2: string;
  carousel3: string;
  carousel4: string;
  carousel5: string;
  carousel6: string;
  carousel1Desktop: string;
  carousel2Desktop: string;
  carousel3Desktop: string;
  carousel4Desktop: string;
  carousel5Desktop: string;
  carousel6Desktop: string;
  story1: string;
  story2: string;
  story3: string;
  story4: string;
  story1Desktop: string;
  story2Desktop: string;
  story3Desktop: string;
  story4Desktop: string;
}

export const SITE_IMAGE_DEFAULTS: SiteImages = {
  carousel1: "",
  carousel2: "",
  carousel3: "",
  carousel4: "",
  carousel5: "",
  carousel6: "",
  carousel1Desktop: "",
  carousel2Desktop: "",
  carousel3Desktop: "",
  carousel4Desktop: "",
  carousel5Desktop: "",
  carousel6Desktop: "",
  story1: "",
  story2: "",
  story3: "",
  story4: "",
  story1Desktop: "",
  story2Desktop: "",
  story3Desktop: "",
  story4Desktop: "",
};

const IMAGES_CACHE_KEY = "siteImagesCache";
let imagesCachePromise: Promise<SiteImages> | null = null;

export const getSiteImages = async (): Promise<SiteImages> => {
  // Return cached promise if available
  if (imagesCachePromise) return imagesCachePromise;

  // Check sessionStorage
  try {
    const cached = sessionStorage.getItem(IMAGES_CACHE_KEY);
    if (cached) return JSON.parse(cached);
  } catch {}

  imagesCachePromise = (async () => {
    try {
      const docRef = doc(getDb(), "settings", "siteImages");
      const docSnap = await import("firebase/firestore").then((m) =>
        m.getDoc(docRef),
      );
      if (docSnap.exists()) {
        const data = docSnap.data();
        const result = { ...SITE_IMAGE_DEFAULTS, ...data } as SiteImages;
        try { sessionStorage.setItem(IMAGES_CACHE_KEY, JSON.stringify(result)); } catch {}
        return result;
      }
    } catch (error) {
      devLog.error("Erro ao buscar imagens do site:", error);
    }
    return SITE_IMAGE_DEFAULTS;
  })();

  return imagesCachePromise;
};

export const updateSiteImage = async (
  key: SiteImageKey,
  url: string,
): Promise<void> => {
  const docRef = doc(getDb(), "settings", "siteImages");
  const { setDoc } = await import("firebase/firestore");
  await setDoc(docRef, { [key]: url }, { merge: true });
};

/**
 * Reserva um presente para o chá de panela (transação atômica)
 */
export const reserveGift = async (
  giftId: string,
  name: string,
): Promise<{ success: boolean; error?: string }> => {
  const db = getDb();
  try {
    await runTransaction(db, async (transaction) => {
      const giftRef = doc(db, "gifts", giftId);
      const giftSnap = await transaction.get(giftRef);

      if (!giftSnap.exists()) {
        throw new Error("Presente não encontrado");
      }

      const giftData = giftSnap.data();
      if (giftData.reservedBy) {
        throw new Error("Este presente já foi reservado por outra pessoa");
      }

      transaction.update(giftRef, {
        reservedBy: name.trim(),
        reservedAt: serverTimestamp(),
      });
    });
    return { success: true };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Erro ao reservar presente";
    return { success: false, error: message };
  }
};

/**
 * Cancela a reserva de um presente (apenas admin)
 */
export const cancelReservation = async (giftId: string): Promise<void> => {
  const giftRef = doc(getDb(), "gifts", giftId);
  await updateDoc(giftRef, {
    reservedBy: null,
    reservedAt: null,
  });
};

export interface ColorPalette {
  id: string;
  name: string;
  hex: string;
}

const DEFAULT_PALETTE: ColorPalette[] = [
  { id: "1", name: "Bege", hex: "#FFFDD0" },
  { id: "2", name: "Preto", hex: "#1a1a1a" },
  { id: "3", name: "Cinza", hex: "#9e9e9e" },
  { id: "4", name: "Branco", hex: "#f5f5f5" },
  { id: "5", name: "Marrom", hex: "#6d4c2a" },
];

export const getColorPalette = async (): Promise<ColorPalette[]> => {
  try {
    const docRef = doc(getDb(), "settings", "colorPalette");
    const docSnap = await import("firebase/firestore").then((m) =>
      m.getDoc(docRef),
    );
    if (docSnap.exists()) {
      const data = docSnap.data();
      return (data.colors as ColorPalette[]) || DEFAULT_PALETTE;
    }
  } catch (error) {
    devLog.error("Erro ao buscar paleta de cores:", error);
  }
  return DEFAULT_PALETTE;
};

export const updateColorPalette = async (
  colors: ColorPalette[],
): Promise<void> => {
  const docRef = doc(getDb(), "settings", "colorPalette");
  const { setDoc } = await import("firebase/firestore");
  await setDoc(docRef, { colors }, { merge: true });
};

export interface SiteSettings {
  coupleBride: string;
  coupleGroom: string;
  weddingDate: string;
  weddingTime: string;
  weddingVenueName: string;
  weddingVenueAddress: string;
  weddingMapsUrl: string;
  chaDate: string;
  chaTime: string;
  chaVenueAddress: string;
  chaMapsUrl: string;
  chaDePanelaEnabled: boolean;
  customCategories?: Array<{ value: string; label: string; icon: string }>;
}

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

export const getSiteSettings = async (): Promise<SiteSettings> => {
  try {
    const docRef = doc(getDb(), "settings", "siteConfig");
    const docSnap = await import("firebase/firestore").then((m) =>
      m.getDoc(docRef),
    );
    if (docSnap.exists()) {
      return { ...DEFAULT_SETTINGS, ...docSnap.data() } as SiteSettings;
    }
  } catch (error) {
    devLog.error("Erro ao buscar configurações:", error);
  }
  return DEFAULT_SETTINGS;
};

export const updateSiteSettings = async (
  settings: Partial<SiteSettings>,
): Promise<void> => {
  const docRef = doc(getDb(), "settings", "siteConfig");
  const { setDoc } = await import("firebase/firestore");
  await setDoc(docRef, settings, { merge: true });
};
