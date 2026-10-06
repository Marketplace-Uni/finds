# Componentes do front-end

O que já existe pronto para montar as telas, vindo do Figma. Todos recebem dados por **props** e **não acessam o banco** — quem é dono da rota busca os dados e repassa.

**Veja funcionando:** [`/preview-visual`](http://localhost:3000/preview-visual) (ou `<url-da-vercel>/preview-visual`). Toda a lista abaixo está lá, montada.

**Antes de criar componente novo:** procure aqui primeiro. Se faltar algo, peça ao Caike em vez de improvisar — assim o visual não diverge. Cores, fontes e raios ficam em [DESIGN.md](DESIGN.md#tokens-de-design).

> Os imports usam `@/src/...` porque o alias `@/*` aponta para a raiz do projeto.

---

## Layout

| Componente | Import | Para que serve |
|---|---|---|
| `Navbar` | `@/src/components/layout/navbar` | Barra do topo. Props: `user`, `campus`, `unreadCount`. Com `user={null}` mostra "Entrar / Criar conta" |
| `AuthArt` | `@/src/components/layout/auth-art` | Painel da marca nas telas de conta. Já está no layout `(auth)` |
| `LogoFinds` | `@/src/components/layout/logo-finds` | Wordmark. Herda a cor do texto: defina a altura (`h-7`) e deixe a largura automática |

Os layouts `(main)` e `(auth)` já aplicam navbar e tela dividida — páginas dentro deles não precisam fazer nada.

## Anúncios

| Componente | Import | Props principais |
|---|---|---|
| `ListingCard` | `@/src/components/listings/listing-card` | `href`, `title`, `price`, `priceNote`, `location`, `imageUrl`, `typeLabel`, `favoriteSlot` |
| `ListingCardSkeleton` | idem | nenhuma — mesma altura do card, para o layout não pular |
| `ListingGrid` | `@/src/components/listings/listing-grid` | `children`. Grid de 1 a 4 colunas |
| `ListingGridSkeleton` | idem | `count` (padrão 8) |
| `ListingDetail` | `@/src/components/listings/listing-detail` | `title`, `price`, `description`, `images`, `categories`, `attributes`, `specs`, `seller` + os slots |
| `ListingGallery` | `@/src/components/listings/listing-gallery` | `images`. Carrossel com miniaturas, sem JavaScript |
| `AnunciarBanner` | `@/src/components/listings/anunciar-banner` | nenhuma. Faixa "Faça um anúncio!" que leva a `/anunciar` |

```tsx
<ListingGrid>
  {anuncios.map((a) => (
    <ListingCard
      key={a.id}
      href={`/anuncios/${a.id}`}
      title={a.title}
      price={a.price}
      location={a.campus}
      imageUrl={a.coverUrl}
      favoriteSlot={<FavoriteButton listingId={a.id} />}
    />
  ))}
</ListingGrid>
```

### Os slots

`ListingCard` e `ListingDetail` deixam buracos para os componentes do Alexandre, para que ele não precise mexer no visual:

| Slot | Onde | O que entra |
|---|---|---|
| `favoriteSlot` | card e detalhe | `<FavoriteButton>` |
| `chatSlot` | detalhe | `<StartChatButton>` — é o CTA principal |
| `reportSlot` | detalhe | `<ReportButton>` — já vem dentro da caixa bege |
| `relatedSlot` | detalhe | grid de anúncios do mesmo anunciante |
| `headerSlot` | `ChatPanel` | card de status da negociação |

Para botões de ícone **sobre imagem** (como favoritar), use `OverlayIconButton` de `@/src/components/ui/overlay-icon-button`: ele tem o círculo claro que impede o ícone de sumir em fotos claras.

### Meus anúncios

| Componente | Import | Props principais |
|---|---|---|
| `ListingTabs` | `@/src/components/listings/listing-tabs` | `tabs` (`value`, `label`, `count`), `current`, `basePath`, `param` |
| `ListingStatusBadge` | `@/src/components/listings/listing-status-badge` | `status`: `active`, `draft`, `paused`, `sold`, `closed` |

As abas são **links**, não botões com estado: a aba atual vai para a URL (`?aba=rascunhos`), funciona sem JavaScript e dá para compartilhar o endereço.

No `ListingCard`, duas props cuidam da visão do dono: `status` (põe o selo sobre a imagem) e `actionsSlot` (botões de editar, pausar, excluir — ficam acima do link que cobre o card, então continuam clicáveis).

## Match de roommates ⭐

| Componente | Import | Props principais |
|---|---|---|
| `MatchCard` | `@/src/components/match/match-card` | as do card + `score` (0 a 1) e `commonTraits` |
| `ConvivenciaPicker` | `@/src/components/match/convivencia-picker` | `traits` (`key`, `label`, `group`), `self`, `wanted`, `action` |

O `score` entra **como o `matchScore()` devolve**, de 0 a 1 — o card converte para porcentagem. Com `score={null}` o selo some, para quem ainda não montou o perfil de convivência.

As `commonTraits` são os **rótulos** das tags em comum, não as chaves. Elas é que explicam o número: sem elas, "87% compatível" é só um número solto.

O `ConvivenciaPicker` agrupa as tags pelo campo `group` e envia dois campos: `sou` e `procuro`.

## Perfil

`ProfileHeader`, de `@/src/components/profile/profile-header`.

Props: `name`, `username`, `avatarUrl`, `bio`, `campus`, `lastSeen`, `rating`, `reviewCount`, `actionSlot`. Sem `rating` ele mostra "Sem avaliações ainda"; o `actionSlot` serve para "Editar perfil" ou para os botões do Alexandre.

## Negociação e modais

| Componente | Import | Para que serve |
|---|---|---|
| `NegotiationCard` | `@/src/components/transactions/negotiation-card` | Status da negociação no topo do chat. Props: `status`, `price`, `cancelReason`, `waitingOther`, `actionsSlot` |
| `Modal` | `@/src/components/ui/modal` | Casca dos modais. Já envolve o conteúdo num `<form>`: passe `action` e os campos em `children` |
| `ReasonOptions` | idem | Motivos em chips, para denúncia e cancelamento |
| `RatingInput` | idem | Nota de 1 a 5 estrelas, com radios de verdade |

```tsx
<Modal
  trigger={<Button>Avaliar</Button>}
  title="Como foi negociar com o Fulano?"
  confirmLabel="Enviar avaliação"
  action={enviarAvaliacao}
>
  <RatingInput />
  <TextAreaField label="Comentário" htmlFor="comentario" name="comentario" />
</Modal>
```

O `NegotiationCard` entra no `headerSlot` do `ChatPanel`. Os quatro estados (`pending`, `confirmed`, `completed`, `cancelled`) já trazem o texto do que fazer em cada etapa — as ações entram por slot.

## Busca e descoberta

`FiltersSidebar`, de `@/src/components/discovery/filters-sidebar`.

É um **formulário GET**: o estado dos filtros vai para a URL e funciona sem JavaScript. Props: `action` (padrão `/busca`), `q`, `campuses`, `categories`, `selected`.

Os parâmetros que ele envia estão documentados em [DESIGN.md](DESIGN.md#sidebar-de-filtros). O arquivo também exporta `TYPE_OPTIONS`, `CONDITION_OPTIONS` e `SORT_OPTIONS`, para quem precisa validar no servidor.

## Chat

| Componente | Import | Props principais |
|---|---|---|
| `ConversationList` | `@/src/components/chat/conversation-list` | `conversations` (com `name`, `lastMessage`, `time`, `unread`, `active`) |
| `ChatPanel` | `@/src/components/chat/chat-panel` | `peer`, `messages`, `backHref`, `action`, `headerSlot` |

Cada mensagem usa `mine` para o lado e `read` para o duplo check. A rolagem automática e o tempo real ficam com quem é dono da rota.

## Formulários

| Componente | Import | Para que serve |
|---|---|---|
| `WizardShell` | `@/src/components/ui/wizard` | Casca dos formulários em passos: voltar, título, progresso e botão. Props: `title`, `subtitle`, `step`, `totalSteps`, `action`, `submitLabel`, `secondaryAction` |
| `TextField` / `TextAreaField` | `@/src/components/ui/field` | Campo com rótulo em pílula laranja. Props: `label`, `htmlFor`, `hint`, `error` + as do input |
| `PhotoPicker` | `@/src/components/ui/photo-picker` | Seletor de fotos com prévia. A primeira é a capa. A server action recebe em `formData.getAll("fotos")` |

```tsx
<WizardShell title="Descreva seu produto" step={2} totalSteps={6} action={salvarProduto}>
  <TextField label="Título" htmlFor="titulo" name="titulo" error={erros?.titulo} />
  <PhotoPicker />
</WizardShell>
```

O `error` já mostra a mensagem e marca o campo — é só passar o retorno do zod.

## Estados

Toda tela com dados precisa dos três: carregando, vazio e erro.

| Componente | Import | Observação |
|---|---|---|
| `EmptyState` | `@/src/components/ui/states` | `title`, `description`, `action`, `pose`. Padrão: Zeca com a lupa |
| `ErrorState` | idem | Mesmas props, todas opcionais. Padrão: Zeca confuso |
| `ListingGridSkeleton` | `@/src/components/listings/listing-grid` | Para o carregamento de listas |

```tsx
if (falhou) return <ErrorState />;
if (anuncios.length === 0) {
  return <EmptyState title="Nenhum anúncio por aqui ainda" description="Tente outros filtros." />;
}
```

**Escolha a pose do Zeca pelo humor da tela** — a tabela com as 7 e o que cada uma passa está em [DESIGN.md](DESIGN.md#zeca-o-mascote). Em lista vazia que não veio de busca, use `pose={1}`: a lupa só faz sentido quando alguém procurou algo.

## Regras que valem para tudo

- **Só tokens do tema.** Nada de `#f3421a` ou `text-[17px]` — use `bg-primary`, `text-muted-foreground`, `rounded-lg`. Se faltar um token, peça ao Caike.
- **Server Component por padrão.** Entre os componentes acima, só `PhotoPicker` e o menu do avatar rodam no cliente.
- **Texto para o usuário em pt-BR**, código em inglês.
- **Imagens:** os componentes usam `<img>` porque o `next/image` precisa do domínio do Supabase Storage em `next.config.ts`. Quando isso existir, a troca é centralizada.
