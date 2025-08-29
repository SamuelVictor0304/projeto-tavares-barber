// Autenticação por senha padrão
const ADMIN_PASSWORD = 'tavares2025'; // Defina a senha desejada

export function validateAdminPassword(password: string): boolean {
  return password === ADMIN_PASSWORD;
}
