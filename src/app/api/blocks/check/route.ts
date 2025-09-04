import { NextRequest } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET /api/blocks/check?date=YYYY-MM-DD - verifica se um dia específico tem bloqueios
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const date = searchParams.get('date');
  
  if (!date) {
    return Response.json({ error: 'Parâmetro "date" obrigatório.' }, { status: 400 });
  }
  
  try {
    const selectedDate = new Date(date + 'T00:00:00.000Z');
    
    const blocks = await prisma.block.findMany({
      where: { date: selectedDate },
    });
    
    const hasFullDayBlock = blocks.some(block => 
      block.startTime === "08:00" && block.endTime === "20:30"
    );
    
    const hasPartialBlock = blocks.length > 0 && !hasFullDayBlock;
    
    return Response.json({ 
      hasBlocks: blocks.length > 0,
      hasFullDayBlock,
      hasPartialBlock,
      blocksCount: blocks.length
    });
  } catch (error) {
    console.error('Erro ao verificar bloqueios:', error);
    return Response.json({ error: 'Erro interno do servidor.' }, { status: 500 });
  }
}
