import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Só vale no `npm run dev` (nunca em produção/Vercel). Sem isso, o Next
  // bloqueia com 403 qualquer requisição de origem diferente de localhost
  // pro servidor de desenvolvimento — inclusive os chunks de JS que
  // hidratam a página. Testar o app pelo celular na mesma rede Wi-Fi via
  // `http://<ip-da-máquina>:3000` (a URL "Network:" que o `next dev`
  // imprime) batia nesse bloqueio: a página HTML carregava normalmente,
  // mas o React nunca hidratava — por isso o formulário de `/entrar`
  // parecia simplesmente não responder ao toque.
  allowedDevOrigins: ["192.168.*.*", "10.*.*.*", "172.*.*.*"],

  // `<Image>` (listing-card.tsx, listing-gallery.tsx) recebe a URL pública
  // do Supabase Storage (`getPublicUrl()`, um host externo) — sem liberar
  // esse host aqui, o otimizador de imagem do Next recusa toda requisição
  // com 400 INVALID_IMAGE_OPTIMIZE_REQUEST (reproduzido em produção: nenhuma
  // foto de anúncio carrega). `*.supabase.co` cobre os dois projetos
  // (`finds-dev` e `finds-demo` têm refs diferentes, mesmo domínio-base); o
  // `pathname` restringe ao caminho de bucket público, não libera o host
  // inteiro à toa.
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
};

export default nextConfig;