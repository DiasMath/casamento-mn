import type { VercelRequest, VercelResponse } from "@vercel/node";
import { MercadoPagoConfig, Payment } from "mercadopago";

// Criar o client uma única vez (melhor performance)
const mpClient = new MercadoPagoConfig({
  accessToken: process.env.MP_ACCESS_TOKEN || "",
});
const mpPayment = new Payment(mpClient);

interface PaymentRequest {
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
    const { amount, description, giftId, payerName } =
      req.body as PaymentRequest;

    // Validar campos obrigatórios
    if (!amount || amount <= 0 || !description || !giftId) {
      return res.status(400).json({ error: "Parâmetros inválidos" });
    }

    // 1. Identifica o host
    const host =
      req.headers.host || (req.headers["x-forwarded-host"] as string);
    const isLocal = host?.includes("localhost") || host?.includes("127.0.0.1");

    const protocol = isLocal ? "http" : "https";
    const baseUrl = `${protocol}://${host}`;

    // 2. Monta o corpo da requisição
    // Nota: payer.email é obrigatório pela API do Mercado Pago para PIX,
    // mesmo que o convidado não informe. Usamos um email genérico.
    const body: Record<string, unknown> = {
      transaction_amount: Number(amount),
      description: `Presente: ${description}`,
      payment_method_id: "pix",
      payer: {
        email: "convidado@casamento.com",
        first_name: payerName || "Convidado",
      },
      metadata: {
        gift_id: giftId,
        contributor_name: payerName || "Anônimo",
      },
    };

    // 3. SÓ ADICIONA A URL DE NOTIFICAÇÃO SE NÃO FOR LOCALHOST
    // O Mercado Pago exige HTTPS e uma URL pública para aceitar o atributo
    if (!isLocal && baseUrl.startsWith("https://")) {
      body.notification_url = `${baseUrl}/api/webhook`;
    }

    const result = await mpPayment.create({ body });

    return res.status(200).json({
      id: result.id,
      qr_code: result.point_of_interaction?.transaction_data?.qr_code,
      qr_code_base64:
        result.point_of_interaction?.transaction_data?.qr_code_base64,
    });
  } catch (error: unknown) {
    console.error("Erro ao gerar PIX:", error);
    const err = error as { status?: number; message?: string };
    return res.status(err.status || 500).json({
      error: err.message || "Erro ao gerar pagamento",
    });
  }
}
