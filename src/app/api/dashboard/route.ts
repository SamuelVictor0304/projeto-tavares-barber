import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma-singleton';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const date = searchParams.get('date');
  if (!date) {
    return Response.json({ error: 'Data obrigatória.' }, { status: 400 });
  }
  // Busca agendamentos do dia (todas as horas)
  const start = new Date(date + "T00:00:00.000Z");
  const end = new Date(date + "T23:59:59.999Z");
  const appointments = await prisma.appointment.findMany({
    where: {
      date: { gte: start, lte: end },
    },
    include: { service: true },
  });
  // Total de agendamentos (todos do dia)
  const totalAppointments = appointments.length;
  // Faturamento previsto: soma apenas agendamentos não cancelados e multiplica pelo partySize
  const faturamento = appointments
    .filter((a) => a.status !== 'cancelled')
    .reduce((sum: number, a) => sum + ((a.service.priceCents || 0) * (a.partySize || 1)), 0);
  // Distribuição por serviço (todos do dia)
  const porServico: Record<string, { quantidade: number; total: number }> = {};
  for (const a of appointments) {
    const nome = a.service.name;
    if (!porServico[nome]) {
      porServico[nome] = { quantidade: 0, total: 0 };
    }
    porServico[nome].quantidade++;
    porServico[nome].total += a.service.priceCents || 0;
  }
  return Response.json({
    totalAppointments,
    faturamento,
    porServico,
    appointments: appointments.map((a) => ({
      id: a.id,
      nome: a.customerName,
      email: a.customerEmail,
      telefone: a.customerPhone,
      servico: a.service.name,
      data: a.date,
      horario: a.startTime,
      pessoas: a.partySize,
      observacoes: a.notes,
      status: a.status,
    })),
  });
}
