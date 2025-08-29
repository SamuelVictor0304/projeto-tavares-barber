import { NextRequest } from 'next/server';
import { validateAdminPassword } from '../otp/send';

export async function POST(req: NextRequest) {
  const { password } = await req.json();
  if (validateAdminPassword(password)) {
    // Define cookie de sessão simples
    const response = new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
    response.headers.append('Set-Cookie', 'admin_session=ok; Path=/; Max-Age=86400; SameSite=Strict');
    return response;
  } else {
    return new Response(JSON.stringify({ error: 'Senha incorreta.' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
