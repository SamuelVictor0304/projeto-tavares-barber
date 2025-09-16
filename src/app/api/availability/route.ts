import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { addMinutes, format } from 'date-fns'; // Removed unused import of parse

const prisma = new PrismaClient();

const SLOT_DURATION = 40; // Duração de cada slot em minutos
const TOTAL_SLOTS = 19; // 08:30 a 20:30 (para terminar até 21:00)

// Gera todos os slots de 40 minutos do dia, começando às 08:30
function generateAllSlots(baseDate: Date): Date[] {
  const slots: Date[] = [];
  let currentTime = new Date(baseDate);
  currentTime.setHours(8, 30, 0, 0); // Começar às 08:30
  
  for (let i = 0; i < TOTAL_SLOTS; i++) {
    slots.push(new Date(currentTime));
    currentTime = addMinutes(currentTime, SLOT_DURATION);
  }
  return slots;
}

// Define o último horário de início permitido com base no tamanho do grupo
const lastStartSlotIndex: { [key: number]: number } = {
  1: 18, // 20:30 (termina 21:10, mas vamos ajustar para 20:20)
  2: 17, // 19:50 (termina 21:10, mas vamos ajustar para 19:40)
  3: 16, // 19:10 (termina 21:10, mas vamos ajustar para 19:00)
  4: 15, // 18:30 (termina 21:10, mas vamos ajustar para 18:20)
};

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const dateParam = searchParams.get('date');
  const partySizeParam = searchParams.get('partySize');

  if (!dateParam) {
    return NextResponse.json({ error: 'O parâmetro "date" é obrigatório.' }, { status: 400 });
  }

  const partySize = parseInt(partySizeParam || '1', 10);
  if (isNaN(partySize) || partySize < 1 || partySize > 4) {
    return NextResponse.json({ error: 'O "partySize" deve ser um número entre 1 e 4.' }, { status: 400 });
  }

  try {
    const selectedDate = new Date(dateParam + 'T00:00:00'); // Adiciona T00:00:00 para evitar problemas de fuso horário
    if (isNaN(selectedDate.getTime())) {
        return NextResponse.json({ error: 'Formato de data inválido.' }, { status: 400 });
    }

    // Domingos não funcionam
    if (selectedDate.getUTCDay() === 0) {
      return NextResponse.json({ available: [] });
    }

    // Busca todos os agendamentos e bloqueios para o dia
    const appointments = await prisma.appointment.findMany({
      where: { date: selectedDate },
    });
    const blocks = await prisma.block.findMany({
        where: { date: selectedDate },
    });

    // Cria um Set com todos os slots já ocupados no dia
    const occupiedSlots = new Set<string>();
    appointments.forEach(app => {
      const slots = app.slotsBooked.split(',');
      slots.forEach(slot => occupiedSlots.add(slot));
    });
    blocks.forEach(block => {
        // Adiciona todos os slots dentro do intervalo de bloqueio
        const [startHours, startMinutes] = block.startTime.split(':').map(Number);
        const [endHours, endMinutes] = block.endTime.split(':').map(Number);
        
        let currentTime = new Date(selectedDate);
        currentTime.setHours(startHours, startMinutes, 0, 0);
        
        const endTime = new Date(selectedDate);
        endTime.setHours(endHours, endMinutes, 0, 0);
        
        while(currentTime < endTime) {
            occupiedSlots.add(format(currentTime, 'HH:mm'));
            currentTime = addMinutes(currentTime, SLOT_DURATION);
        }
    });


    const allSlots = generateAllSlots(selectedDate);
    const availableStartTimes: string[] = [];

    const maxSlotIndex = lastStartSlotIndex[partySize];

    // Itera por todos os slots possíveis para encontrar inícios válidos
    for (let i = 0; i <= maxSlotIndex; i++) {
      let isGroupAvailable = true;
      // Verifica se os N slots consecutivos estão livres
      for (let j = 0; j < partySize; j++) {
        const currentSlot = allSlots[i + j];
        const formattedSlot = format(currentSlot, 'HH:mm');
        if (occupiedSlots.has(formattedSlot)) {
          isGroupAvailable = false;
          break; // Se um slot no grupo está ocupado, o grupo não está disponível
        }
      }

      if (isGroupAvailable) {
        availableStartTimes.push(format(allSlots[i], 'HH:mm'));
      }
    }

    return NextResponse.json({ available: availableStartTimes });

  } catch (error) {
    console.error("Erro ao buscar disponibilidade:", error);
    return NextResponse.json({ error: 'Ocorreu um erro no servidor.' }, { status: 500 });
  }
}
