import { Heart } from "lucide-react";

import { Navbar } from "@/src/components/layout/navbar";
import { LogoFinds } from "@/src/components/layout/logo-finds";
import { AuthArt } from "@/src/components/layout/auth-art";
import { ListingCard } from "@/src/components/listings/listing-card";
import { AnunciarBanner } from "@/src/components/listings/anunciar-banner";
import { ListingTabs } from "@/src/components/listings/listing-tabs";
import { MatchCard } from "@/src/components/match/match-card";
import { ConvivenciaPicker } from "@/src/components/match/convivencia-picker";
import { ProfileHeader } from "@/src/components/profile/profile-header";
import { NegotiationCard } from "@/src/components/transactions/negotiation-card";
import { Modal, ReasonOptions, RatingInput } from "@/src/components/ui/modal";
import { ListingDetail } from "@/src/components/listings/listing-detail";
import {
  ListingGrid,
  ListingGridSkeleton,
} from "@/src/components/listings/listing-grid";
import { EmptyState, ErrorState } from "@/src/components/ui/states";
import { Button } from "@/src/components/ui/button";
import { WizardShell } from "@/src/components/ui/wizard";
import { TextField, TextAreaField } from "@/src/components/ui/field";
import { PhotoPicker } from "@/src/components/ui/photo-picker";
import { OverlayIconButton } from "@/src/components/ui/overlay-icon-button";
import { Zeca, ZECA_POSES, type ZecaPose } from "@/src/components/ui/zeca";
import { ConversationList } from "@/src/components/chat/conversation-list";
import { ChatPanel } from "@/src/components/chat/chat-panel";
import { FiltersSidebar } from "@/src/components/discovery/filters-sidebar";

/**
 * Página de apoio do Caike: mostra a navbar nos dois estados e a paleta,
 * para validar o visual com a Lia pelo link de preview da Vercel.
 * Não faz parte do produto — pode sair quando o feed estiver de pé.
 */
export const metadata = { title: "Finds · padrão visual" };

const cores = [
  { token: "background", classe: "bg-background", hex: "#feffe6" },
  { token: "primary", classe: "bg-primary", hex: "#f3421a" },
  { token: "secondary", classe: "bg-secondary", hex: "#cfdd4a" },
  { token: "foreground / nav", classe: "bg-nav", hex: "#2b201a" },
  { token: "card / muted", classe: "bg-card", hex: "#eff0c3" },
  { token: "accent / border", classe: "bg-accent", hex: "#e68c72" },
  { token: "muted-foreground", classe: "bg-muted-foreground", hex: "#bfc085" },
];

/** Exemplos com os dados do próprio Figma, para conferir o visual. */
const exemplos = [
  {
    href: "/anuncios/1",
    title: "Mesa digitalizadora",
    price: 150,
    location: "Uberlândia, MG",
  },
  {
    href: "/anuncios/2",
    title: "Aula de cálculo 1 para engenharia",
    price: 60,
    priceNote: "por hora",
    location: "Santa Mônica",
    typeLabel: "Serviço",
  },
  {
    href: "/anuncios/3",
    title: "Vaga em república perto do campus Umuarama",
    price: 550,
    priceNote: "por mês",
    location: "Umuarama",
    typeLabel: "República",
  },
  {
    href: "/anuncios/4",
    title: "Procuro alguém para dividir apartamento de 2 quartos",
    location: "Uberlândia, MG",
    typeLabel: "Roommate",
  },
];

/**
 * Comparador do bege de fundo, para a Lia escolher. Aqui os hex são o próprio
 * assunto, por isso vão inline em vez de token — é a única exceção na base.
 */
const begesCandidatos = [
  { rotulo: "A · original do Figma", hex: "#feffd5" },
  { rotulo: "B · aprovado pela Lia ✅", hex: "#feffe6" },
  { rotulo: "C · bem mais claro", hex: "#fffff2" },
];

const raios = [
  { nome: "rounded-sm", valor: "12px" },
  { nome: "rounded-md", valor: "21px" },
  { nome: "rounded-lg", valor: "30px" },
  { nome: "rounded-xl", valor: "34px" },
  { nome: "rounded-pill", valor: "76px" },
];

export default function PreviewVisualPage() {
  return (
    <div className="flex flex-col gap-10 pb-16">
      <section className="flex flex-col gap-2">
        <h2 className="mx-auto w-full max-w-conteudo px-6 pt-8 text-sm font-semibold text-muted-foreground">
          Navbar — visitante
        </h2>
        <Navbar />
      </section>

      <section className="flex flex-col gap-2">
        <h2 className="mx-auto w-full max-w-conteudo px-6 text-sm font-semibold text-muted-foreground">
          Navbar — logado, com campus e 3 mensagens não lidas
        </h2>
        <Navbar
          user={{ name: "Caike Araújo", username: "caike" }}
          campus="Santa Mônica"
          unreadCount={3}
        />
      </section>

      <div className="mx-auto flex w-full max-w-conteudo flex-col gap-10 px-6">
        <section>
          <h2 className="mb-1 text-xl font-bold">Match de roommates ⭐</h2>
          <p className="mb-4 text-sm text-muted-foreground">
            Sprint 2. O selo de compatibilidade e as tags em comum — que são o
            &quot;porquê&quot; do número. Não existe tela para isso no Figma; composto
            a partir do card e dos chips.
          </p>
          <ListingGrid className="lg:grid-cols-3 xl:grid-cols-4">
            <MatchCard
              href="/anuncios/10"
              title="Vaga em república no Santa Mônica"
              price={550}
              priceNote="por mês"
              location="Santa Mônica"
              score={0.87}
              commonTraits={["dorme cedo", "organizado", "não fuma"]}
            />
            <MatchCard
              href="/anuncios/11"
              title="Divido apartamento de 2 quartos"
              price={700}
              priceNote="por mês"
              location="Umuarama"
              score={0.62}
              commonTraits={["gosta de silêncio", "tem pet"]}
            />
            <MatchCard
              href="/anuncios/12"
              title="Quarto individual perto do campus"
              price={480}
              priceNote="por mês"
              location="Glória"
              score={0.35}
              commonTraits={["noturno"]}
            />
            <MatchCard
              href="/anuncios/13"
              title="Procuro alguém para dividir casa"
              location="Uberlândia, MG"
              score={null}
            />
          </ListingGrid>
        </section>

        <section>
          <h2 className="mb-1 text-xl font-bold">Perfil de convivência</h2>
          <p className="mb-4 text-sm text-muted-foreground">
            Sprint 2. O que alimenta o match: a pessoa marca como é e o que procura.
          </p>
          <div className="rounded-lg bg-card/50 p-6">
            <ConvivenciaPicker
              traits={[
                { key: "dorme-cedo", label: "dorme cedo", group: "rotina" },
                { key: "noturno", label: "noturno", group: "rotina" },
                { key: "organizado", label: "organizado", group: "organização" },
                { key: "bagunceiro", label: "tranquilo com bagunça", group: "organização" },
                { key: "silencio", label: "gosta de silêncio", group: "convivência" },
                { key: "visitas", label: "recebe visitas", group: "convivência" },
                { key: "pet", label: "tem pet", group: "hábitos" },
                { key: "nao-fuma", label: "não fuma", group: "hábitos" },
              ]}
              self={["dorme-cedo", "organizado"]}
              wanted={["silencio", "nao-fuma"]}
            />
          </div>
        </section>

        <section>
          <h2 className="mb-1 text-xl font-bold">Cabeçalho do perfil</h2>
          <p className="mb-4 text-sm text-muted-foreground">
            Sprint 2. Com e sem avaliações.
          </p>
          <div className="flex flex-col gap-4">
            <ProfileHeader
              name="Fulano de Tal"
              username="fulano"
              bio="Estudante de Engenharia Civil. Vendo o que não uso mais e às vezes dou aula de cálculo."
              campus="Santa Mônica"
              lastSeen="ativo há 2h"
              rating={4.8}
              reviewCount={12}
              actionSlot={
                <Button variant="ghost" className="rounded-pill">
                  Editar perfil
                </Button>
              }
            />
            <ProfileHeader
              name="Beltrana Souza"
              username="beltrana"
              campus="Umuarama"
              lastSeen="ativo há 3 dias"
            />
          </div>
        </section>

        <section>
          <h2 className="mb-1 text-xl font-bold">Meus anúncios: abas e estados</h2>
          <p className="mb-4 text-sm text-muted-foreground">
            Sprint 2. As abas são links, então o estado fica na URL.
          </p>
          <ListingTabs
            tabs={[
              { value: "ativos", label: "Ativos", count: 4 },
              { value: "rascunhos", label: "Rascunhos", count: 2 },
              { value: "encerrados", label: "Encerrados", count: 7 },
            ]}
            current="ativos"
            className="mb-5"
          />
          <ListingGrid className="lg:grid-cols-3 xl:grid-cols-4">
            {(
              [
                { status: "active", title: "Mesa digitalizadora" },
                { status: "draft", title: "Cadeira gamer (sem foto ainda)" },
                { status: "paused", title: "Monitor 24 polegadas" },
                { status: "sold", title: "Bicicleta aro 29" },
              ] as const
            ).map((item, i) => (
              <ListingCard
                key={item.title}
                href={`/anuncios/${i}`}
                title={item.title}
                price={150 + i * 90}
                location="Santa Mônica"
                status={item.status}
                actionsSlot={
                  <>
                    <Button variant="ghost" className="h-8 rounded-pill px-3 text-xs">
                      Editar
                    </Button>
                    <Button variant="ghost" className="h-8 rounded-pill px-3 text-xs">
                      {item.status === "paused" ? "Reativar" : "Pausar"}
                    </Button>
                  </>
                }
              />
            ))}
          </ListingGrid>
        </section>

        <section>
          <h2 className="mb-1 text-xl font-bold">Negociação e modais</h2>
          <p className="mb-4 text-sm text-muted-foreground">
            Sprint 2. O card entra no topo do chat; os modais abrem de verdade — pode
            clicar.
          </p>
          <div className="grid gap-4 lg:grid-cols-2">
            <NegotiationCard
              status="pending"
              price={150}
              actionsSlot={
                <>
                  <Button className="rounded-pill">Aceitar</Button>
                  <Button variant="ghost" className="rounded-pill">
                    Recusar
                  </Button>
                </>
              }
            />
            <NegotiationCard
              status="confirmed"
              price={150}
              actionsSlot={
                <Button className="rounded-pill">Marcar como concluído</Button>
              }
            />
            <NegotiationCard status="completed" price={150} waitingOther />
            <NegotiationCard
              status="cancelled"
              cancelReason="Desisti da compra"
            />
          </div>

          <div className="mt-5 flex flex-wrap gap-3">
            <Modal
              trigger={<Button className="rounded-pill">Avaliar pessoa</Button>}
              title="Como foi negociar com o Fulano?"
              description="Sua avaliação aparece no perfil dele."
              confirmLabel="Enviar avaliação"
            >
              <RatingInput />
              <TextAreaField
                label="Comentário"
                htmlFor="comentario-demo"
                name="comentario"
                rows={3}
                placeholder="Conte como foi o combinado e a entrega."
              />
            </Modal>

            <Modal
              trigger={
                <Button variant="ghost" className="rounded-pill">
                  Denunciar anúncio
                </Button>
              }
              title="Denunciar anúncio"
              description="Conte o que houve. A denúncia é anônima."
              confirmLabel="Enviar denúncia"
              destructive
            >
              <ReasonOptions
                options={[
                  { value: "golpe", label: "Parece golpe" },
                  { value: "proibido", label: "Item proibido" },
                  { value: "ofensivo", label: "Conteúdo ofensivo" },
                  { value: "outro", label: "Outro" },
                ]}
              />
            </Modal>

            <Modal
              trigger={
                <Button variant="ghost" className="rounded-pill">
                  Cancelar negociação
                </Button>
              }
              title="Cancelar negociação"
              description="A outra pessoa vai ver o motivo."
              confirmLabel="Cancelar negociação"
              cancelLabel="Voltar"
              destructive
            >
              <ReasonOptions
                name="motivo-cancelamento"
                options={[
                  { value: "desisti", label: "Desisti" },
                  { value: "sem-resposta", label: "Sem resposta" },
                  { value: "achei-outro", label: "Achei outro" },
                  { value: "outro", label: "Outro" },
                ]}
              />
            </Modal>
          </div>
        </section>

        <section>
          <h2 className="mb-1 text-xl font-bold">Faixa &quot;Faça um anúncio!&quot;</h2>
          <p className="mb-4 text-sm text-muted-foreground">
            Do frame <code>Menu App</code> do Figma. Usa a pose 4 do Zeca — a única
            horizontal, que cabe numa faixa larga sem esticar nada.
          </p>
          <AnunciarBanner />
        </section>

        <section>
          <h2 className="mb-1 text-xl font-bold">Card de anúncio e grid</h2>
          <p className="mb-4 text-sm text-muted-foreground">
            Quatro variações: com e sem preço, com complemento de preço, com chip de
            tipo e com o slot de favoritar. O último card não tem imagem, para mostrar
            o vazio.
          </p>
          <ListingGrid>
            {exemplos.map((exemplo) => (
              <ListingCard
                key={exemplo.href}
                {...exemplo}
                favoriteSlot={
                  <OverlayIconButton aria-label="Favoritar">
                    <Heart aria-hidden />
                  </OverlayIconButton>
                }
              />
            ))}
          </ListingGrid>
        </section>

        <section>
          <h2 className="mb-1 text-xl font-bold">Tela dividida de entrar / criar conta</h2>
          <p className="mb-4 text-sm text-muted-foreground">
            Layout do grupo <code>(auth)</code>, sem navbar. A ilustração do Figma é
            imagem rasterizada e não foi exportada, então o painel usa logo e
            tipografia até a Lia mandar a arte. No celular sobra só o formulário.
          </p>
          <div className="grid overflow-hidden rounded-lg border border-border lg:grid-cols-2">
            <AuthArt />
            <div className="flex flex-col items-center justify-center gap-6 px-6 py-12">
              <div className="flex w-full max-w-sm flex-col gap-4">
                <h3 className="text-center text-xl font-semibold text-foreground">
                  Entrar
                </h3>
                <TextField
                  label="E-mail"
                  htmlFor="demo-email"
                  type="email"
                  placeholder="voce@ufu.br"
                  hint="Use seu e-mail @ufu.br."
                />
                <TextField
                  label="Senha"
                  htmlFor="demo-senha"
                  type="password"
                  placeholder="••••••••"
                />
                <Button className="rounded-pill py-6 font-bold">Entrar</Button>
                {/* Menor e colado no "Entrar", como a Lia pediu. */}
                <Button
                  variant="ghost"
                  className="-mt-2 h-auto py-1 text-xs text-muted-foreground hover:bg-transparent"
                >
                  Esqueci minha senha
                </Button>
              </div>
            </div>
          </div>
        </section>

        <section>
          <h2 className="mb-1 text-xl font-bold">Chat em 2 painéis</h2>
          <p className="mb-4 text-sm text-muted-foreground">
            Lista de conversas à esquerda, conversa à direita. No mobile são duas
            telas; no desktop convivem. Repare que os dois lados usam a mesma cor de
            balão, como no Figma — muda o alinhamento e o canto reto.
          </p>
          <div className="flex h-[520px] gap-4 rounded-lg bg-card/50 p-4">
            <ConversationList
              conversations={[
                {
                  id: "1",
                  href: "#",
                  name: "Fulano de Tal",
                  listingTitle: "Mesa digitalizadora",
                  lastMessage: "Oii, tudo bem e com você?",
                  time: "12:00",
                  active: true,
                },
                {
                  id: "2",
                  href: "#",
                  name: "Beltrana Souza",
                  listingTitle: "Vaga em república",
                  lastMessage: "Mensagem não lida",
                  time: "ontem",
                  unread: true,
                },
                {
                  id: "3",
                  href: "#",
                  name: "Ciclano Lima",
                  listingTitle: "Aula de cálculo 1",
                  lastMessage: "Combinado então!",
                  time: "seg",
                },
              ]}
            />
            <ChatPanel
              peer={{
                name: "Fulano de Tal",
                lastSeen: "última vez visto às 14:59",
                profileHref: "/perfil/fulano",
              }}
              messages={[
                { id: "a", content: "Oii, tudo bem?", time: "12:00" },
                {
                  id: "b",
                  content: "Oii, tudo bem e com você?",
                  time: "12:00",
                  mine: true,
                  read: true,
                },
                {
                  id: "c",
                  content: "Tudo! A mesa ainda está disponível?",
                  time: "12:01",
                },
                {
                  id: "d",
                  content:
                    "Está sim! Posso levar no Santa Mônica amanhã de tarde, se quiser ver pessoalmente.",
                  time: "12:02",
                  mine: true,
                },
              ]}
            />
          </div>
        </section>

        <section>
          <h2 className="mb-1 text-xl font-bold">Wizard de formulário</h2>
          <p className="mb-4 text-sm text-muted-foreground">
            Casca dos formulários em passos (anunciar, completar perfil). O rótulo
            é uma pílula laranja, como no Figma. O seletor de fotos é a única parte
            que roda no cliente — experimente adicionar imagens.
          </p>
          <div className="rounded-lg bg-card/50 p-6">
            <WizardShell
              title="Descreva seu produto"
              subtitle="o que você vai anunciar por aqui?"
              step={2}
              totalSteps={6}
              backHref="/anunciar"
              secondaryAction={
                <Button variant="ghost" className="rounded-pill text-muted-foreground">
                  Salvar rascunho
                </Button>
              }
            >
              <TextField
                label="Título"
                htmlFor="demo-titulo"
                name="titulo"
                placeholder="Mesa digitalizadora"
                hint="Seja específico: marca, modelo e estado."
              />
              <TextAreaField
                label="Descrição"
                htmlFor="demo-descricao"
                name="descricao"
                placeholder="Conte o que está vendendo, como está conservado e por que está vendendo."
              />
              <TextField
                label="Preço"
                htmlFor="demo-preco"
                name="preco"
                type="number"
                placeholder="150"
                error="Informe um preço maior que zero."
              />
              <PhotoPicker />
            </WizardShell>
          </div>
        </section>

        <section>
          <h2 className="mb-1 text-xl font-bold">Detalhe do anúncio</h2>
          <p className="mb-4 text-sm text-muted-foreground">
            Galeria à esquerda; título, preço, chips, anunciante e CTA à direita,
            acompanhando o scroll. Os botões de chat, favoritar e denunciar são
            slots — aqui preenchidos com exemplos.
          </p>
          <ListingDetail
            title="Mesa digitalizadora"
            price={150}
            description={
              "Mesa digitalizadora usada por um ano, funcionando perfeitamente. " +
              "Acompanha caneta e cabo USB.\n\nVendo porque troquei por um modelo maior."
            }
            images={[]}
            categories={["eletrodomésticos", "tecnologia"]}
            attributes={["usado", "detalhes de uso"]}
            specs={[
              { label: "Categoria", value: "Eletrônicos" },
              { label: "Campus", value: "Santa Mônica" },
            ]}
            seller={{
              name: "Fulano de Tal",
              username: "fulano",
              lastSeen: "última vez visto em 14:29",
            }}
            favoriteSlot={
              <OverlayIconButton aria-label="Favoritar" className="shrink-0 bg-card">
                <Heart aria-hidden />
              </OverlayIconButton>
            }
            chatSlot={
              <Button className="w-full rounded-lg py-6 text-base font-bold">
                CHAT COM O VENDEDOR
              </Button>
            }
            reportSlot={
              <Button
                variant="ghost"
                className="h-auto rounded-pill py-1 text-sm font-semibold text-primary hover:bg-transparent hover:text-primary"
              >
                Denunciar anúncio
              </Button>
            }
            relatedSlot={
              <ListingGrid className="lg:grid-cols-3 xl:grid-cols-4">
                {exemplos.slice(0, 3).map((exemplo) => (
                  <ListingCard key={exemplo.href} {...exemplo} />
                ))}
              </ListingGrid>
            }
          />
        </section>

        <section>
          <h2 className="mb-1 text-xl font-bold">Sidebar de filtros + grid</h2>
          <p className="mb-4 text-sm text-muted-foreground">
            Como a busca fica no desktop: as telas &quot;filtros&quot;,
            &quot;campus&quot; e &quot;ordenar&quot; do mobile somem e viram esta
            coluna. É um formulário GET, então funciona sem JavaScript.
          </p>
          <div className="flex flex-col gap-8 lg:flex-row">
            <FiltersSidebar
              q="mesa"
              campuses={[
                { value: "santa-monica", label: "Santa Mônica" },
                { value: "umuarama", label: "Umuarama" },
                { value: "gloria", label: "Glória" },
              ]}
              categories={[
                { value: "moveis", label: "Móveis" },
                { value: "eletronicos", label: "Eletrônicos" },
                { value: "livros", label: "Livros" },
              ]}
              selected={{ tipo: ["produto"], campus: "santa-monica" }}
            />
            <div className="min-w-0 flex-1">
              <ListingGrid className="lg:grid-cols-2 xl:grid-cols-3">
                {exemplos.map((exemplo) => (
                  <ListingCard key={exemplo.href} {...exemplo} />
                ))}
              </ListingGrid>
            </div>
          </div>
        </section>

        <section>
          <h2 className="mb-1 text-xl font-bold">Carregando</h2>
          <p className="mb-4 text-sm text-muted-foreground">
            Esqueleto com a mesma altura do card, para o layout não pular.
          </p>
          <ListingGridSkeleton count={4} />
        </section>

        <section>
          <h2 className="mb-4 text-xl font-bold">Estado vazio e erro</h2>
          <div className="grid gap-4 lg:grid-cols-2">
            <EmptyState
              title="Nenhum anúncio por aqui ainda"
              description="Tente mudar os filtros ou buscar por outro termo."
              action={<Button className="rounded-pill">Limpar filtros</Button>}
            />
            <ErrorState />
          </div>
        </section>

        <section>
          <h2 className="mb-1 text-xl font-bold">Zeca — as 7 poses</h2>
          <p className="mb-4 text-sm text-muted-foreground">
            O arquivo da Lia traz 7 poses empilhadas, e 6 delas estavam fora da área
            visível do SVG. Aqui cada uma aparece recortada no próprio desenho, com a
            emoção que ela passa. Em uso hoje:{" "}
            <strong className="text-foreground">
              3 no estado vazio, 6 no erro e 1 no login
            </strong>
            .
          </p>
          <ul className="grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-7">
            {ZECA_POSES.map((pose, i) => (
              <li
                key={i}
                className="flex flex-col items-center gap-2 rounded-lg bg-card p-4"
              >
                <div className="flex h-36 items-end justify-center">
                  {/* Altura explícita: com `max-h` o SVG não ganha altura e colapsa. */}
                  <Zeca pose={(i + 1) as ZecaPose} className="h-36 w-auto text-primary" />
                </div>
                <span className="text-xs font-semibold">{`pose ${i + 1}`}</span>
                <span className="text-xs text-muted-foreground">{pose.emocao}</span>
              </li>
            ))}
          </ul>
        </section>

        <section>
          <h2 className="mb-1 text-xl font-bold">Logo</h2>
          <p className="mb-4 text-sm text-muted-foreground">
            Vetor da Lia, com o viewBox recortado no desenho. Herda a cor do texto,
            então serve nos dois fundos. Proporção ~2.97:1.
          </p>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex flex-col items-start gap-4 rounded-lg bg-card p-6">
              <LogoFinds className="h-14 w-auto text-primary" />
              <LogoFinds className="h-7 w-auto text-primary" />
              <LogoFinds className="h-4 w-auto text-primary" />
              <span className="text-xs text-muted-foreground">
                laranja da marca, sobre superfície clara
              </span>
            </div>
            <div className="flex flex-col items-start gap-4 rounded-lg bg-nav p-6">
              <LogoFinds className="h-14 w-auto text-primary" />
              <LogoFinds className="h-7 w-auto text-nav-foreground" />
              <LogoFinds className="h-4 w-auto text-secondary" />
              <span className="text-xs text-nav-foreground/70">
                laranja, creme e limão sobre o marrom da navbar
              </span>
            </div>
          </div>
        </section>

        <section>
          <h2 className="mb-1 text-xl font-bold">Qual bege de fundo? (para a Lia)</h2>
          <p className="mb-4 text-sm text-muted-foreground">
            O mesmo conteúdo sobre os três tons. O card, os chips e o texto não
            mudam — só o fundo. Repare como o contraste com o card cresce do A para
            o C.
          </p>
          <div className="grid gap-4 lg:grid-cols-3">
            {begesCandidatos.map((bege) => (
              <div
                key={bege.hex}
                className="flex flex-col gap-3 rounded-lg border border-border p-4"
                style={{ backgroundColor: bege.hex }}
              >
                <p className="text-sm font-bold text-foreground">{bege.rotulo}</p>
                <p className="font-mono text-xs text-foreground/70">{bege.hex}</p>
                <div className="rounded-lg bg-card p-3">
                  <p className="text-sm font-semibold text-foreground">
                    Mesa digitalizadora
                  </p>
                  <p className="text-sm font-medium text-foreground">R$ 150,00</p>
                  <p className="text-xs text-primary">Uberlândia, MG</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <span className="rounded-pill bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground">
                    Móveis
                  </span>
                  <span className="rounded-pill bg-muted px-3 py-1 text-xs font-semibold text-foreground">
                    Livros
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-bold">Cores</h2>
          <ul className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {cores.map((cor) => (
              <li key={cor.token} className="flex flex-col gap-1.5">
                <span
                  className={`${cor.classe} h-16 w-full rounded-sm border border-border`}
                />
                <span className="text-xs font-semibold">{cor.token}</span>
                <span className="text-xs text-muted-foreground">{cor.hex}</span>
              </li>
            ))}
          </ul>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-bold">Tipografia</h2>
          <p className="font-sans text-[25px] font-bold">
            Montserrat Bold 25px — título e preço
          </p>
          <p className="font-sans text-sm font-medium">Montserrat Medium — rótulos</p>
          <p className="font-sans text-sm italic">Montserrat Italic — ênfase</p>
          <p className="font-mono text-sm">
            Anonymous Pro — o Zeca vai te ajudar nessa...
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-bold">Raios</h2>
          <ul className="flex flex-wrap gap-3">
            {raios.map((raio) => (
              <li
                key={raio.nome}
                className="grid h-20 w-32 place-items-center bg-card text-center text-xs"
                style={{ borderRadius: raio.valor }}
              >
                <span>
                  {raio.nome}
                  <br />
                  {raio.valor}
                </span>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}
