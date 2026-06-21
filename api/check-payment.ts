import type { VercelRequest, VercelResponse } from "@vercel/node";
import { MercadoPagoConfig, Payment } from "mercadopago";
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
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Método não permitido" });
  }

  const paymentId = req.query.id as string;

  if (!paymentId) {
    return res.status(400).json({ error: "id é obrigatório" });
  }

  try {
    const client = new MercadoPagoConfig({
      accessToken: process.env.MP_ACCESS_TOKEN || "",
    });
    const payment = new Payment(client);
    const paymentData = await payment.get({ id: Number(paymentId) });

    if (paymentData.status === "approved" && paymentData.payment_method_id === "pix") {
      const giftId = paymentData.metadata?.gift_id;
      const value = paymentData.transaction_amount;
      const contributorName = paymentData.metadata?.contributor_name || "Anônimo";

      if (giftId && value) {
        const existing = await db
          .collection("contributions")
          .where("paymentId", "==", paymentData.id)
          .limit(1)
          .get();

        if (existing.empty) {
          const giftRef = db.collection("gifts").doc(giftId);

          await giftRef.update({
            raised: admin.firestore.FieldValue.increment(value),
          });

          await db.collection("contributions").add({
            giftId,
            contributorName,
            value,
            date: admin.firestore.FieldValue.serverTimestamp(),
            paymentId: paymentData.id,
            method: "pix",
          });

          console.log(`[CheckPayment] Pagamento processado via polling: R$ ${value} → ${giftId}`);
        }
      }
    }

    return res.status(200).json({
      status: paymentData.status,
      payment_method: paymentData.payment_method_id,
    });
  } catch (error: unknown) {
    console.error("[CheckPayment] Erro:", error);
    const err = error as { status?: number; message?: string };
    return res.status(err.status || 500).json({
      error: err.message || "Erro ao verificar pagamento",
    });
  }
}
