import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const jetbrains = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono" });

export const metadata: Metadata = {
  title: {
    default: "S.E.L. Applications — Calcul de structures, hydraulique et gestion",
    template: "%s | S.E.L. Applications",
  },
  description:
    "19 applications de calcul de structures, d'hydraulique et de gestion d'ouvrages. Conformes aux Eurocodes. Développées par S.E.L. à Yaoundé, Cameroun.",
  keywords: [
    "calcul structure", "béton armé", "Eurocode 2", "hydraulique",
    "dalot", "pont", "S.E.L.", "Cameroun", "Yaoundé", "ingénierie civile",
  ],
  authors: [{ name: "S.E.L. — Structural & Engineering Labs" }],
  openGraph: {
    title: "S.E.L. Applications",
    description: "19 applications de calcul pour ingénieurs civils",
    locale: "fr_FR",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" className={`${inter.variable} ${jetbrains.variable}`}>
      <body suppressHydrationWarning>
        <Header />
        <main className="min-h-screen">{children}</main>
        <Footer />
      </body>
    </html>
  );
}