import Link from "next/link";
import { Download, Calendar } from "lucide-react";

export default function CTA() {
  return (
    <section className="py-16 bg-gradient-to-br from-sel to-sel-dark text-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-3xl font-bold mb-4">
          Prêt à équiper votre bureau d'études ?
        </h2>
        <p className="text-lg text-white/90 mb-8">
          Découvrez nos applications ou demandez une démonstration personnalisée.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/contact"
            className="inline-flex items-center justify-center px-6 py-3 rounded-lg bg-white text-sel font-semibold hover:bg-gray-100"
          >
            <Download className="w-5 h-5 mr-2" />
            Télécharger la brochure
          </Link>
          <Link
            href="/contact"
            className="inline-flex items-center justify-center px-6 py-3 rounded-lg border-2 border-white text-white font-semibold hover:bg-white/10"
          >
            <Calendar className="w-5 h-5 mr-2" />
            Demander une démo
          </Link>
        </div>
      </div>
    </section>
  );
}