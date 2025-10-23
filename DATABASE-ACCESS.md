# 🗄️ Acesso ao Banco de Dados - Tavares Barber

## 📋 Visão Geral

Este projeto utiliza **PostgreSQL** como banco de dados principal, gerenciado através do **Prisma ORM**.

## 🔗 Como Acessar o Banco de Dados

### 1️⃣ **Via API de Teste** (Recomendado para Verificação)

Acesse a rota de teste para verificar a conexão com o banco:

```
GET /api/test-db
```

**Exemplo de resposta:**
```json
{
  "status": "OK",
  "dbConnected": true,
  "servicesCount": 4,
  "services": [...]
}
```

**Como testar:**
- Desenvolvimento: `http://localhost:3000/api/test-db`
- Produção: `https://seu-dominio.com/api/test-db`

---

### 2️⃣ **Via Prisma Studio** (Interface Visual)

O Prisma Studio oferece uma interface gráfica para visualizar e editar dados:

```bash
npx prisma studio
```

Isso abrirá uma interface web em `http://localhost:5555` com acesso visual aos seus dados.

---

### 3️⃣ **Via Linha de Comando (Prisma Client)**

Para interagir diretamente via código:

```bash
# Gerar o Prisma Client
npx prisma generate

# Executar migrations
npx prisma migrate dev

# Popular o banco com dados iniciais
npm run seed
```

---

### 4️⃣ **Conexão Direta ao PostgreSQL**

Se você precisa acessar o banco diretamente via PostgreSQL:

**Requisitos:**
- Cliente PostgreSQL instalado (`psql` ou GUI como pgAdmin, DBeaver)
- URL de conexão configurada em `.env`

**Passos:**

1. Localize sua `DATABASE_URL` no arquivo `.env`:
```env
DATABASE_URL="postgresql://usuario:senha@host:porta/database"
```

2. Conecte usando um cliente PostgreSQL:
```bash
psql "postgresql://usuario:senha@host:porta/database"
```

Ou use uma GUI como [pgAdmin](https://www.pgadmin.org/) ou [DBeaver](https://dbeaver.io/).

---

## 📊 Estrutura do Banco de Dados

### Tabelas Principais:

1. **Service** - Serviços disponíveis (corte, barba, etc)
2. **Appointment** - Agendamentos dos clientes
3. **Block** - Bloqueios de horário
4. **BarberSettings** - Configurações da barbearia
5. **OtpCode** - Códigos de autenticação temporários

Para visualizar o schema completo, veja: `prisma/schema.prisma`

---

## 🔧 Configuração Inicial

### Variáveis de Ambiente Necessárias

Crie um arquivo `.env` na raiz do projeto:

```env
# Banco de Dados
DATABASE_URL="postgresql://usuario:senha@host:porta/database?schema=public"

# Telegram (opcional)
TELEGRAM_BOT_TOKEN="seu_token_aqui"
TELEGRAM_CHAT_ID="seu_chat_id_aqui"

# Senha Admin
ADMIN_PASSWORD="sua_senha_admin"
```

### Primeiro Setup

```bash
# 1. Instalar dependências
npm install

# 2. Gerar Prisma Client
npx prisma generate

# 3. Executar migrations
npx prisma migrate dev

# 4. Popular dados iniciais
npm run seed

# 5. Iniciar servidor de desenvolvimento
npm run dev
```

---

## 🛡️ Área Administrativa

Para acessar o painel administrativo com visualização de dados:

1. Acesse: `/admin`
2. Entre com a senha administrativa
3. Visualize dashboard com agendamentos e estatísticas

**Rotas administrativas:**
- `/admin` - Login administrativo
- `/admin/dashboard` - Dashboard principal
- `/admin/blocks` - Gerenciar bloqueios de horário

---

## 🧪 Testando a Conexão

### Teste Rápido via API

```bash
# Durante desenvolvimento
curl http://localhost:3000/api/test-db

# Deve retornar status OK se conectado
```

### Verificar Logs

Os logs de conexão aparecem no terminal onde você rodou `npm run dev`.

---

## ❓ Problemas Comuns

### "Erro na conexão com banco"

**Solução:**
1. Verifique se `DATABASE_URL` está configurada no `.env`
2. Confirme que o PostgreSQL está rodando
3. Teste a conexão diretamente com `psql`
4. Execute `npx prisma generate` novamente

### "Table not found"

**Solução:**
```bash
# Execute as migrations
npx prisma migrate dev

# Se necessário, resete o banco (⚠️ apaga dados)
npx prisma migrate reset
```

### "Prisma Client not found"

**Solução:**
```bash
npx prisma generate
```

---

## 📚 Recursos Adicionais

- [Documentação Prisma](https://www.prisma.io/docs)
- [PostgreSQL Docs](https://www.postgresql.org/docs/)
- [Next.js API Routes](https://nextjs.org/docs/api-routes/introduction)

---

## 🔐 Segurança

**⚠️ IMPORTANTE:**

- **NUNCA** commite o arquivo `.env` com credenciais reais
- Use variáveis de ambiente em produção (Vercel, Railway, etc)
- Mantenha senhas fortes para acesso administrativo
- Restrinja acesso direto ao banco em produção

---

## 🚀 Acesso em Produção

Se você fez deploy em plataformas como Vercel:

1. Configure as variáveis de ambiente no painel da plataforma
2. As mesmas rotas `/api/*` estarão disponíveis
3. Use HTTPS sempre: `https://seu-app.vercel.app/api/test-db`

---

## 💡 Dicas

1. Use `npx prisma studio` para visualização rápida dos dados
2. A rota `/api/test-db` é útil para health checks
3. Mantenha backups regulares do banco de dados
4. Use migrations para mudanças no schema

---

**Tem dúvidas?** Entre em contato com o desenvolvedor ou consulte a documentação do Prisma.
