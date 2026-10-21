# Contas de teste

> **Pendência:** este script só rodou contra `finds-dev` até agora. Rodar
> contra `finds-demo` (produção/evento) é uma decisão separada — ver
> `docs/ESCOPO.md`.

O Supabase free tier limita o envio de e-mail de confirmação por hora. Para
visitantes da Mostra testarem o Finds sem passar pelo cadastro (e sem
esbarrar nesse limite), existem 5 contas pré-criadas com e-mails `@ufu.br`
fictícios — essas caixas não existem de verdade. Elas são exibidas também em
`/como-testar`.

## Credenciais

| Email | Senha |
|---|---|
| teste1@ufu.br | teste12345 |
| teste2@ufu.br | teste12345 |
| teste3@ufu.br | teste12345 |
| teste4@ufu.br | teste12345 |
| teste5@ufu.br | teste12345 |

Fonte: `src/lib/contas-teste.ts`. Se mudar algo lá, atualize esta tabela à
mão (markdown não importa TypeScript).

## Notas operacionais

- As contas nascem **vazias** de propósito (sem campus, sem anúncio) — o
  visitante é quem completa o perfil e explora.
- Essas caixas de e-mail não existem de verdade: nunca use "recuperar
  senha" com elas — a tela vai parecer funcionar, mas o e-mail não chega a
  lugar nenhum.
- Rodar `npm run seed:contas-teste` de novo restaura a senha documentada,
  sem apagar o que o visitante criou (anúncio, perfil, etc.).
- Várias pessoas usam a mesma conta ao longo do dia — nada criado ali é
  privado ou permanente.
- Tag para identificar essas contas no painel do Supabase:
  `user_metadata.finds_seed = "finds-conta-teste"`.

## Como criar/atualizar

```
SUPABASE_SEED_TARGET=finds-dev npm run seed:contas-teste
```

Troque `finds-dev` por `finds-demo` só quando o time decidir rodar isso
contra o ambiente da Mostra (ver pendência no topo deste arquivo).
