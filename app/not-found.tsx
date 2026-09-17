import Link from "next/link";
import { Home, Search } from "lucide-react";

export default function NotFound() {
  return (
    <div className="py-24">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="text-8xl font-bold text-sel mb-4">404</div>
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Page introuvable
        </h1>
        <p className="text-gray-600 mb-8">
          La page que vous recherchez n'existe pas ou a été déplacée.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/" className="btn-primary">
            <Home className="w-5 h-5 mr-2" />
            Retour à l'accueil
          </Link>
          <Link href="/applications" className="btn-secondary">
            <Search className="w-5 h-5 mr-2" />
            Voir les applications
          </Link>
        </div>
      </div>
    </div>
  );
}