import { Navbar } from "@/src/components/layout/navbar";

/**
 * Página de apoio do Caike: mostra a navbar nos dois estados e a paleta,
 * para validar o visual com a Lia pelo link de preview da Vercel.
 * Não faz parte do produto — pode sair quando o feed estiver de pé.
 */
export const metadata = { title: "Finds · padrão visual" };

const cores = [
  { token: "background", classe: "bg-background", hex: "#feffd5" },
  { token: "primary", classe: "bg-primary", hex: "#f3421a" },
  { token: "secondary", classe: "bg-secondary", hex: "#cfdd4a" },
  { token: "foreground / nav", classe: "bg-nav", hex: "#2b201a" },
  { token: "card / muted", classe: "bg-card", hex: "#eff0c3" },
  { token: "accent / border", classe: "bg-accent", hex: "#e68c72" },
  { token: "muted-foreground", classe: "bg-muted-foreground", hex: "#bfc085" },
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
