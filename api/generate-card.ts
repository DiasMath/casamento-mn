import type { VercelRequest, VercelResponse } from "@vercel/node";
import { MercadoPagoConfig, Preference } from "mercadopago";

const mpClient = new MercadoPagoConfig({
  accessToken: process.env.MP_ACCESS_TOKEN || "",
});
const mpPreference = new Preference(mpClient);

interface CardRequest {
  amount: number;
  description: string;
  giftId: string;
  payerName?: string;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método não permitido" });
  }

  try {
    const { amount, description, giftId, payerName } = req.body as CardRequest;

    if (!amount || amount <= 0 || !description || !giftId) {
      return res.status(400).json({ error: "Parâmetros inválidos" });
    }

    const host =
      req.headers.host || (req.headers["x-forwarded-host"] as string);
    const isLocal = host?.includes("localhost") || host?.includes("127.0.0.1");

    const protocol = isLocal ? "http" : "https";
    const baseUrl = `${protocol}://${host}`;

    const result = await mpPreference.create({
      body: {
        items: [
          {
            id: giftId,
            title: `Presente: ${description}`,
            quantity: 1,
            unit_price: Number(amount),
            currency_id: "BRL",
          },
        ],
        payer: {
          name: payerName || "Convidado",
          email: "convidado@casamento.com",
        },
        metadata: {
          gift_id: giftId,
          contributor_name: payerName || "Anônimo",
        },
        external_reference: giftId,
        ...(isLocal
          ? {}
          : {
              back_urls: {
                success: `${baseUrl}/cha-de-panela?payment=success`,
                failure: `${baseUrl}/cha-de-panela?payment=failure`,
                pending: `${baseUrl}/cha-de-panela?payment=pending`,
              },
              auto_return: "approved",
              notification_url: `${baseUrl}/api/webhook`,
            }),
      },
    });

    return res.status(200).json({
      checkout_url: result.init_point,
    });
  } catch (error: unknown) {
    console.error("Erro ao criar preferência:", error);
    const err = error as { status?: number; message?: string };
    return res.status(err.status || 500).json({
      error: err.message || "Erro ao criar checkout",
    });
  }
}
