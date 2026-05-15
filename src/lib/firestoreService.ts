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
} from "firebase/firestore";

export interface Gift {
  id: string;
  title: string;
  marca?: string;
  image: string;
  total: number;
  raised: number;
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
 * Puxa todos os presentes ordenados por título
 */
export const getGifts = async (): Promise<Gift[]> => {
  const giftsCol = collection(getDb(), "gifts");
  const giftSnap = await getDocs(query(giftsCol, orderBy("title")));

  return giftSnap.docs.map((doc) => {
    const data = doc.data() as DocumentData;
    return {
      id: doc.id,
      title: data.title,
      marca: data.marca || "",
      image: data.image,
      total: Number(data.total) || 0,
      raised: Number(data.raised) || 0,
    } as Gift;
  });
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
