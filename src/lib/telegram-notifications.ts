import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface AgendamentoData {
  clientName: string;
  clientPhone: string;
  clientEmail: string;
  serviceName: string;
  datetime: Date;
  partySize: number;
  notes?: string;
}

export async function enviarNotificacaoTelegram(agendamento: AgendamentoData) {
  try {
    const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
    const CHAT_ID = process.env.TELEGRAM_CHAT_ID;

    if (!BOT_TOKEN || !CHAT_ID) {
      console.error('❌ Variáveis do Telegram não configuradas');
      return { success: false, error: 'Telegram não configurado' };
    }

    const dataFormatada = format(agendamento.datetime, "dd/MM/yyyy 'às' HH:mm");
    const valorServico = getValorServico(agendamento.serviceName);

    const mensagem = `🗓️ *NOVO AGENDAMENTO*
*Tavares Barber*

� *Cliente:* ${agendamento.clientName}
📞 *Telefone:* ${agendamento.clientPhone}
📧 *Email:* ${agendamento.clientEmail}

✂️ *Serviço:* ${agendamento.serviceName}
📅 *Data:* ${dataFormatada}
👥 *Pessoas:* ${agendamento.partySize}${valorServico ? `
💰 *Valor:* R$ ${valorServico}` : ''}${agendamento.notes ? `

📝 *Observações:*
${agendamento.notes}` : ''}

[🔗 WhatsApp Cliente](https://wa.me/${agendamento.clientPhone.replace(/\D/g, '')})
[📊 Dashboard](https://projeto-tavares-barber.vercel.app/admin/dashboard)`;

    const telegramUrl = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;
    
    const response = await fetch(telegramUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: CHAT_ID,
        text: mensagem,
        parse_mode: 'Markdown',
        disable_web_page_preview: false,
      }),
    });

    const result = await response.json();

    if (result.ok) {
      console.log('✅ Notificação Telegram enviada:', result.result.message_id);
      return { success: true, messageId: result.result.message_id };
    } else {
      console.error('❌ Erro ao enviar Telegram:', result);
      return { success: false, error: result.description };
    }

  } catch (error) {
    console.error('❌ Erro ao enviar notificação Telegram:', error);
    return { success: false, error: String(error) };
  }
}

function getValorServico(serviceName: string): string | null {
  const valores: Record<string, string> = {
    'Corte de Cabelo': '35,00',
    'Barba Tradicional': '20,00',
    'Combo (Cabelo + Barba)': '50,00',
    'Pigmentação no Cabelo': '10,00'
  };
  return valores[serviceName] || null;
}