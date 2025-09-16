import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PUT(req: NextRequest) {
  const url = new URL(req.url);
  const id = url.searchParams.get('id');
  if (!id) {
    return Response.json({ error: 'ID do agendamento obrigatório.' }, { status: 400 });
  }
  const body = await req.json();
  // Permite editar dados ou concluir (status: done)
  try {
    const appointment = await prisma.appointment.update({
      where: { id: Number(id) },
      data: { ...body },
    });
    return Response.json({ success: true, appointment });
  } catch {
    return Response.json({ error: 'Erro ao editar agendamento.' }, { status: 500 });
  }
}
