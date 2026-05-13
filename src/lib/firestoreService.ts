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
  QuerySnapshot
} from "firebase/firestore";

export interface Gift {
  id: string;
  title: string;
  image: string;
  total: number;
  raised: number;
}

/**
 * Get all gifts from Firestore, ordered by title
 */
export const getGifts = async (): Promise<Gift[]> => {
  if (!db) {
    throw new Error("Firestore not initialized");
  }
  const giftsCol = collection(db, "gifts");
  const giftSnap = await getDocs(query(giftsCol, orderBy("title")));
  return giftSnap.docs.map(doc => {
    const data = doc.data() as DocumentData;
    return {
      id: doc.id,
      title: data.title,
      image: data.image,
      total: data.total,
      raised: data.raised
    } as Gift;
  });
};

/**
 * Add a new gift to Firestore
 * @returns The ID of the newly created gift
 */
export const addGift = async (gift: Omit<Gift, "id">): Promise<string> => {
  if (!db) {
    throw new Error("Firestore not initialized");
  }
  const giftsCol = collection(db, "gifts");
  const docRef = await addDoc(giftsCol, {
    title: gift.title,
    image: gift.image,
    total: gift.total,
    raised: gift.raised || 0
  });
  return docRef.id;
};

/**
 * Update an existing gift in Firestore
 */
export const updateGift = async (id: string, gift: Partial<Omit<Gift, "id">>): Promise<void> => {
  if (!db) {
    throw new Error("Firestore not initialized");
  }
  const giftRef = doc(db, "gifts", id);
  await updateDoc(giftRef, gift);
};

/**
 * Delete a gift from Firestore
 */
export const deleteGift = async (id: string): Promise<void> => {
  if (!db) {
    throw new Error("Firestore not initialized");
  }
  const giftRef = doc(db, "gifts", id);
  await deleteDoc(giftRef);
};