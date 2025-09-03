import { NextRequest } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// POST /api/blocks - cria bloqueio de intervalo ou dia inteiro
export async function POST(req: NextRequest) {
  const body = await req.json();
  const { date, startTime, endTime, reason } = body;
  if (!date || !startTime || !endTime) {
    return Response.json({ error: 'Campos obrigatórios faltando.' }, { status: 400 });
  }
  // Verifica se já existe agendamento ativo no período
  const appointments = await prisma.appointment.findMany({
    where: {
      date: new Date(date),
      status: 'booked',
      // slotsBooked contém algum horário no intervalo
    },
  });
  for (const a of appointments) {
  const slots = a.slotsBooked.split(',');
  if (slots.some((slot: string) => slot >= startTime && slot < endTime)) {
      return Response.json({ error: 'Já existe agendamento ativo no período. Remaneje/cancele antes de bloquear.' }, { status: 409 });
    }
  }
  // Cria bloqueio
  try {
    const block = await prisma.block.create({
      data: {
        date: new Date(date),
        startTime,
        endTime,
        reason,
      },
    });
    return Response.json({ success: true, block });
  } catch {
    return Response.json({ error: 'Erro ao criar bloqueio.' }, { status: 500 });
  }
}

// DELETE /api/blocks/:id - remove bloqueio
export async function DELETE(req: NextRequest) {
  const url = new URL(req.url);
  const id = url.searchParams.get('id');
  if (!id) {
    return Response.json({ error: 'ID do bloqueio obrigatório.' }, { status: 400 });
  }
  try {
    await prisma.block.delete({ where: { id: Number(id) } });
    return Response.json({ success: true });
  } catch {
    return Response.json({ error: 'Erro ao remover bloqueio.' }, { status: 500 });
  }
}
