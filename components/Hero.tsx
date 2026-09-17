import Link from "next/link";
import { CheckCircle, PlayCircle, Calendar } from "lucide-react";
import { applications, getFreeApplications } from "@/data/applications";

export default function Hero() {
  const totalApps = applications.length;
  const freeApps = getFreeApplications().length;

  return (
    <section className="bg-gradient-to-br from-sel to-sel-dark text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
        <div className="max-w-3xl">
          {/* Titre principal */}
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6 leading-tight">
            Calculez, dimensionnez, gérez.
          </h1>

          {/* Sous-titre */}
          <p className="text-lg sm:text-xl text-white/90 mb-8">
            {totalApps} applications de calcul de structures, d'hydraulique et
            de gestion d'ouvrages, conformes aux Eurocodes.
          </p>

          {/* Boutons CTA */}
          <div className="flex flex-col sm:flex-row gap-4 mb-10">
            <Link
              href="/applications"
              className="inline-flex items-center justify-center px-6 py-3 rounded-lg bg-white text-sel font-semibold hover:bg-gray-100 transition-colors"
            >
              <PlayCircle className="w-5 h-5 mr-2" />
              Découvrir les applications
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center justify-center px-6 py-3 rounded-lg border-2 border-white text-white font-semibold hover:bg-white/10 transition-colors"
            >
              <Calendar className="w-5 h-5 mr-2" />
              Demander une démo
            </Link>
          </div>

          {/* Points clés */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-5 h-5 text-green-300 flex-shrink-0" />
              <span>{freeApps} applications gratuites</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-5 h-5 text-green-300 flex-shrink-0" />
              <span>Conforme EC2 / EC3 / EC5</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-5 h-5 text-green-300 flex-shrink-0" />
              <span>Support en français</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-5 h-5 text-green-300 flex-shrink-0" />
              <span>Basé au Cameroun</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}