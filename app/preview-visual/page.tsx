import { Heart } from "lucide-react";

import { Navbar } from "@/src/components/layout/navbar";
import { LogoFinds } from "@/src/components/layout/logo-finds";
import { ListingCard } from "@/src/components/listings/listing-card";
import {
  ListingGrid,
  ListingGridSkeleton,
} from "@/src/components/listings/listing-grid";
import { EmptyState, ErrorState } from "@/src/components/ui/states";
import { Button } from "@/src/components/ui/button";
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
  { rotulo: "B · mais claro (aplicado agora)", hex: "#feffe6" },
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
                  <button
                    type="button"
                    aria-label="Favoritar"
                    className="grid size-8 place-items-center rounded-pill bg-background/80 text-foreground"
                  >
                    <Heart className="size-4" aria-hidden />
                  </button>
                }
              />
            ))}
          </ListingGrid>
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
