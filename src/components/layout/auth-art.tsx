import { LogoFinds } from "@/src/components/layout/logo-finds";
import { Zeca } from "@/src/components/ui/zeca";

/**
 * Painel da marca nas telas de entrar e criar conta. No Figma essas telas têm
 * o logo, "Bem-vindo ao Finds!" e uma ilustração; no desktop isso vira a
 * metade esquerda da tela dividida (docs/DESIGN.md).
 *
 * Ajustes pedidos pela Lia em 01/10: logo em creme (o laranja não contrastava
 * no marrom), blocos agrupados em vez de espalhados, e a assinatura logo
 * abaixo do texto.
 *
 * A ilustração do Figma é imagem rasterizada e não foi exportada, então o
 * painel usa logo e tipografia. Quando ela mandar a arte, ela entra aqui.
 */
export function AuthArt() {
  return (
    <div className="relative hidden flex-col overflow-hidden bg-nav p-12 lg:flex">
      <LogoFinds className="h-10 w-auto text-nav-foreground" />

      <div className="relative z-10 flex flex-1 flex-col justify-center gap-3">
        <p className="text-3xl leading-tight font-bold text-nav-foreground">
          Bem-vindo ao Finds!
        </p>
        <p className="max-w-sm text-sm leading-relaxed text-nav-foreground/80">
          O marketplace de quem é da UFU: compre, venda, ofereça serviços e ache com
          quem dividir moradia —&nbsp;sempre com outro estudante do outro lado.
        </p>
        <p className="mt-1 font-mono text-xs text-secondary">
          feito por estudantes, para estudantes
        </p>
      </div>

      {/* O Zeca é a ilustração que faltava aqui: pose 1, feliz, para dar
          boas-vindas a quem está entrando. */}
      <Zeca
        pose={1}
        className="pointer-events-none absolute right-8 -bottom-6 h-72 w-auto text-primary/80"
      />

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
