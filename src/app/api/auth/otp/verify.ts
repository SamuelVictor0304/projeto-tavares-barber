import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import crypto from 'crypto';

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { email, code } = body;
  if (!email || !code) {
    return Response.json({ error: 'E-mail e código obrigatórios.' }, { status: 400 });
  }
  // Busca OTP válido
  const otp = await prisma.otpCode.findFirst({
    where: {
      email,
      consumed: false,
      expiresAt: { gte: new Date() },
    },
    orderBy: { createdAt: 'desc' },
  });
  if (!otp) {
    return Response.json({ error: 'Código inválido ou expirado.' }, { status: 401 });
  }
  // Verifica tentativas
  if (otp.attempts >= 5) {
    return Response.json({ error: 'Foram feitas muitas tentativas. Tente novamente mais tarde.' }, { status: 429 });
  }
  // Compara hash
  const codeHash = crypto.createHash('sha256').update(code).digest('hex');
  if (codeHash !== otp.codeHash) {
    await prisma.otpCode.update({ where: { id: otp.id }, data: { attempts: { increment: 1 } } });
    return Response.json({ error: 'Código inválido ou expirado.' }, { status: 401 });
  }
  // Marca como consumido
  await prisma.otpCode.update({ where: { id: otp.id }, data: { consumed: true } });
  // Cria sessão segura (cookie httpOnly, expiração 8h)
  const sessionToken = crypto.randomBytes(32).toString('hex');
  // Aqui você pode salvar o token em uma tabela de sessão se quiser mais controle
  const response = Response.json({ success: true });
  response.headers.append('Set-Cookie', `barber_session=${sessionToken}; Path=/; HttpOnly; Max-Age=${8*60*60}; SameSite=Strict`);
  return response;
}
