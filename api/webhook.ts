import type { VercelRequest, VercelResponse } from '@vercel/node';
import { MercadoPagoConfig, Payment } from 'mercadopago';
import * as admin from 'firebase-admin';

// Inicializa o Firebase Admin apenas se ainda não estiver inicializado
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      // O replace é necessário porque chaves privadas em variáveis de ambiente 
      // muitas vezes perdem a quebra de linha real
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
  });
}

const db = admin.firestore();

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // O Mercado Pago envia notificações via POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  try {
    // Ajuste para o TypeScript entender os formatos de query da Vercel
    const topic = req.query.topic || req.query.type || req.body?.type;
    
    // Usamos ['data.id'] porque na URL vem exatamente ?data.id=numero
    const paymentId = req.query['data.id'] || req.query.id || req.body?.data?.id;

    // Só processamos notificações referentes a pagamentos
    if (topic === 'payment' && paymentId) {
      
      const client = new MercadoPagoConfig({ 
        accessToken: process.env.MP_ACCESS_TOKEN || '' 
      });
      const payment = new Payment(client);

      // Busca os dados atualizados e reais do pagamento na API do Mercado Pago
      // Isso é uma medida de segurança para evitar que alguém forje uma requisição falsa
      const paymentData = await payment.get({ id: Number(paymentId) });

      // Confirma se o pagamento foi realmente aprovado
      if (paymentData.status === 'approved') {
        
        // Pega os dados que enviamos na criação do PIX (no objeto metadata)
        const giftId = paymentData.metadata?.gift_id;
        const value = paymentData.transaction_amount;
        const contributorName = paymentData.metadata?.contributor_name || 'Anônimo';

        if (giftId && value) {
          const giftRef = db.collection('gifts').doc(giftId);
          
          // 1. Atualiza o valor arrecadado do presente incrementando o valor pago
          await giftRef.update({
            raised: admin.firestore.FieldValue.increment(value)
          });

          // 2. Salva um registro na coleção de contribuições para o painel de controle
          await db.collection('contributions').add({
            giftId,
            contributorName,
            value,
            date: admin.firestore.FieldValue.serverTimestamp(),
            paymentId: paymentData.id, // Salva o ID da transação para controle
            method: 'pix'
          });

          console.log(`[Webhook] Pagamento de R$ ${value} aprovado para o presente ${giftId}`);
        }
      }
    }

    // É OBRIGATÓRIO responder com status 200 (OK) rápido.
    // Caso contrário, o Mercado Pago achará que deu erro e ficará reenviando a notificação.
    return res.status(200).send('OK');

  } catch (error) {
    console.error('Erro ao processar Webhook:', error);
    // Retornamos 500 para que o Mercado Pago tente novamente mais tarde em caso de falha no servidor
    return res.status(500).send('Erro interno do servidor');
  }
}