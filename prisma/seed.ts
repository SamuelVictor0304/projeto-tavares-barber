import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed do banco de dados...');

  // Limpar serviços existentes (se a tabela existir)
  try {
    await prisma.service.deleteMany();
    console.log('🧹 Serviços existentes removidos');
  } catch (error) {
    console.log('ℹ️  Tabela Service ainda não existe, criando dados iniciais...');
  }

  // Criar serviços
  const services = await prisma.service.createMany({
    data: [
      { name: 'Corte Masculino', priceCents: 3500, durationSlots: 1 },
      { name: 'Barba Tradicional', priceCents: 2000, durationSlots: 1 },
      { name: 'Sobrancelha', priceCents: 1500, durationSlots: 1 },
      { name: 'Corte + Barba', priceCents: 5000, durationSlots: 2 },
      { name: 'Pigmentação', priceCents: 1000, durationSlots: 1 },
    ],
    skipDuplicates: true,
  });

  console.log(`✅ ${services.count} serviços criados com sucesso!`);
}

main()
  .catch((e) => {
    console.error('❌ Erro ao executar seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
