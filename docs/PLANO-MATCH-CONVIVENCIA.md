# Plano: revisão do algoritmo de match de roommates e expansão do perfil de convivência

> Pedido do Guilherme em 20/10/2026: verificar se o algoritmo de compatibilidade (o
> **diferencial da demo**, `docs/ESCOPO.md` item 6 do roteiro) está funcionando
> corretamente, entender como ele funciona hoje, e pensar em mais opções no perfil de
> convivência pra alimentar melhor o cálculo. **Documento de planejamento — nada aqui
> foi implementado ainda**, mesmo padrão do `docs/PLANO-CHAT-REALTIME.md` (fica para
> revisão do time antes de executar).

## Veredito resumido

**O algoritmo está funcionando corretamente** — a fórmula bate com o `docs/ARQUITETURA.md`,
tem 15 testes unitários cobrindo os casos (`src/lib/match.test.ts`, incluindo 3 casos
calculados à mão com dados reais do seed), e eu validei de novo agora com um caso ao vivo
no `finds-dev` (ver "Verificação feita" abaixo): o número que aparece na tela bate
exatamente com a conta na mão.

Isso não quer dizer que não há nada a melhorar — a revisão encontrou **1 bug real e
pequeno** (uma seção da tela que nunca aparece porque o dado que ela precisa nunca é
passado), **1 risco** no mesmo padrão de um bug que já corrigimos em outro lugar nesta
sessão, e **1 nuance de comportamento** que pode deixar gente confusa sem ser
tecnicamente um bug. Tudo detalhado abaixo, junto com a proposta de novas opções de
convivência.

## Como funciona hoje

### A fórmula (`src/lib/match.ts`, lógica pura e testada)

```
aderência(A→B) = |procuro(A) ∩ sou(B)| / |procuro(A)|
score(A,B) = média das aderências que existirem (só entra no cálculo quem tem
             alguma tag "procuro" marcada; se só um lado tem, o score usa só esse lado)
```

`matchingTraitKeys(A,B)` devolve as tags que "explicam" o score — toda trait que algum
lado procura e o outro tem em "sou", nos dois sentidos. É o que aparece em "Vocês dois"
no card.

### De onde vêm os dados

- **Tags fixas**: tabela `traits` (`key`, `label`, `trait_group`), hoje 20 tags em 5
  grupos (rotina, organização, convivência, estilo de vida, hábitos) — ver a lista
  completa em `scripts/seed.ts:55-75`. É um catálogo fixo, sem UI de admin: adicionar
  uma tag nova é só adicionar uma linha no array `traits` do seed e rodar `npm run seed`
  (ele faz `upsert` por `key`, então não duplica).
- **Perfil da pessoa**: `user_traits` (`user_id`, `trait_id`, `kind`: `self` | `wanted`),
  editado em `/configuracoes/convivencia` pelo `<ConvivenciaPicker>`, salvo por
  `saveUserTraits()` (`src/lib/traits.ts`).
- **Cálculo em `/roommates`** (`src/app/(main)/roommates/page.tsx`): busca os anúncios
  ativos de roommate/república, busca minhas tags e as de cada dono em lote
  (`fetchUserTraitsBulk`, sem N+1), calcula `matchScore` e `matchingTraitKeys` pra cada
  um, ordena por score decrescente e manda pro `<MatchDeck>`.
- Se eu não tenho nenhuma tag "procuro", a tela nem chega a calcular nada — mostra o
  estado vazio "Monte seu perfil de convivência" (comportamento correto e intencional).

### Verificação feita (dado real do `finds-dev`, não hipotético)

Criei uma conta de teste (`kaike.qa.realtime@ufu.br`, já usada nesta sessão pra outras
verificações), marquei 5 tags em "procuro" (`gosta-silencio`, `nao-fuma`,
`aceita-pets`, `sociavel`, `organizado`) e **nenhuma** em "sou", e abri `/roommates`.
O anúncio do Felipe Alves Costa ("Dividir apartamento no Santa Mônica") apareceu com
**20% compatível**. Conferi as tags reais dele no banco (`self`: `gosta-silencio`,
`dorme-cedo`, `organizado`; `wanted`: `nao-fuma`, `dorme-cedo`, `poucas-visitas`) e
recalculei a fórmula na mão:

```
aderência(eu→Felipe) = |{gosta-silencio, organizado}| / 5 = 2/5 = 0.40
aderência(Felipe→eu) = |{} ∩ meu "sou" (vazio)| / 3    = 0/3 = 0.00
score = média(0.40, 0.00) = 0.20 → 20%
```

Bate exatamente com o que a tela mostrou. **O algoritmo está correto.**

## Achados da revisão

### 🔴 Bug: `otherTraits` nunca é preenchido ("Também é" nunca aparece)

`MatchCandidate` (`src/components/match/match-deck.tsx`) tem um campo `otherTraits` —
"tags que a pessoa tem e você não procura, mostra o contraste" — e o `<MatchDeck>` já
tem a seção pronta pra exibir ("Também é"). Só que `src/app/(main)/roommates/page.tsx`
(linhas 67-79, montagem do `MatchCandidate`) **nunca preenche esse campo** — só passa
`commonTraits`. Resultado: a seção "Também é" nunca aparece pra ninguém, silenciosamente,
desde que foi criada. Não é um crash nem um erro visível, por isso passou despercebido.

**Correção sugerida (pequena, autocontida):** calcular `otherTraits` em `page.tsx` como
as tags do dono em "sou" que eu **não** tenho em "procuro" (o contraste que o comentário
do tipo já descreve), traduzidas pelo mesmo `traitLabels`. Não muda a fórmula de score,
só completa um dado que a tela já sabe exibir.

### 🟡 Risco: `saveUserTraits()` apaga tudo antes de inserir

Mesmo padrão de risco que já corrigimos em `updateListing()`/`listing_images` nesta
sessão (commit `cbdf1dc`): `saveUserTraits()` (`src/lib/traits.ts`) faz
`delete from user_traits where user_id = ...` e **depois** insere a lista nova. Se o
insert falhar por qualquer motivo transitório (rede, timeout), a pessoa perde **todo** o
perfil de convivência — "sou" e "procuro" — sem aviso nenhum além do erro genérico que a
action já mostra.

**Correção sugerida:** inverter a ordem, igual já foi feito pra fotos — inserir a lista
nova primeiro, só apagar as linhas antigas depois que o insert confirmar. Aqui é até mais
simples que o caso das fotos: não tem posição/ordem pra preservar, só duas listas de IDs.

### 🟢 Nuance de comportamento (não é bug, mas pode confundir)

Quem preenche só "procuro" e nunca marca nada em "sou" (como a conta de teste que usei
pra validar acima) sempre contribui `0` pro lado "aderência(dono→você)" do score de
qualquer match — o que **divide a média ao meio** mesmo que a pessoa seja super
compatível com o que você procura. Isso é uma consequência correta da fórmula de
`docs/ARQUITETURA.md` (score = média das duas aderências), não um bug, mas o efeito
prático é que a tela nunca deixa isso claro pra quem só preencheu metade do perfil — a
pessoa só vê "20% compatível" sem entender que metade do score "não contou" porque ela
não disse como é.

**Sugestão (não é código, é UX):** um aviso sutil em `/roommates` ou no próprio
`<ConvivenciaPicker>` do tipo "Você ainda não marcou nada em 'Eu sou' — seu score de
compatibilidade pode estar mais baixo do que seria" quando `self.size === 0`. Decisão de
produto/design, não é só implementação — levar pro Caike/Lia.

### Cobertura de teste

`src/lib/match.test.ts` cobre muito bem a função pura (15 casos, incluindo 3 com dados
reais do seed). O que **não** tem teste é a composição em `page.tsx` — o filtro de
"não mostrar meu próprio anúncio", a ordenação final, e (depois de corrigido) o cálculo
de `otherTraits`. Não é urgente (a lógica ali é simples e de baixo risco), mas vale um
teste de integração leve se/quando o time mexer nessa página de novo.

## Proposta: expandir as opções de convivência

O catálogo de traits é só dado (upsert no seed por `key`, sem migration) — expandir é
barato. Abaixo, sugestões agrupadas pelo que **já existe** (preenchendo lacunas reais nos
5 grupos atuais) e um grupo novo opcional. Nenhuma delas muda a fórmula de match: mais
traits só dão mais pontos de interseção possíveis, o que tende a deixar os scores mais
finos/diferenciados (hoje, com só 20 tags, é fácil duas pessoas baterem ou zerarem tudo).

| Grupo | Nova tag sugerida (`key` / `label`) | Por que preenche uma lacuna real |
|---|---|---|
| convivência | `ouve-musica-alta` / "Ouve música alta" | Hoje só tem "gosta de silêncio" — não captura quem é barulhento sem ser anti-social |
| convivência | `fone-de-ouvido` / "Usa fone pra não incomodar" | Contraponto direto da anterior — gente que resolve barulho sem impor silêncio aos outros |
| organização | `limpa-na-hora` / "Limpa a louça/bagunça na hora" | "Organizado"/"espaço organizado" são genéricos — frequência de limpeza é a fricção mais comum entre roommates, na prática |
| organização | `tolera-bagunca` / "Tolera bagunça eventual" | Contraponto — hoje só existe o lado "organizado", não o lado "relaxado com isso" |
| estilo de vida | `gosta-de-festa` / "Gosta de receber amigos pra festa em casa" | Diferente de "sociável"/"recebe visitas" — festa noturna tem um impacto bem diferente de visita casual |
| estilo de vida | `prefere-tranquilo` / "Prefere fim de semana tranquilo em casa" | Contraponto direto da anterior |
| hábitos | `compartilha-comida` / "Compartilha comida com facilidade" | Fricção comum e concreta; evita framing sobre dieta/restrição alimentar (mais sensível) |
| rotina | `trabalha-estuda-fora` / "Passa a maior parte do dia fora (trabalho/estágio)" | Contraponto de "estuda em casa" — hoje não existe uma tag pra quem passa pouco tempo em casa |

**Consideradas e deixadas de fora por enquanto** (sensíveis o suficiente pra precisar de
uma decisão explícita do time/design antes, não só de código):

- Receber namorado(a)/parceiro(a) com frequência — tema real de atrito entre roommates,
  mas pessoal demais pra um checkbox sem conversa prévia com a Lia sobre como fraseá-lo.
- Religião, hábitos alimentares como identidade (vegetariano/vegano), bebida/fumo além do
  que já existe (`não fuma`) — tema mais delicado; o item `compartilha-comida` acima tenta
  capturar o efeito prático (fricção de convivência) sem entrar no tema de identidade.

**Fora de escopo do perfil de convivência** (já são campos próprios do anúncio, não
traits — pra quem for implementar não duplicar): preferência de gênero
(`roommate.gender_preference`), tipo de moradia, bairro, data de entrada — ver
`docs/ARQUITETURA.md`, tabela `listings.details` por tipo.

## O que o backlog já avisa (não reabrir agora)

`docs/ESCOPO.md` já lista como **fora do P0** ("Backlog"): pesos por característica,
critérios eliminatórios ("não aceito fumante") e "deu match" recíproco. Mais tags
("procuro"/"sou") **não** é a mesma coisa que esses itens — é só mais dado pro cálculo
atual, que continua simples (interseção, sem pesos). Se o time quiser pesos/critérios
eliminatórios depois, é um projeto à parte da expansão de tags proposta aqui.

## Recomendação / próximos passos, em ordem

1. ✅ **Corrigir `otherTraits`** (🔴 acima) — feito em 20/10 (commit `d80865c`):
   `roommates/page.tsx` agora calcula as tags "sou" do dono que eu não procuro e
   preenche `otherTraits` do `MatchCandidate`; a seção "Também é" aparece de verdade.
2. ✅ **Inverter a ordem do `saveUserTraits()`** (🟡 acima) — feito em 20/10
   (commit `def6d1f`): agora faz upsert (`on conflict user_id,trait_id`) da lista nova
   antes de apagar o que ficou de fora, mesmo padrão do `updateListing()`.
3. **Decidir com o Caike/Lia** o aviso de "perfil incompleto" (🟢 acima) — ainda não
   implementado; é UX, não código, e segue precisando da decisão do time antes.
4. ✅ **Adicionar as 8 tags novas** da tabela acima — feito em 20/10 (commit `5829838`),
   em `scripts/seed.ts`. **Falta rodar `npm run seed` em `finds-dev`/`finds-demo`** pra
   aplicar (o upsert por `key` é seguro, mas combinar com o time antes, já que o seed é
   destrutivo pro resto dos dados).
5. (Opcional, maior) Revisitar o grupo novo/traits sensíveis listados acima **com a
   designer antes**, não como parte deste plano — ainda não feito.

Os passos 1, 2 e 4 foram implementados em 20/10 (pedido do Guilherme). Os passos 3 e 5
seguem como estavam: fica pra revisão e priorização do time, mesmo critério já usado pro
`docs/PLANO-CHAT-REALTIME.md`.
