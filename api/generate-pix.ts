import type { VercelRequest, VercelResponse } from '@vercel/node';
import { MercadoPagoConfig, Payment } from 'mercadopago';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Só aceita requisições POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  try {
    const { amount, description, giftId, payerName } = req.body;

    // 1. Inicializa o Mercado Pago com o seu Token
    // (Na Vercel, você vai cadastrar essa variável MP_ACCESS_TOKEN)
    const client = new MercadoPagoConfig({ 
      accessToken: process.env.MP_ACCESS_TOKEN || '' 
    });

    const payment = new Payment(client);

    // 2. Cria a requisição do PIX
    const requestOptions = {
      body: {
        transaction_amount: Number(amount),
        description: `Presente: ${description}`,
        payment_method_id: 'pix',
        payer: {
          // O Mercado Pago exige um email, podemos gerar um fictício se o convidado não fornecer
          email: 'convidado@casamento.com', 
          first_name: payerName || 'Convidado',
        },
        // IMPORTANTÍSSIMO: É aqui que você manda o ID do presente
        // para o Mercado Pago devolver no Webhook depois
        metadata: {
          gift_id: giftId,
          contributor_name: payerName || 'Anônimo'
        }
      }
    };

    // 3. Pede ao Mercado Pago para gerar o PIX
    const result = await payment.create(requestOptions);

    // 4. Devolve o PIX para o seu Frontend (React) mostrar na tela
    return res.status(200).json({
      id: result.id,
      qr_code: result.point_of_interaction?.transaction_data?.qr_code,
      qr_code_base64: result.point_of_interaction?.transaction_data?.qr_code_base64,
    });

  } catch (error) {
    console.error('Erro ao gerar PIX:', error);
    return res.status(500).json({ error: 'Erro ao gerar pagamento' });
  }
}