import { NextRequest } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { format, addMinutes } from 'date-fns';

const prisma = new PrismaClient();
const SLOT_DURATION = 40;
const BUSINESS_END = '20:30';
const WEEKDAYS = [1, 2, 3, 4, 5, 6]; // segunda a sábado
const LAST_START = {
  1: '19:40',
  2: '19:00',
  3: '18:20',
  4: '17:40',
};

function getSlots(startTime: string, partySize: number, date: string) {
  let slots = [];
  for (let i = 0; i < partySize; i++) {
    const slot = format(addMinutes(new Date(date + 'T' + startTime), i * SLOT_DURATION), 'HH:mm');
    slots.push(slot);
  }
  return slots;
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { customerName, customerEmail, customerPhone, serviceId, date, startTime, partySize, notes } = body;
  if (!customerName || !customerEmail || !customerPhone || !serviceId || !date || !startTime || !partySize) {
    return Response.json({ error: 'Campos obrigatórios faltando.' }, { status: 400 });
  }
  const weekday = new Date(date).getDay();
  if (weekday === 0) {
    return Response.json({ error: 'Domingo indisponível.' }, { status: 400 });
  }
  if (partySize < 1 || partySize > 4) {
    return Response.json({ error: 'Quantidade de pessoas inválida.' }, { status: 400 });
  }
  // Verifica se horário inicial é permitido para o partySize
  const partySizeKey = [1,2,3,4].includes(partySize) ? partySize as 1|2|3|4 : 1;
  if (startTime > LAST_START[partySizeKey]) {
    return Response.json({ error: 'Não há slots suficientes até 20:30.' }, { status: 400 });
  }
  // Gera slots consecutivos
  const slots = getSlots(startTime, partySize, date);
  // Busca agendamentos e bloqueios do dia
  const appointments = await prisma.appointment.findMany({
    where: { date: new Date(date), status: 'booked' },
  });
  const blocks = await prisma.block.findMany({
    where: { date: new Date(date) },
  });
  // Verifica conflitos
  for (const slot of slots) {
    if (appointments.some((a: { slotsBooked: string }) => a.slotsBooked.split(',').includes(slot))) {
      return Response.json({ error: `Conflito no horário ${slot}. Escolha outro horário.` }, { status: 409 });
    }
    if (blocks.some((b: { startTime: string; endTime: string }) => slot >= b.startTime && slot < b.endTime)) {
      return Response.json({ error: 'Horário indisponível.' }, { status: 409 });
    }
    if (slot > BUSINESS_END) {
      return Response.json({ error: 'Não há slots suficientes até 20:30.' }, { status: 400 });
    }
  }
  // Cria agendamento
  try {
    const appointment = await prisma.appointment.create({
      data: {
        customerName,
        customerEmail,
        customerPhone,
        serviceId,
        date: new Date(date),
        startTime,
        partySize,
        slotsBooked: slots.join(','),
        notes,
        status: 'booked',
      },
    });
    return Response.json({ success: true, appointment });
  } catch (err) {
    return Response.json({ error: 'Erro ao criar agendamento.' }, { status: 500 });
  }

  }
  // Fim do arquivo
