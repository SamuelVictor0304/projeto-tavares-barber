import { NextRequest } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET /api/services - lista todos os serviços
export async function GET() {
  const services = await prisma.service.findMany();
  return Response.json({ services });
}

// POST /api/services - cria novo serviço
export async function POST(req: NextRequest) {
  const body = await req.json();
  const { name, priceCents, durationSlots } = body;
  if (!name) {
    return Response.json({ error: 'Nome do serviço obrigatório.' }, { status: 400 });
  }
  try {
    const service = await prisma.service.create({
      data: {
        name,
        priceCents,
        durationSlots: durationSlots || 1,
      },
    });
    return Response.json({ success: true, service });
  } catch (err) {
    return Response.json({ error: 'Erro ao criar serviço.' }, { status: 500 });
  }
}

// PATCH /api/services - atualiza serviço
export async function PATCH(req: NextRequest) {
  const body = await req.json();
  const { id, name, priceCents, durationSlots } = body;
  if (!id) {
    return Response.json({ error: 'ID do serviço obrigatório.' }, { status: 400 });
  }
  try {
    const service = await prisma.service.update({
      where: { id },
      data: {
        name,
        priceCents,
        durationSlots,
      },
    });
    return Response.json({ success: true, service });
  } catch (err) {
    return Response.json({ error: 'Erro ao atualizar serviço.' }, { status: 500 });
  }
}

// DELETE /api/services?id= - remove serviço
export async function DELETE(req: NextRequest) {
  const url = new URL(req.url);
  const id = url.searchParams.get('id');
  if (!id) {
    return Response.json({ error: 'ID do serviço obrigatório.' }, { status: 400 });
  }
  try {
    await prisma.service.delete({ where: { id: Number(id) } });
    return Response.json({ success: true });
  } catch (err) {
    return Response.json({ error: 'Erro ao remover serviço.' }, { status: 500 });
  }
}
