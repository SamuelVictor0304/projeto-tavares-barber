import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { addMinutes, format, parse } from 'date-fns';

const prisma = new PrismaClient();

const SLOT_DURATION = 40;

// Gera os slots de 40 minutos que o agendamento ocupará
function getSlotsForBooking(startTime: string, partySize: number, baseDate: Date): string[] {
  const slots: string[] = [];
  const [hours, minutes] = startTime.split(':').map(Number);
  let currentTime = new Date(baseDate);
  currentTime.setHours(hours, minutes, 0, 0);
  
  for (let i = 0; i < partySize; i++) {
    slots.push(format(currentTime, 'HH:mm'));
    currentTime = addMinutes(currentTime, SLOT_DURATION);
  }
  return slots;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { customerName, customerEmail, customerPhone, serviceId, date, startTime, partySize, notes } = body;

    // Validação de entrada
    if (!customerName || !customerEmail || !customerPhone || !serviceId || !date || !startTime || !partySize) {
      return NextResponse.json({ error: 'Todos os campos marcados com * são obrigatórios.' }, { status: 400 });
    }
    
    const partySizeNum = parseInt(partySize, 10);
    if (isNaN(partySizeNum) || partySizeNum < 1 || partySizeNum > 4) {
        return NextResponse.json({ error: 'Quantidade de pessoas inválida.' }, { status: 400 });
    }

    const selectedDate = new Date(date + 'T00:00:00');
    if (isNaN(selectedDate.getTime())) {
        return NextResponse.json({ error: 'Formato de data inválido.' }, { status: 400 });
    }

    // Lógica de negócio para verificar a disponibilidade DENTRO de uma transação
    const newAppointment = await prisma.$transaction(async (tx) => {
      // 1. Gerar os slots que precisam ser reservados
      const slotsToBook = getSlotsForBooking(startTime, partySizeNum, selectedDate);
      const lastSlot = slotsToBook[slotsToBook.length - 1];

      // 2. Verificar se o agendamento termina antes do fim do expediente (21:00)
      // O último slot começa e dura 40min, então não pode passar de 20:20 para terminar 21:00
      const [lastHours, lastMinutes] = lastSlot.split(':').map(Number);
      const lastSlotTime = new Date(selectedDate);
      lastSlotTime.setHours(lastHours, lastMinutes, 0, 0);
      
      const maxEndTime = new Date(selectedDate);
      maxEndTime.setHours(20, 20, 0, 0);
      
      if (lastSlotTime > maxEndTime) {
          throw new Error('O agendamento excede o horário de funcionamento.');
      }

      // 3. Verificar conflitos com agendamentos existentes
      const conflictingAppointments = await tx.appointment.findMany({
        where: {
          date: selectedDate,
          slotsBooked: {
            // Procura por qualquer agendamento que contenha algum dos slots que queremos reservar
            contains: slotsToBook[0], // Otimização: podemos checar só o primeiro, mas checar todos é mais seguro
          },
        },
      });

      // Checagem mais detalhada em memória para garantir
      for (const app of conflictingAppointments) {
          const existingSlots = app.slotsBooked.split(',');
          for (const slot of slotsToBook) {
              if (existingSlots.includes(slot)) {
                  throw new Error(`O horário ${slot} já está reservado.`);
              }
          }
      }

      // 4. Verificar conflitos com bloqueios
      const conflictingBlocks = await tx.block.findMany({
        where: {
          date: selectedDate,
          AND: slotsToBook.map(slot => ({
            startTime: { lte: slot },
            endTime: { gt: slot },
          })),
        },
      });

      if (conflictingBlocks.length > 0) {
        throw new Error('Um dos horários selecionados está bloqueado.');
      }

      // 5. Se não houver conflitos, criar o agendamento
      const appointment = await tx.appointment.create({
        data: {
          customerName,
          customerEmail,
          customerPhone,
          serviceId: Number(serviceId),
          date: selectedDate,
          startTime,
          partySize: partySizeNum,
          slotsBooked: slotsToBook.join(','),
          notes,
          status: 'booked',
        },
      });

      return appointment;
    });

    return NextResponse.json({ success: true, appointment: newAppointment });

  } catch (error: any) {
    // Se o erro for de conflito (lançado por nós), retorna 409
    if (error.message.includes('já está reservado') || error.message.includes('bloqueado') || error.message.includes('excede o horário')) {
      return NextResponse.json({ error: error.message }, { status: 409 });
    }
    // Outros erros
    console.error("Erro ao criar agendamento:", error);
    return NextResponse.json({ error: 'Não foi possível criar o agendamento.' }, { status: 500 });
  }
}
