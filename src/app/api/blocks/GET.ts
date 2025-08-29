import { NextRequest } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const date = searchParams.get('date');
  if (!date) {
    return Response.json({ error: 'Data obrigatória.' }, { status: 400 });
  }
  const start = new Date(date + 'T00:00:00.000Z');
  const end = new Date(date + 'T23:59:59.999Z');
  const blocks = await prisma.block.findMany({
    where: {
      date: { gte: start, lte: end },
    },
    orderBy: { startTime: 'asc' },
  });
  return Response.json({ blocks });
}
