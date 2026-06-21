import type { VercelRequest, VercelResponse } from "@vercel/node";
import admin from "firebase-admin";

if (!admin.apps.length) {
  const pk = process.env.FIREBASE_PRIVATE_KEY;
  const cleanKey = pk?.replace(/\\n/g, "\n")?.replace(/\\r/g, "")?.trim();

  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: cleanKey,
    }),
  });
}

const db = admin.firestore();

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método não permitido" });
  }

  const { giftId, amount, contributorName } = req.body || {};

  if (!giftId || !amount || amount <= 0) {
    return res.status(400).json({ error: "giftId e amount são obrigatórios" });
  }

  try {
    const giftRef = db.collection("gifts").doc(giftId);
    const giftSnap = await giftRef.get();

    if (!giftSnap.exists) {
      return res.status(404).json({ error: "Presente não encontrado" });
    }

    await giftRef.update({
      raised: admin.firestore.FieldValue.increment(Number(amount)),
    });

    await db.collection("contributions").add({
      giftId,
      contributorName: contributorName || "Teste",
      value: Number(amount),
      date: admin.firestore.FieldValue.serverTimestamp(),
      paymentId: `test-${Date.now()}`,
      method: "pix",
    });

    return res.status(200).json({
      success: true,
      message: `Presente ${giftId} atualizado com +R$ ${amount}`,
    });
  } catch (error: any) {
    console.error("[TestWebhook] Erro:", error);
    return res.status(500).json({
      error: error?.message || "Erro interno",
    });
  }
}
