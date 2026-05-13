import type { VercelRequest, VercelResponse } from '@vercel/node';
import { MercadoPagoConfig, Payment } from 'mercadopago';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Só aceita requisições POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  try {
    const { amount, description, giftId, payerName } = req.body;

    // 1. Inicializa o Mercado Pago com o seu Token de Produção
    const client = new MercadoPagoConfig({ 
      accessToken: process.env.MP_ACCESS_TOKEN || '' 
    });

    const payment = new Payment(client);

    // 2. Descobre automaticamente a URL do seu site (para não ter que digitar na mão)
    // Na Vercel, isso vai pegar "https://seu-projeto.vercel.app"
    const host = req.headers.host || req.headers['x-forwarded-host'];
    const protocol = host?.includes('localhost') ? 'http' : 'https';
    const baseUrl = `${protocol}://${host}`;

    // 3. Cria a requisição do PIX
    const requestOptions = {
      body: {
        transaction_amount: Number(amount),
        description: `Presente: ${description}`,
        payment_method_id: 'pix',
        payer: {
          // O Mercado Pago exige um email, geramos um fictício se o convidado não der o dele
          email: 'convidado@casamento.com', 
          first_name: payerName || 'Convidado',
        },
        // IMPORTANTÍSSIMO: Dados extras que o Mercado Pago vai devolver no Webhook
        metadata: {
          gift_id: giftId,
          contributor_name: payerName || 'Anônimo'
        },
        // A URL que o Mercado Pago vai chamar quando o dinheiro cair
        notification_url: `${baseUrl}/api/webhook`
      }
    };

    // 4. Pede ao Mercado Pago para gerar o PIX
    const result = await payment.create(requestOptions);

    // 5. Devolve o PIX para o seu Frontend (React) mostrar na tela
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