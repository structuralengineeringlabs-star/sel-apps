import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import Logo from "@/components/Logo";
import Footer from "@/components/Footer";

export default function AppsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {/* Header réduit */}
      <header className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Bouton retour */}
            <Link
              href="/applications"
              className="inline-flex items-center gap-2 text-sm font-semibold text-gray-700 hover:text-sel transition-colors group"
            >
              <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
              Retour au catalogue
            </Link>

            {/* Logo S.E.L. */}
            <Logo variant="dark" size="sm" showText={true} />
          </div>
        </div>
      </header>

      {/* Contenu de l'application */}
      <main className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {children}
        </div>
      </main>

      {/* Footer complet du site */}
      <Footer />
    </>
  );
}