import { NextRequest } from 'next/server';

// GET /api/test - teste simples sem banco
export async function GET() {
  try {
    return Response.json({ 
      status: 'OK', 
      message: 'API funcionando',
      env: {
        hasDbUrl: !!process.env.DATABASE_URL,
        nodeEnv: process.env.NODE_ENV
      }
    });
  } catch (error) {
    return Response.json({ 
      error: 'Erro na API de teste', 
      details: String(error)
    }, { status: 500 });
  }
}