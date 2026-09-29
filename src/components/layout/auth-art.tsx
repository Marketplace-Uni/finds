import { LogoFinds } from "@/src/components/layout/logo-finds";

/**
 * Painel da marca nas telas de entrar e criar conta. No Figma essas telas têm
 * o logo, "Bem-vindo ao Finds!" e uma ilustração; no desktop isso vira a
 * metade esquerda da tela dividida (docs/DESIGN.md).
 *
 * A ilustração do Figma é imagem rasterizada e não foi exportada, então o
 * painel usa logo e tipografia. Quando a Lia mandar a arte, ela entra aqui.
 */
export function AuthArt() {
  return (
    <div className="relative hidden flex-col justify-between overflow-hidden bg-nav p-12 lg:flex">
      <LogoFinds className="h-10 w-auto text-primary" />

      <div className="relative z-10 flex flex-col gap-4">
        <p className="text-3xl leading-tight font-bold text-nav-foreground">
          Bem-vindo ao Finds!
        </p>
        <p className="max-w-sm text-sm text-nav-foreground/80">
          O marketplace de quem é da UFU: compre, venda, ofereça serviços e ache
          com quem dividir moradia — sempre com outro estudante do outro lado.
        </p>
      </div>

      <p className="relative z-10 font-mono text-xs text-secondary">
        feito por estudantes, para estudantes
      </p>

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
