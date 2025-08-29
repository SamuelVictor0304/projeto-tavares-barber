import { NextRequest } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { format, addMinutes } from 'date-fns';

const prisma = new PrismaClient();

// Configuração dos horários de funcionamento e slots
const SLOT_DURATION = 40;
const BUSINESS_START = '09:00';
const BUSINESS_END = '20:30';
// const WEEKDAYS = [1, 2, 3, 4, 5, 6]; // segunda a sábado
// const LAST_START = {
//   1: '19:40',
//   2: '19:00',
//   3: '18:20',
//   4: '17:40',
// };

function getSlotGrid(partySize: number) {
  // Gera grid de horários iniciais possíveis para o partySize
  const startTimes = [
    '09:00','09:40','10:20','11:00','11:40','12:20','13:00','13:40','14:20','15:00','15:40','16:20','17:00','17:40','18:20','19:00','19:40'
  ];
  return startTimes.filter((t) => {
    const idx = startTimes.indexOf(t);
    return idx + partySize <= startTimes.length;
  });
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const date = searchParams.get('date');
  const partySize = Number(searchParams.get('partySize') || '1');
  if (!date) {
    return Response.json({ error: 'Data obrigatória.' }, { status: 400 });
  }
  const weekday = new Date(date).getDay();
  if (weekday === 0) {
    return Response.json({ error: 'Domingo indisponível.' }, { status: 400 });
  }
  if (partySize < 1 || partySize > 4) {
    return Response.json({ error: 'Quantidade de pessoas inválida.' }, { status: 400 });
  }
  // Gera grid de horários iniciais possíveis
  const grid = getSlotGrid(partySize);
  // Busca agendamentos e bloqueios do dia
  const appointments = await prisma.appointment.findMany({
    where: { date: new Date(date), status: 'booked' },
  });
  const blocks = await prisma.block.findMany({
    where: { date: new Date(date) },
  });
  // Função para verificar se slots consecutivos estão livres
  function isAvailable(startTime: string) {
    const slots = [];
    const [h, m] = startTime.split(':').map(Number);
    for (let i = 0; i < partySize; i++) {
      const slot = format(addMinutes(new Date(date + 'T' + startTime), i * SLOT_DURATION), 'HH:mm');
      slots.push(slot);
    }
    // Verifica se algum slot está ocupado ou bloqueado
    for (const slot of slots) {
  if (appointments.some((a: { slotsBooked: string }) => a.slotsBooked.split(',').includes(slot))) return false;
  if (blocks.some((b: { startTime: string; endTime: string }) => slot >= b.startTime && slot < b.endTime)) return false;
    }
    // Verifica se termina até 20:30
    if (slots.some(s => s > BUSINESS_END)) return false;
    return true;
  }
  // Filtra horários disponíveis
  const available = grid.filter(isAvailable);
  return Response.json({ available });
}
