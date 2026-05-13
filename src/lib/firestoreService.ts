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
  DocumentData
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
  confirmedAt: any;    // Timestamp do Firestore
}

/**
 * Função utilitária (DRY) para garantir que o banco de dados foi inicializado
 * antes de qualquer operação. Lança um erro se houver falha na conexão.
 */
const getDb = () => {
  if (!db) {
    throw new Error("Firestore not initialized. Verifique as variáveis de ambiente.");
  }
  return db;
};

/**
 * Puxa todos os presentes ordenados por título
 */
export const getGifts = async (): Promise<Gift[]> => {
  const giftsCol = collection(getDb(), "gifts");
  const giftSnap = await getDocs(query(giftsCol, orderBy("title")));
  
  return giftSnap.docs.map(doc => {
    const data = doc.data() as DocumentData;
    return {
      id: doc.id,
      title: data.title,
      marca: data.marca || "",
      image: data.image,
      total: data.total,
      raised: data.raised
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
    raised: gift.raised || 0
  });
  return docRef.id;
};

/**
 * Atualiza um presente existente
 */
export const updateGift = async (id: string, gift: Partial<Omit<Gift, "id">>): Promise<void> => {
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
  const rsvpSnap = await getDocs(query(rsvpCol, orderBy("confirmedAt", "desc")));
  
  return rsvpSnap.docs.map(doc => {
    const data = doc.data() as DocumentData;
    return {
      id: doc.id,
      name: data.name,
      email: data.email,
      guestsCount: Number(data.guestsCount) || 1,
      confirmedAt: data.confirmedAt
    } as RSVP;
  });
};
