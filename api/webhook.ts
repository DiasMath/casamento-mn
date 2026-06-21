import type { VercelRequest, VercelResponse } from "@vercel/node";
import { MercadoPagoConfig, Payment } from "mercadopago";
import * as admin from "firebase-admin";
import crypto from "crypto";

// Inicializa o Firebase Admin apenas se ainda não estiver inicializado
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      // O replace é necessário porque chaves privadas em variáveis de ambiente
      // muitas vezes perdem a quebra de linha real
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    }),
  });
}

const db = admin.firestore();

// Função para validar a assinatura do webhook do Mercado Pago
function validateSignature(req: VercelRequest): boolean {
  const signature = req.headers["x-signature"] as string;
  const timestamp = req.headers["x-signature-ts"] as string;
  const secret = process.env.MP_WEBHOOK_SECRET;
  const paymentId = req.query["data.id"] || req.query.id || req.body?.data?.id;

  // Se for o ID de teste do Mercado Pago (123456), aceitar sem validar
  if (paymentId === "123456") {
    console.log(
      "[Webhook] ℹ️ Teste do Mercado Pago detectado - pulando validação",
    );
    return true;
  }

  // Se não tiver assinatura configurada, permite (para desenvolvimento)
  if (!secret) {
    console.log(
      "[Webhook] ⚠️ MP_WEBHOOK_SECRET não configurada - validando via API",
    );
    return true;
  }

  // Se não tiver os headers, permite mas loga (para debug)
  if (!signature || !timestamp) {
    console.log(
      "[Webhook] ⚠️ Assinatura não enviada, verificando via API do MP",
    );
    return true; // Permite e verifica via API do MP depois
  }

  // O Mercado Pago usa o formato: sha256=<assinatura>
  // A assinatura é gerada a partir de: id + timestamp + body + secret
  const bodyStr = JSON.stringify(req.body);

  const dataToSign = `${paymentId}${timestamp}${bodyStr}`;
  const expectedSignature = crypto
    .createHmac("sha256", secret)
    .update(dataToSign)
    .digest("hex");

  const providedSignature = signature.replace("sha256=", "");

  const isValid = providedSignature === expectedSignature;

  if (!isValid) {
    console.log(
      "[Webhook] ⚠️ Assinatura inválida, mas verificando via API do MP",
      {
        expected: expectedSignature,
        provided: providedSignature,
      },
    );
    // Não rejeita, vai verificar via API do MP
  } else {
    console.log("[Webhook] ✓ Assinatura válida");
  }

  return true; // Sempre permite, a validação real será via API do MP
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // O Mercado Pago envia notificações via POST
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método não permitido" });
  }

  // Validar assinatura antes de processar
  if (!validateSignature(req)) {
    console.log("[Webhook] ✗ Requisição rejeitada - assinatura inválida");
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    // Log inicial para debug em produção
    console.log("[Webhook] Requisição recebida:", {
      method: req.method,
      query: req.query,
      headers: {
        "content-type": req.headers["content-type"],
        "user-agent": req.headers["user-agent"],
      },
    });

    // Ajuste para o TypeScript entender os formatos de query da Vercel
    const topic = req.query.topic || req.query.type || req.body?.type;

    // Usamos ['data.id'] porque na URL vem exatamente ?data.id=numero
    const paymentId =
      req.query["data.id"] || req.query.id || req.body?.data?.id;

    console.log("[Webhook] Topic:", topic, "| PaymentID:", paymentId);

    // Só processamos notificações referentes a pagamentos
    if (topic === "payment" && paymentId) {
      // Se for o ID de teste, retorna OK sem processar
      if (paymentId === "123456") {
        console.log("[Webhook] ℹ️ Teste do MP aceito - retornando OK");
        return res.status(200).send("OK");
      }

      const client = new MercadoPagoConfig({
        accessToken: process.env.MP_ACCESS_TOKEN || "",
      });
      const payment = new Payment(client);

      // Busca os dados atualizados e reais do pagamento na API do Mercado Pago
      // Isso é uma medida de segurança para evitar que alguém forje uma requisição falsa
      const paymentData = await payment.get({ id: Number(paymentId) });

      console.log("[Webhook] Payment Data:", {
        id: paymentData.id,
        status: paymentData.status,
        payment_method_id: paymentData.payment_method_id,
        transaction_amount: paymentData.transaction_amount,
        metadata: paymentData.metadata,
      });

      // Validar se é pagamento PIX
      if (paymentData.payment_method_id !== "pix") {
        console.log(
          "[Webhook] Ignorando - não é PIX:",
          paymentData.payment_method_id,
        );
        return res.status(200).send("OK");
      }

      // Tratar múltiplos status - não só 'approved'
      // PIX pode ficar 'pending' antes de 'approved'
      const validStatuses = ["approved", "pending"];

      if (!validStatuses.includes(paymentData.status)) {
        console.log("[Webhook] Status ignorado:", paymentData.status);
        return res.status(200).send("OK");
      }

      // Se for 'pending', significa que o pagamento foi iniciado mas ainda não aprovado
      // Não atualizar ainda - só quando for 'approved'
      if (paymentData.status === "pending") {
        console.log("[Webhook] Pagamento pendente, aguardando aprovação...");
        return res.status(200).send("OK");
      }

      // Confirma se o pagamento foi realmente aprovado
      if (paymentData.status === "approved") {
        // Pega os dados que enviamos na criação do PIX (no objeto metadata)
        const giftId = paymentData.metadata?.gift_id;
        const value = paymentData.transaction_amount;
        const contributorName =
          paymentData.metadata?.contributor_name || "Anônimo";

        if (giftId && value) {
          // Verificar se já processamos este pagamento (proteção contra duplicidade)
          const existing = await db
            .collection("contributions")
            .where("paymentId", "==", paymentData.id)
            .limit(1)
            .get();

          if (!existing.empty) {
            console.log(
              "[Webhook] Pagamento já processado, ignorando:",
              paymentData.id,
            );
            return res.status(200).send("OK");
          }

          console.log("[Webhook] Processando pagamento:", {
            giftId,
            value,
            contributorName,
          });

          const giftRef = db.collection("gifts").doc(giftId);

          // 1. Atualiza o valor arrecadado do presente incrementando o valor pago
          await giftRef.update({
            raised: admin.firestore.FieldValue.increment(value),
          });

          // 2. Salva um registro na coleção de contribuições para o painel de controle
          await db.collection("contributions").add({
            giftId,
            contributorName,
            value,
            date: admin.firestore.FieldValue.serverTimestamp(),
            paymentId: paymentData.id,
            method: "pix",
          });

          console.log(
            `[Webhook] ✓ Pagamento de R$ ${value} aprovado para o presente ${giftId}`,
          );
        } else {
          console.log("[Webhook] ✗ GiftID ou value não encontrado:", {
            giftId,
            value,
          });
        }
      }
    } else {
      console.log("[Webhook] Topic não é payment ou não há paymentId:", {
        topic,
        paymentId,
      });
    }

    // É OBRIGATÓRIO responder com status 200 (OK) rápido.
    // Caso contrário, o Mercado Pago achará que deu erro e ficará reenviando a notificação.
    return res.status(200).send("OK");
  } catch (error) {
    console.error("Erro ao processar Webhook:", error);
    // Retornamos 500 para que o Mercado Pago tente novamente mais tarde em caso de falha no servidor
    return res.status(500).send("Erro interno do servidor");
  }
}
