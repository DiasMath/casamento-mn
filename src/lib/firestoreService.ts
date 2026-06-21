import { db } from "./firebase";
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
} from "firebase/firestore";

export type GiftCategory =
  | "cozinha"
  | "quarto"
  | "sala"
  | "banheiro"
  | "lavanderia"
  | "decoracao"
  | "outros";

export type GiftPriority = "alta" | "media" | "baixa";

export interface Gift {
  id: string;
  title: string;
  marca?: string;
  image: string;
  total: number;
  raised: number;
  hidden: boolean;
  category: GiftCategory;
  priority: GiftPriority;
}

export interface RSVP {
  id: string;
  name: string;
  email?: string;
  guestsCount: number; // Total de pessoas (incluindo quem confirmou)
  confirmedAt: any; // Timestamp do Firestore
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
 * Ordena presentes: incompletos primeiro (A-Z), concluídos por último (A-Z)
 */
function sortGifts(gifts: Gift[]): Gift[] {
  return [...gifts].sort((a, b) => {
    const aCompleted = a.raised >= a.total;
    const bCompleted = b.raised >= b.total;
    if (aCompleted !== bCompleted) return aCompleted ? 1 : -1;
    return a.title.localeCompare(b.title, "pt-BR");
  });
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
      total: Number(data.total) || 0,
      raised: Number(data.raised) || 0,
      hidden: data.hidden ?? false,
      category: data.category ?? "outros",
      priority: data.priority ?? "media",
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
    total: gift.total,
    raised: gift.raised || 0,
    hidden: gift.hidden ?? false,
    category: gift.category ?? "outros",
    priority: gift.priority ?? "media",
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
        total: Number(data.total) || 0,
        raised: Number(data.raised) || 0,
        hidden: data.hidden ?? false,
        category: data.category ?? "outros",
        priority: data.priority ?? "media",
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
      confirmedAt: data.confirmedAt,
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
      console.error("Erro no listener de recados:", error);
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
) => {
  const db = getDb();

  // 1. Registra a contribuição individual para o histórico
  await addDoc(collection(db, "contributions"), {
    giftId,
    giftTitle: "", // opcional: salvar o título para facilitar a leitura no admin
    contributorName: contributorName || "Anônimo",
    value,
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
): Promise<string> => {
  const rsvpCol = collection(getDb(), "rsvps");
  const docRef = await addDoc(rsvpCol, {
    name: name.trim(),
    phone: phone.trim(),
    guestsCount: Number(guestsCount) || 1,
    confirmedAt: serverTimestamp(),
  });
  return docRef.id;
};

/**
 * Imagens do site (hero, capítulos da história)
 */
export type SiteImageKey = "hero" | "story1" | "story2" | "story3" | "story4";

export interface SiteImages {
  hero: string;
  story1: string;
  story2: string;
  story3: string;
  story4: string;
}

export const SITE_IMAGE_DEFAULTS: SiteImages = {
  hero: "",
  story1: "",
  story2: "",
  story3: "",
  story4: "",
};

export const getSiteImages = async (): Promise<SiteImages> => {
  try {
    const docRef = doc(getDb(), "settings", "siteImages");
    const docSnap = await import("firebase/firestore").then((m) =>
      m.getDoc(docRef),
    );
    if (docSnap.exists()) {
      const data = docSnap.data();
      return { ...SITE_IMAGE_DEFAULTS, ...data } as SiteImages;
    }
  } catch (error) {
    console.error("Erro ao buscar imagens do site:", error);
  }
  return SITE_IMAGE_DEFAULTS;
};

export const updateSiteImage = async (
  key: SiteImageKey,
  url: string,
): Promise<void> => {
  const docRef = doc(getDb(), "settings", "siteImages");
  const { setDoc } = await import("firebase/firestore");
  await setDoc(docRef, { [key]: url }, { merge: true });
};
