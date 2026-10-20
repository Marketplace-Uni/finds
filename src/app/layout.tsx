import type { Metadata } from "next";
import { Montserrat, Anonymous_Pro } from "next/font/google";
import "./globals.css";
import "@/src/lib/polyfills";
import { Toaster } from "@/src/components/ui/sonner";

// A Lia usa a família completa da Montserrat (thin a bold, com itálicos).
// Como é fonte variável, um único arquivo por estilo cobre todos os pesos.
const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
  style: ["normal", "italic"],
});

const anonymousPro = Anonymous_Pro({
  variable: "--font-anonymous-pro",
  subsets: ["latin"],
  weight: ["400", "700"],
});

export const metadata: Metadata = {
  title: "Finds",
  description:
    "O marketplace da UFU: produtos, serviços, roommates e repúblicas entre estudantes.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="pt-BR"
      className={`${montserrat.variable} ${anonymousPro.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {children}
        <Toaster />
      </body>
    </html>
  );
}
