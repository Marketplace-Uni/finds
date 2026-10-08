import { LogoFinds } from "@/src/components/layout/logo-finds";

/**
 * Painel da marca nas telas de entrar e criar conta. No Figma essas telas têm
 * o logo, "Bem-vindo ao Finds!" e uma ilustração; no desktop isso vira a
 * metade esquerda da tela dividida (docs/DESIGN.md).
 *
 * Ajustes da Lia em 07/10: sem o Zeca, logo em laranja, título em verde-limão
 * e o parágrafo com as quebras de linha que ela diagramou.
 */
export function AuthArt() {
  return (
    <div className="relative hidden flex-col overflow-hidden bg-nav p-12 lg:flex">
      <LogoFinds className="h-10 w-auto text-primary" />

      <div className="relative z-10 flex flex-1 flex-col justify-center gap-3">
        <p className="text-3xl leading-tight font-bold text-secondary">
          Bem-vindo ao Finds!
        </p>
        {/* As quebras são da diagramação que a Lia pediu. O painel só existe a
            partir de lg, então não há risco de quebrar em tela estreita. */}
        <p className="text-sm leading-relaxed text-nav-foreground/80">
          O marketplace de quem é da UFU:
          <br />
          compre, venda, ofereça serviços e ache
          <br />
          com quem dividir moradia —&nbsp;sempre
          <br />
          com outro estudante do outro lado.
        </p>
        <p className="mt-1 font-mono text-xs text-secondary">
          feito por estudantes, para estudantes
        </p>
      </div>

      {/* Formas da identidade ao fundo, nas cores da marca. */}
      <span
        className="absolute -right-16 -bottom-24 size-72 rounded-pill bg-primary/20"
        aria-hidden
      />
      <span
        className="absolute -top-20 -right-10 size-48 rounded-pill bg-secondary/15"
        aria-hidden
      />
    </div>
  );
}
