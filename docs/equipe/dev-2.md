# Dev 2: Banco de dados e Anúncios

**Frente:** schema, segurança (RLS), storage, infra (Supabase + Vercel) e todo o ciclo de vida do anúncio (criar, editar, rascunho, gerenciar).

**Suas pastas:** `supabase/migrations/`, `src/app/(main)/anunciar/`, `src/app/(main)/anuncios/[id]/editar/`, `src/app/(main)/meus-anuncios/`, `src/components/listings/form/`, `src/lib/validations/listings.ts`, `src/types/database.ts` (gerado)

**Não mexer:** tema e `ui/` (Dev 1), feed e detalhe (Dev 3), chat (Dev 4).

**O que você entrega para os outros:**
- O **banco inteiro** pronto na Sprint 0: todo mundo depende disso
- Schemas zod dos anúncios (Dev 3 usa para exibir os `details` de cada tipo)
- Ambientes `finds-dev` e `finds-demo` + deploy na Vercel

---

## Sprint 0 · 27–28/09 · Banco e infra ⚠️ bloqueia o time

- [ ] Criar os projetos Supabase `finds-dev` e `finds-demo`; convidar o time
- [ ] Criar o projeto na Vercel ligado ao repo, com as env vars (produção → demo, previews → dev)
- [ ] Migrations com **todas as tabelas** de ARQUITETURA.md (inclusive as do P1), enums, índices (`listings(type, status, campus_id)`, `created_at`)
- [ ] Trigger: ao criar usuário em `auth.users`, cria a linha em `profiles` (username/nome vêm do metadata do cadastro)
- [ ] Trigger de `updated_at` em `listings`
- [ ] **RLS em todas as tabelas** (ver tabela em ARQUITETURA.md)
- [ ] Buckets `listing-images` e `avatars` + policies
- [ ] Dados de referência: universidade UFU, campi, lista de `traits` (confirmar com a designer/Figma)
- [ ] Gerar `src/types/database.ts` e documentar o comando no CLAUDE.md

## Sprint 1 · 29/09–04/10 · Produto e Serviço de ponta a ponta

- [ ] `src/lib/validations/listings.ts`: schema base + `details` por tipo
- [ ] `/anunciar`: escolher o tipo (4 cards)
- [ ] Formulário de **Produto** (wizard: fotos → infos → preço/campus → revisão) + server action → redireciona para o detalhe
- [ ] Upload de várias fotos (até 6), remover, primeira = capa
- [ ] Formulário de **Serviço** (modalidade presencial/online/flexível, unidade de preço)
- [ ] `/anuncios/[id]/editar` + excluir (só o dono)
- [ ] Usar o gate de perfil completo do Dev 1 ao entrar em `/anunciar`

## Sprint 2 · 05/10–11/10 · Os 4 tipos + gestão

- [ ] Formulário de **Roommate** (oferece/procura vaga, tipo de moradia, bairro, data de entrada)
- [ ] Formulário de **República** (vagas, gênero, bairro, comodidades)
- [ ] **Rascunho:** botão "Salvar rascunho" em qualquer passo; retomar depois
- [ ] `/meus-anuncios`: abas Ativos / Rascunhos / Encerrados; ações pausar, encerrar, excluir, editar

## Sprint 3 · 12/10–18/10 · Produção

- [ ] Aplicar todas as migrations no `finds-demo`; produção da Vercel apontando para lá
- [ ] Imagens otimizadas (`next/image`, tamanhos adequados); o feed tem que carregar rápido no estande
- [ ] **Teste de segurança:** logado como A, tentar ler e editar dados de B (rascunhos, mensagens, favoritos)
- [ ] Correções do QA de design

## Reta final · 19–20/10
- [ ] Deploy final + bug bash + só correções
