import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma-singleton';

// GET /api/test-db - teste de conexão com banco
export async function GET() {
  try {
    console.log('Testando conexão com banco...');
    console.log('DATABASE_URL:', process.env.DATABASE_URL ? 'Definida' : 'Não definida');
    
    // Teste simples de conexão
    await prisma.$connect();
    console.log('Conexão estabelecida');
    
    // Tentar buscar serviços
    const services = await prisma.service.findMany({
      select: {
        id: true,
        name: true,
        priceCents: true
      }
    });
    
    console.log('Serviços encontrados:', services.length);
    
    return Response.json({ 
      status: 'OK', 
      dbConnected: true,
      servicesCount: services.length,
      services: services
    });
  } catch (error) {
    console.error('Erro na conexão:', error);
    return Response.json({ 
      error: 'Erro na conexão com banco', 
      details: String(error),
      dbUrl: process.env.DATABASE_URL ? 'Configurada' : 'Não configurada'
    }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}