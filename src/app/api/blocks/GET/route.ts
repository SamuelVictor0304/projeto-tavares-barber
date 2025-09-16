import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma-singleton';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const date = searchParams.get('date');
  const inicio = searchParams.get('inicio');
  const fim = searchParams.get('fim');
  
  if (date) {
    // Busca bloqueios para um dia específico
    const start = new Date(date + 'T00:00:00.000Z');
    const end = new Date(date + 'T23:59:59.999Z');
    const blocks = await prisma.block.findMany({
      where: {
        date: { gte: start, lte: end },
      },
      orderBy: { startTime: 'asc' },
    });
    return Response.json({ blocks });
  } else if (inicio && fim) {
    // Busca bloqueios para um intervalo de datas
    const start = new Date(inicio + 'T00:00:00.000Z');
    const end = new Date(fim + 'T23:59:59.999Z');
    const blocks = await prisma.block.findMany({
      where: {
        date: { gte: start, lte: end },
      },
      orderBy: [{ date: 'asc' }, { startTime: 'asc' }],
    });
    return Response.json({ blocks });
  } else {
    return Response.json({ error: 'Parâmetro "date" ou "inicio/fim" obrigatórios.' }, { status: 400 });
  }
}
