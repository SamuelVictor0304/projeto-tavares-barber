import { NextRequest } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function DELETE(req: NextRequest) {
  const url = new URL(req.url);
  const id = url.searchParams.get('id');
  if (!id) {
    return Response.json({ error: 'ID do agendamento obrigatório.' }, { status: 400 });
  }
  try {
    const appointment = await prisma.appointment.update({
      where: { id: Number(id) },
      data: { status: 'cancelled' },
    });
    return Response.json({ success: true, appointment });
  } catch {
    return Response.json({ error: 'Erro ao cancelar agendamento.' }, { status: 500 });
  }
}
