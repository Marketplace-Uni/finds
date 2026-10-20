# Plano de resolução das pendências

> Documento do time (versionado). Gerado em 18/10/2026 a partir de um levantamento completo do estado do projeto — bugs reportados, teste manual de ponta a ponta do fluxo de anúncios (criar/ver/editar/excluir nos 4 tipos) e revisão de todas as pendências registradas em `docs/` e nos checklists de `docs/equipe/`. A mostra é em 21/10/2026: a lista abaixo está ordenada do que mais bloqueia a demo pro que é só polimento.

Para o detalhe técnico de cada bug corrigido nesta rodada, ver a seção "Levantamento 18/10/2026" em `PENDENCIAS-KAIKE.md` (pessoal, não versionado).

## 🔴 Bloqueia a demo

| # | Pendência | Dono | Próximo passo concreto |
|---|---|---|---|
| 1 | **Upload de foto de anúncio não funciona em nenhum ambiente** — causa raiz confirmada: o bucket `listing-images` nunca teve uma policy de escrita em `storage.objects` (só o `avatars` tinha). Testado direto no Storage: toda tentativa falha com `new row violates row-level security policy`, de forma consistente (não é intermitente). A migration já está escrita (`supabase/migrations/20261018180000_policy_storage_listing_images.sql`) e o código já foi ajustado (`uploadImages()` em `src/app/actions/listings.ts`), mas **ninguém com acesso ao Claude Code tinha a senha do Postgres/token da CLI pra aplicá-la**. | **Quem tiver acesso ao painel do Supabase** | Colar o SQL de `supabase/migrations/20261018180000_policy_storage_listing_images.sql` no **SQL Editor**, nos dois projetos (`finds-dev` **e** `finds-demo`). Depois disso, testar criar um anúncio com foto de verdade. Isso também resolve o item "anúncios não aparecem em Meus Anúncios" (ver nota abaixo). |
| 2 | Redirect URL do Supabase para `/redefinir-senha` (issue #28) | Quem tiver acesso ao painel do Supabase | Confirmar em **Authentication → URL Configuration** dos projetos `finds-dev` e `finds-demo` que `{origin}/redefinir-senha` está na lista de Redirect URLs. Sem isso o fluxo de recuperar senha quebra silenciosamente. |
| ~~3~~ | ~~Edição de anúncio não mexe nas fotos (só campos de texto/seleção)~~ — **resolvido em 19/10/2026**: `anuncios/[id]/editar` agora busca `listing_images`, mostra um seletor (`EditImagesField`) que mistura fotos existentes e novas, e `updateListing()` reaproveita `uploadImages()` + reescreve `listing_images` com a lista final (mantidas + novas). Causa raiz era só código (RLS de `listing_images` e do bucket já eram `FOR ALL` para o dono desde as migrations existentes) — não precisou de mudança no Supabase. | Josué (área dele, implementado com autorização — ver `PENDENCIAS-KAIKE.md`) | — |
| 4 | Checklists de `docs/equipe/*.md` com itens `[X]` sem implementação correspondente no código (confirmado pelo menos em `docs/equipe/josue.md`: `/anunciar`, `/anuncios/[id]/editar`, `/meus-anuncios`) | Todo o time | Cada dev revisar o próprio checklist contra o que está de fato na `main`, antes do bug bash. O risco é descobrir outro buraco desses em cima da hora. |
| 5 | **Supabase Realtime não entrega nenhum evento (`postgres_changes`), em nenhuma tabela testada** — confirmado em 20/10/2026 com um diagnóstico isolado (script Node com a `service_role`, fora da aplicação): assinar `messages` (INSERT) ou `listings` (UPDATE) chega em `status: SUBSCRIBED` normalmente, mas o evento em si nunca chega, mesmo sem nenhum filtro e usando a `service_role` (então não é RLS). Isso bloqueia o chat em tempo real de verdade (`docs/PLANO-CHAT-REALTIME.md`, implementado e testado nesta rodada — o problema não é o código) **e também o roteiro da demo**, que depende do chat aparecer "na hora" entre os dois notebooks (`docs/ESCOPO.md`, passo 4). Detalhado em [issue #43](https://github.com/Marketplace-Uni/finds/issues/43). | **Quem tiver acesso ao painel do Supabase** | Ver [issue #43](https://github.com/Marketplace-Uni/finds/issues/43): em **Database → Replication**, abrir a publicação `supabase_realtime` e conferir se as tabelas (pelo menos `messages`) estão mesmo listadas lá — o toggle da tela pode não ter salvado, ou pode ter sido aplicado só num dos dois projetos. Se estiver tudo marcado e mesmo assim não funcionar, confirmar que o **Realtime está ligado pro projeto** (não só por tabela) e, por último, rodar manualmente no SQL Editor: `ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;` (idem pra outras tabelas que precisem, nos dois projetos `finds-dev` **e** `finds-demo`). Depois de aplicar, testar de novo com 2 contas reais — o código do chat já está pronto, só esperando isso. |

> **Nota sobre "anúncios de um usuário não aparecem em Meus Anúncios":** testado a fundo (criar cada tipo, com e sem foto, com faixa de preço) e `/meus-anuncios` funciona — o anúncio aparece assim que é criado. O que deve estar acontecendo é o item 1 acima: ao anexar foto, o upload falha e `createListingForm` nunca chega a criar o anúncio (só chama `createListing()` depois do upload dar certo) — não é que ele "some", é que nunca foi criado. Resolve junto com o item 1.

## 🟡 Importante, não bloqueia sozinho

| # | Pendência | Dono | Próximo passo concreto |
|---|---|---|---|
| ~~5~~ | ~~Chat lento — mensagem demora a aparecer (enviando ou recebendo)~~ — **implementado em 20/10/2026**: `mensagens/page.tsx`/`ChatConversation` seguem `docs/PLANO-CHAT-REALTIME.md` por completo (resolve o N+1, aplica o payload do Realtime direto no estado, envio otimista, lista de conversas reordena sozinha). Movido pro item 🔴#5 porque, testando, achamos que o bloqueio real não é o código — é a publicação Realtime do projeto (ver lá). | Alexandre | — |
| 6 | Seed final no `finds-demo` com histórico da demo (conversas, transação concluída, avaliação, perfil de convivência das contas do time) | Alexandre | Rodar antes da reta final, combinando com o time (o seed é destrutivo). |
| 7 | Ensaiar as partes de match e de chat+negociação da demo com 2 notebooks lado a lado | Kaike + Alexandre | Agendar um ensaio antes do dia 21/10. |
| 8 | Imagens otimizadas (`next/image`) para o feed carregar rápido no estande | Josué/Caike | Hoje todas as imagens de anúncio usam `<img>` puro (`ListingCard`, `ListingDetail`, `MatchDeck`) porque falta configurar `images.remotePatterns` com o domínio do Supabase Storage em `next.config.ts`. |
| 9 | Migrar `src/middleware.ts` para `proxy.ts` (aviso de depreciação do Next 16.3) | Kaike (ou quem rodar) | `npx @next/codemod@canary middleware-to-proxy .` e conferir login/sessão depois — o Claude Code não pôde rodar isso sozinho (bloqueio de execução de código externo baixado na hora). |
| 10 | `MatchDeck` (`src/components/match/match-deck.tsx:94`, `h-[calc(100svh-8rem)]`) e o painel de chat (`src/app/(main)/mensagens/page.tsx:534`, `h-[calc(100dvh-13rem)] min-h-[28rem]`) usam um offset fixo em `rem` pra descontar a navbar — pode sobrar ou faltar espaço dependendo da altura real da navbar/paddings num celular de verdade. Não dá pra confirmar sem testar num aparelho (a auditoria de 20/10 foi só leitura de código: a ferramenta de emular viewport estreito não funcionou nesta sessão). | Kaike (match) / Alexandre (chat) | Abrir as duas telas num celular real e ajustar o valor fixo se sobrar/faltar espaço. |

## 🟢 Decisões de design em aberto (não é bug)

Da seção "Pontos para decidir com a Lia" em `docs/DESIGN.md` — sem efeito funcional, só não foram fechadas ainda:

- Botão "Seguir" o vendedor no detalhe do anúncio (sugestão já registrada: tirar do layout, não está no escopo).
- Fonte "Inter" residual em alguns textos (tratar como Montserrat no código; a Lia corrige no Figma quando puder).
- Typo "ordernar" no Figma (no código já está certo).
- Se a mensagem própria no chat deveria ter cor diferente da do outro lado.

**Dono:** Caike, no próximo checkpoint com a designer.

## ✅ Resolvido nesta rodada (não precisa de ação)

Itens que apareciam como pendência em algum lugar e foram confirmados como já resolvidos:

- `/roommates` usando a grade antiga em vez do `MatchDeck` — corrigido.
- `/` sempre mostrando o feed, mesmo pra visitante — corrigido.
- Schema de `details` por tipo de anúncio (antes pendência do Kaike, esperando o Josué) — existe e está consistente com `listing-details.ts`.
- Dados de seed (`scripts/seed.ts` + imagens) — existem e estão populados no `finds-dev`.
- Coluna `profiles.course` — migration aplicada, tipo gerado, e já é salva em `/configuracoes` (o código tinha um comentário desatualizado dizendo o contrário).
- Dados de referência (campus/universidade/traits) — confirmados presentes testando o cadastro e o feed.
- `src/types/database.ts` salvo em UTF-16 por engano (quebrava `npm run lint` pra todo mundo) — resalvo em UTF-8. Ver o aviso já existente no `CLAUDE.md` sobre `Out-File -Encoding utf8` no PowerShell, pra não repetir.
- `uploadImages()` (em `src/app/actions/listings.ts`) quebrava com "Erro no upload da imagem" sempre que o formulário era enviado sem nenhuma foto — corrigido.
- `/anunciar` (4 formulários), `/meus-anuncios` e `anuncios/[id]/editar` — implementados nesta rodada (fora da área do Kaike, autorizado pelo Guilherme; ver `PENDENCIAS-KAIKE.md` para o detalhe e o pedido de revisão ao Josué).
- `<UnreadBadge>` não conectado na navbar — já estava resolvido (commit anterior, `feat(navbar): conecta a contagem de mensagens não lidas`), confirmado lendo o código atual.
- Teste de segurança (logado como B, tentar ler/editar/excluir anúncio de A) — rodado com 2 contas reais: RLS bloqueou leitura de rascunho de outro usuário, edição, exclusão e troca de status do anúncio de outra pessoa. Passou em todos os casos testados.
- Filtro de categoria/condição no feed/busca sem efeito na query, e fieldset "Categoria" nunca aparecia — corrigido (`CATEGORY_OPTIONS` + filtro `details->>category`/`details->>condition` em `src/lib/listings.ts`).
- `/anuncios/[id]`: botão "Tenho interesse" (`<StartChatButton>`) não estava plugado, apesar de pronto pelo Alexandre — plugado e testado de ponta a ponta (abrir conversa + enviar mensagem).
- Faixa de preço (em vez de preço único) para roommate/república, e data de entrada sempre em dd/mm/aaaa (independente do locale do navegador) — implementados.
- Navbar mostrava a localização do usuário em vez de um atalho pro match de roommates; filtros do feed sempre abertos, ocupando espaço — ambos ajustados (ver `PENDENCIAS-KAIKE.md`, mexe em arquivo do Caike).
- Landing (deslogado): o retângulo marrom (hero) não ocupava a largura inteira da tela — corrigido.

## ✅ Resolvido em 20/10/2026

- **"Não consigo entrar em `/entrar` pelo celular"**: causa raiz era o `next dev` bloqueando (403) qualquer origem diferente de `localhost`, inclusive os chunks de JS que hidratam a página — acessar pela URL "Network:" (IP da máquina na rede) conta como origem diferente. A página HTML carregava, mas o React nunca hidratava, então o botão "Entrar" (que depende de JS) não respondia ao toque, sem erro visível. Corrigido com `allowedDevOrigins` em `next.config.ts` (só afeta `npm run dev`, nunca produção). Testado acessando pelo IP da rede: toggle de senha e submit do formulário funcionando.
- Efeito de scroll da landing (GSAP) cobrindo "Quatro jeitos de usar"/"Como funciona" — causa raiz: margem no elemento que o GSAP pina (`-mt-8 -mx-[50vw]` do truque de full-bleed) bagunçava o cálculo do espaçador do pin. Corrigido movendo a margem pra um `<div>` de fora do elemento pinado.
- Auditoria de responsividade mobile (leitura de código, sem emulação de viewport — ver item 10 acima): feed, busca, sidebar de filtros, `/anunciar` + preview, `anuncios/[id]/editar`, `meus-anuncios`, `configuracoes`, `negociacoes`, `favoritos`, detalhe do anúncio e o layout de auth já são mobile-first de verdade (classes sem prefixo = mobile, `lg:`/`sm:` só adicionam). Nenhum problema de CSS encontrado nessas telas — só os dois offsets fixos do item 10, que precisam de teste num aparelho real pra confirmar.
- Chat implementado seguindo `docs/PLANO-CHAT-REALTIME.md` por completo (N+1 resolvido, Realtime aplicado direto no estado, envio otimista, lista de conversas em tempo real) — ver item 🔴#5 (e [issue #43](https://github.com/Marketplace-Uni/finds/issues/43)) pro bloqueio de infraestrutura encontrado ao testar (a publicação Realtime do Supabase não está entregando eventos pra nenhuma tabela, não é específico do chat).
- Revisão de segurança adversarial do diff da sessão (sem achado "Crítico"): limite de fotos (`MAX_IMAGES_PER_LISTING = 6`) passou a ser aplicado também no servidor em `uploadImages()`/`updateListing()` (antes só existia como UX no `PhotoPicker`/`EditImagesField`, então uma Server Action forjada podia anexar fotos sem limite); `updateListing()` agora insere a lista final de fotos **antes** de apagar as antigas (por `id`, nunca por `listing_id`), pra nunca ficar com um anúncio sem nenhuma foto se o insert falhar no meio; `landing-scroll-fx.tsx` ganhou cleanup explícito (`killTweensOf` + `clearProps`) pros tweens de `onEnter`/`onLeaveBack`, que o `gsap.matchMedia()` não rastreia sozinho.
- Último lote de ajustes de UI: seta dos selects de `/anunciar` centralizada no canto direito (`SelectField` novo em `ui/field.tsx`); painel de preview ao vivo (o mesmo da criação) agora também aparece em "Editar Anúncio"; efeito de rotação no ícone do menu da conta ao abrir; toast de confirmação ao salvar o perfil de convivência.
- Dependências novas instaladas nesta rodada: `gsap` (efeito de scroll da landing) e `sonner` (toasts — favoritar, convivência).
