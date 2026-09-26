# Escopo do Finds

## O produto em uma frase

Um marketplace **fechado para a comunidade da UFU**, onde a pessoa do outro lado da negociação é um colega de universidade verificado pelo e-mail institucional. Reúne 4 tipos de anúncio: **produtos, serviços, roommates e repúblicas**.

**Diferencial para a mostra:** o **match de roommates**. A pessoa descreve como ela é e o que procura num colega de moradia, e o Finds ordena os anúncios por compatibilidade.

## Premissas

- **Web desktop**, não mobile. O layout deve ser minimamente responsivo, mas o alvo é o notebook no estande.
- **A demo é feita com as contas do próprio time.** Visitantes não vão se cadastrar no estande, então não precisamos nos preocupar com limite de envio de e-mail, moderação ou escala.
- **O banco precisa estar populado.** Marketplace vazio não impressiona, e os dados de seed são tratados como feature (P0).
- Capacidade estimada: ~1h por dia útil + um pouco mais nos fins de semana, o que dá **~35–40h por pessoa** no projeto inteiro. O escopo foi cortado para caber nisso.

## Prioridades

### 🔴 P0: essencial (sem isso não tem demo)

| # | Feature | Notas | Dono |
|---|---|---|---|
| 1 | Cadastro e login com e-mail **@ufu.br** | Valida o domínio + confirmação de e-mail do Supabase | Dev 1 |
| 2 | Onboarding em 2 etapas | Cadastro leve (nome, username, e-mail, senha). Campus é pedido só ao tentar agir (anunciar, conversar, favoritar) | Dev 1 |
| 3 | Criar, editar e excluir anúncio dos **4 tipos**, com fotos | Uma tabela `listings` com `type` + campos específicos em `details` | Dev 2 |
| 4 | Feed + busca + filtros | Tipo, campus/cidade, categoria, faixa de preço, texto | Dev 3 |
| 5 | Página de detalhe do anúncio | Galeria, informações, card do anunciante, botão de contato | Dev 3 |
| 6 | Perfil (editar o próprio + ver o público) | Foto, bio, campus, anúncios ativos | Dev 1 / Dev 3 |
| 7 | "Meus anúncios" | Ativos / rascunhos / encerrados | Dev 2 |
| 8 | Chat por anúncio, em tempo real | Só texto. Uma conversa por par (anúncio, interessado) | Dev 4 |
| 9 | **Match de roommates (versão simples)** | Tags "sou" e "procuro" + score de compatibilidade (ver ARQUITETURA) | Dev 1 |
| 10 | Dados de seed realistas | ~50 anúncios com fotos, ~12 usuários, conversas | Dev 3 |
| 11 | Deploy com URL pública | Vercel + Supabase | Dev 2 |

### 🟡 P1: incrementos (entram quando o P0 estiver de pé)

| Feature | Custo | Dono |
|---|---|---|
| Rascunhos de anúncio | Baixo: o campo `status` já existe desde o schema inicial | Dev 2 |
| Último acesso ("ativo há 2h") | Baixo | Dev 1 |
| Favoritos | Baixo | Dev 3 |
| Denúncias (modal + registro no banco, sem painel) | Baixo | Dev 3 |
| Transação com confirmação dupla (pendente → confirmada → concluída / cancelada com motivo) | Médio | Dev 4 |
| Avaliações após transação concluída + nota média no perfil | Médio | Dev 4 |
| Landing page para usuário deslogado | Baixo | Dev 3 + Designer |
| Contador de mensagens não lidas | Baixo | Dev 4 |
| Recuperar senha | Baixo | Dev 1 |

### ⚪ Backlog (entra na apresentação como "próximos passos", não será implementado)

- Painel de moderação para as denúncias
- Match avançado: pesos por característica, critérios eliminatórios ("não aceito fumante"), "deu match" recíproco
- Notificações por e-mail e push
- Multi-universidade (o banco já prevê `universities`, mas só a UFU fica ativa)
- Chat com imagens, "digitando…", confirmação de leitura
- App mobile / PWA
- Pagamento dentro da plataforma, mapas e geolocalização

## Roteiro da demo (rascunho, ~4 minutos)

Dois notebooks lado a lado, cada um logado com a conta de um dev.

1. **O problema** (30s): "Você acabou de passar na UFU, vai se mudar para Uberlândia, precisa de móveis, de um lugar para morar e de alguém para dividir."
2. **Confiança** (20s): o cadastro só aceita @ufu.br. Mostrar o perfil com campus, "ativo há X", avaliações.
3. **Descoberta** (40s): feed, filtro por campus e tipo, abrir um anúncio de produto.
4. **Chat em tempo real** (40s): notebook A manda "ainda está disponível?" e a mensagem aparece na hora no notebook B.
5. **Negociação** (40s): propor transação → o outro confirma → ambos concluem → avaliação.
6. **⭐ Match de roommates** (60s): marcar "sou: organizado, noturno, gosto de pets" → a lista reordena por compatibilidade com os % e as tags em comum destacadas.
7. **Próximos passos** (20s): backlog e expansão para outras universidades.

**Plano B:** gravar um vídeo da demo completa no dia 20/10, para o caso de a internet do estande falhar.
