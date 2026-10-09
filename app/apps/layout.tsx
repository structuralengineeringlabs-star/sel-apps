import Link from "next/link";
import { ArrowLeft } from "lucide-react";

// Pages d'application : l'en-tête et le pied de page viennent de app/layout.tsx ;
// ce gabarit n'ajoute que le lien de retour, pour laisser la hauteur à l'application.
export default function AppsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="bg-gray-50 py-4">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-3">
        <Link
          href="/applications"
          className="inline-flex items-center gap-2 text-sm font-semibold text-gray-700 hover:text-sel transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Retour au catalogue
        </Link>
        {children}
      </div>
    </div>
  );
}
