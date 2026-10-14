import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Inteligência Automotiva Brasil",
    template: "%s · Inteligência Automotiva Brasil",
  },
  description:
    "Plataforma de inteligência de mercado automotivo brasileiro: lançamentos, multimídia, lâmpadas, palhetas, códigos OEM, vendas e oportunidades de inovação.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <div className="flex min-h-screen">
            <Sidebar className="hidden md:flex" />
            <div className="flex min-h-screen flex-1 flex-col">
              <Header />
              <main className="flex-1 px-4 py-6 md:px-8 md:py-8">
                <div className="mx-auto w-full max-w-7xl">{children}</div>
              </main>
              <footer className="border-t px-4 py-4 text-center text-xs text-muted-foreground md:px-8">
                Plataforma interna · dados técnicos e comerciais com rastreabilidade de fontes · versão 0.1
              </footer>
            </div>
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
