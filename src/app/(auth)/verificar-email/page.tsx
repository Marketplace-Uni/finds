import Link from "next/link";

export default function VerificarEmailPage() {
  return (
    <div className="flex flex-col items-center gap-4 text-center">
      <h1 className="text-xl font-semibold text-foreground">Confira sua caixa de entrada</h1>
      <p className="text-sm text-muted-foreground">
        Enviamos um link de confirmação para o seu e-mail @ufu.br. Clique nele para ativar sua
        conta e continuar.
      </p>
      <Link href="/entrar" className="text-sm font-semibold text-primary">
        Voltar para o login
      </Link>
    </div>
  );
}
