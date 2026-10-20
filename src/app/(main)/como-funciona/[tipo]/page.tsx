import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

import { Button } from "@/src/components/ui/button";
import { Zeca } from "@/src/components/ui/zeca";
import { TIPOS_ANUNCIO, CLASSES_POR_TOKEN } from "@/src/components/listings/tipos-anuncio";

const PASSOS_POR_SLUG: Record<string, string[]> = {
  produto: [
    "Tire fotos e descreva o produto: estado de conservação, categoria e preço.",
    "Publique o anúncio — fica visível pra todo mundo da sua universidade.",
    "Combine pelo chat com quem se interessar e entregue na própria universidade.",
  ],
  servico: [
    "Descreva o serviço que você oferece (ou o que está procurando).",
    "Defina o preço, a modalidade (presencial, online ou flexível) e publique.",
    "Combine os detalhes pelo chat direto com quem contratar ou com quem presta o serviço.",
  ],
  roommate: [
    "Conte como você é e o que procura num colega de moradia em /configuracoes/convivencia.",
    "Publique sua vaga ou sua procura — bairro, tipo de moradia e data de entrada.",
    "O Finds ordena os anúncios pela compatibilidade com o que você marcou, com o percentual em destaque.",
  ],
  republica: [
    "Anuncie as vagas disponíveis: bairro, gênero e comodidades (Wi-Fi, mobiliada, etc.).",
    "Quem se interessar entra em contato pelo chat.",
    "Combine a visita e feche a vaga diretamente com os moradores.",
  ],
};

export function generateStaticParams() {
  return TIPOS_ANUNCIO.map((tipo) => ({ tipo: tipo.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ tipo: string }>;
}): Promise<Metadata> {
  const { tipo: slug } = await params;
  const tipo = TIPOS_ANUNCIO.find((item) => item.slug === slug);
  return { title: tipo ? `${tipo.titulo} — Finds` : "Finds" };
}

export default async function ComoFuncionaPage({
  params,
}: {
  params: Promise<{ tipo: string }>;
}) {
  const { tipo: slug } = await params;
  const tipo = TIPOS_ANUNCIO.find((item) => item.slug === slug);
  const passos = PASSOS_POR_SLUG[slug];

  if (!tipo || !passos) notFound();

  const { titulo, texto, Icone, token } = tipo;

  return (
    <div className="mx-auto flex max-w-2xl flex-col items-center gap-8 py-10 text-center">
      <span className={`grid size-16 place-items-center rounded-pill ${CLASSES_POR_TOKEN[token]}`}>
        <Icone className="size-8" aria-hidden />
      </span>

      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold text-foreground">{titulo} no Finds</h1>
        <p className="text-muted-foreground">{texto}</p>
      </div>

      <ol className="flex w-full flex-col gap-4 text-left">
        {passos.map((passo, index) => (
          <li key={passo} className="flex gap-4 rounded-lg bg-card p-4">
            <span className="grid size-8 shrink-0 place-items-center rounded-pill bg-primary text-sm font-bold text-primary-foreground">
              {index + 1}
            </span>
            <p className="text-sm text-foreground/90">{passo}</p>
          </li>
        ))}
      </ol>

      <Zeca pose={7} className="h-32 w-auto text-primary" />

      <div className="flex flex-wrap justify-center gap-3">
        <Button asChild className="rounded-pill px-8 py-6 text-base font-bold">
          <Link href={`/anunciar/${tipo.slug}`}>Anunciar {tipo.tituloSingular.toLowerCase()}</Link>
        </Button>
        <Button asChild variant="outline" className="rounded-pill px-8 py-6 text-base font-bold">
          <Link href={`/busca?tipo=${tipo.slug}`}>Ver anúncios</Link>
        </Button>
      </div>
    </div>
  );
}
