# Josué: Banco, Infra e Anúncios

**Frente:** schema, segurança (RLS), storage, infra (Supabase + Vercel) e todo o ciclo de vida do anúncio (criar, editar, rascunho, gerenciar).

**Suas pastas:** `supabase/migrations/`, `src/lib/supabase/`, `src/types/database.ts` (gerado), `src/app/(main)/anunciar/`, `src/app/(main)/anuncios/[id]/editar/`, `src/app/(main)/meus-anuncios/`, `src/components/listings/form/`, `src/lib/validations/listings.ts`

**Não mexer:** tema, `ui/` e layouts (Caike), auth/feed/detalhe (Kaike), chat (Alexandre).

**O que você entrega para os outros:**
- O **banco inteiro** e os clientes Supabase prontos na Sprint 0: todo mundo depende disso
- Schemas zod dos anúncios (o Kaike usa para exibir os `details` de cada tipo)
- Ambientes `finds-dev` e `finds-demo` + deploy na Vercel

**O que você recebe do Caike:** wizard de formulário + seletor de fotos (Sprint 1), abas de "Meus anúncios" (Sprint 2).

---

## Sprint 0 · 27–28/09 · Banco e infra ⚠️ bloqueia o time

- [X] Criar os projetos Supabase `finds-dev` e `finds-demo`; convidar o time
- [X] Migrations com **todas as tabelas** de ARQUITETURA.md (inclusive as do P1), enums, índices (`listings(type, status, campus_id)`, `created_at`)
- [X] Trigger: ao criar usuário em `auth.users`, cria a linha em `profiles` (username/nome vêm do metadata do cadastro)
- [X] Trigger de `updated_at` em `listings`
- [X] **RLS em todas as tabelas** (ver tabela em ARQUITETURA.md)
- [X] Buckets `listing-images` e `avatars` + policies
- [X] Dados de referência: universidade UFU, campi, lista de `traits` (confirmar com o Caike, que valida com a designer)
- [X] `src/lib/supabase/` (client, server, middleware de sessão) + `.env.example`, assim que o Kaike subir o projeto
- [X] Gerar `src/types/database.ts` e documentar o comando no CLAUDE.md
- [X] Criar o projeto na Vercel ligado ao repo, com as env vars (produção → demo, previews → dev)

## Sprint 1 · 29/09–04/10 · Produto e Serviço de ponta a ponta

- [ ] `src/lib/validations/listings.ts`: schema base + `details` por tipo
- [ ] Server actions: criar, editar, excluir anúncio + upload de fotos (até 6, primeira = capa)
- [ ] `/anunciar`: escolher o tipo (4 cards)
- [ ] Formulário de **Produto** montado no wizard do Caike → redireciona para o detalhe
- [ ] Formulário de **Serviço** (modalidade presencial/online/flexível, unidade de preço)
- [ ] `/anuncios/[id]/editar` + excluir (só o dono)
- [ ] Usar o gate de perfil completo (Kaike) ao entrar em `/anunciar`

## Sprint 2 · 05/10–11/10 · Os 4 tipos + gestão

- [ ] Formulário de **Roommate** (oferece/procura vaga, tipo de moradia, bairro, data de entrada)
- [ ] Formulário de **República** (vagas, gênero, bairro, comodidades)
- [ ] **Rascunho:** botão "Salvar rascunho" em qualquer passo; retomar depois
- [ ] `/meus-anuncios`: abas Ativos / Rascunhos / Encerrados; ações pausar, encerrar, excluir, editar

## Sprint 3 · 12/10–18/10 · Produção

- [ ] Aplicar todas as migrations no `finds-demo`; produção da Vercel apontando para lá
- [ ] Imagens otimizadas (`next/image`, tamanhos adequados); o feed tem que carregar rápido no estande
- [ ] **Teste de segurança:** logado como A, tentar ler e editar dados de B (rascunhos, mensagens, favoritos)
- [ ] Ajustes do QA de design que caírem para você

## Reta final · 19–20/10
- [ ] Deploy final + bug bash + só correções
