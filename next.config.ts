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
};

export default nextConfig;