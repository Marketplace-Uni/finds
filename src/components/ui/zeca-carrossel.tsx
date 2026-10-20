import { Zeca, type ZecaPose } from "@/src/components/ui/zeca";
import { cn } from "@/src/lib/utils";

type ZecaCarrosselProps = {
  /** Poses mostradas em sequência, uma de cada vez. */
  poses: ZecaPose[];
  /** Duração de um ciclo completo (todas as poses, uma vez cada). */
  duracaoS?: number;
  /**
   * Tamanho fixo do contêiner (precisa ter altura e largura definidas, ex.
   * `"h-72 w-72"`): as poses têm proporções diferentes entre si (a pose 4 é
   * a única horizontal), então cada uma centraliza dentro desta caixa em vez
   * de ditar o tamanho dela.
   */
  boxClassName: string;
  /** Tamanho/cor de cada Zeca dentro da caixa (herdado via `currentColor`). */
  zecaClassName?: string;
};

/**
 * Carrossel do Zeca: as poses se revezam sozinhas, uma de cada vez, com um
 * crossfade suave — só CSS (`@keyframes` + `animation-delay` negativo por
 * pose), sem JavaScript nem `use client`. Extraído da vitrine da landing
 * (`MascoteVitrine`) para ser reaproveitado também no indicador de
 * carregamento (`LoadingState`/`PendingOverlay`).
 *
 * A pose de cada vez some deslizando só a opacidade, perto do limite da sua
 * fatia do ciclo — o fim do fade-out de uma pose cai exatamente onde começa
 * o fade-in da próxima, sem brecha nem sobreposição longa.
 */
export function ZecaCarrossel({
  poses,
  duracaoS = 20,
  boxClassName,
  zecaClassName,
}: ZecaCarrosselProps) {
  const fatia = duracaoS / poses.length;
  // Único por instância (várias podem conviver na mesma página, ex. landing
  // + loading), para as keyframes de uma não vazarem pra outra.
  const nomeAnimacao = `finds-zeca-carrossel-${poses.join("-")}-${duracaoS}`;

  return (
    <div className={cn("relative shrink-0", boxClassName)} aria-hidden>
      <style>{`
        @keyframes ${nomeAnimacao} {
          0%, 100% { opacity: 0; }
          2% { opacity: 1; }
          18% { opacity: 1; }
          20% { opacity: 0; }
        }
      `}</style>
      {poses.map((pose, index) => (
        <div
          key={pose}
          className="absolute inset-0 flex items-center justify-center"
          style={{
            animation: `${nomeAnimacao} ${duracaoS}s ease-in-out infinite`,
            animationDelay: `-${index * fatia}s`,
          }}
        >
          <Zeca pose={pose} className={zecaClassName} />
        </div>
      ))}
    </div>
  );
}
