import Link from "next/link";
import { ArrowRight, CheckCircle, Award, Sparkles } from "lucide-react";
import { getExpertiseApplications } from "@/data/applications";
import { formatPrice } from "@/lib/utils";

export default function ExpertiseApps() {
  const expertiseApps = getExpertiseApplications();

  return (
    <section className="bg-sel-dark text-white py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* En-tête */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center space-x-2 px-4 py-2 rounded-full bg-white/10 mb-6">
            <Award className="w-4 h-4 text-yellow-300" />
            <span className="text-sm font-semibold uppercase tracking-wide">
              Notre spécialité
            </span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
            Ouvrages d'art : notre spécialité
          </h2>
          <p className="text-lg text-white/80 max-w-2xl mx-auto">
            Maîtrisez vos projets complexes grâce à nos applications de
            dimensionnement avancées, conformes aux Eurocodes.
          </p>
        </div>

        {/* Cartes */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {expertiseApps.map((app) => {
            // Prix d'affichage
            let price = "Sur devis";
            if (app.priceMonthly && app.priceAnnual) {
              price = `${formatPrice(app.priceMonthly)}/mois`;
            } else if (app.priceMonthly) {
              price = `${formatPrice(app.priceMonthly)}/mois`;
            } else if (app.priceAnnual) {
              price = `${formatPrice(app.priceAnnual)}/an`;
            }

            return (
              <Link
                key={app.id}
                href={`/applications/${app.slug}`}
                className="group relative bg-white/5 border border-white/10 rounded-2xl p-8 hover:bg-white/10 transition-all duration-300"
              >
                {/* Badge expertise */}
                <div className="absolute -top-3 right-6">
                  <div className="inline-flex items-center space-x-1 px-3 py-1 rounded-full bg-yellow-400 text-sel-dark text-xs font-bold uppercase tracking-wide shadow-lg">
                    <Sparkles className="w-3 h-3" />
                    <span>Expertise S.E.L.</span>
                  </div>
                </div>

                {/* Icône */}
                <div className="w-16 h-16 rounded-xl bg-white/10 flex items-center justify-center mb-6">
                  {app.icon === "Bridge" && (
                    <svg
                      className="w-8 h-8"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M2 20h20" />
                      <path d="M4 16V8a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v8" />
                      <path d="M12 6V4" />
                      <path d="M8 10h8" />
                      <path d="M8 14h8" />
                    </svg>
                  )}
                  {app.icon === "Boxes" && (
                    <svg
                      className="w-8 h-8"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <rect x="2" y="8" width="8" height="12" rx="1" />
                      <rect x="14" y="8" width="8" height="12" rx="1" />
                      <path d="M6 4h12v4H6z" />
                    </svg>
                  )}
                </div>

                {/* Titre + description */}
                <h3 className="text-2xl font-bold mb-3 group-hover:text-yellow-300 transition-colors">
                  {app.name}
                </h3>
                <p className="text-white/80 mb-6 leading-relaxed">
                  {app.shortDescription}
                </p>

                {/* Points clés */}
                <ul className="space-y-2 mb-8">
                  {app.tags.slice(0, 4).map((tag) => (
                    <li
                      key={tag}
                      className="flex items-center space-x-2 text-sm text-white/70"
                    >
                      <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" />
                      <span>{tag}</span>
                    </li>
                  ))}
                </ul>

                {/* Prix + CTA */}
                <div className="flex items-center justify-between pt-6 border-t border-white/10">
                  <div>
                    <div className="text-xs text-white/60 uppercase tracking-wide mb-1">
                      À partir de
                    </div>
                    <div className="text-lg font-bold text-yellow-300">
                      {price}
                    </div>
                  </div>
                  <div className="inline-flex items-center space-x-2 text-white font-semibold group-hover:text-yellow-300 transition-colors">
                    <span>Découvrir</span>
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        {/* Lien catalogue */}
        <div className="text-center mt-12">
          <Link
            href="/applications"
            className="inline-flex items-center space-x-2 px-6 py-3 rounded-lg border-2 border-white/30 text-white font-semibold hover:bg-white/10 transition-colors"
          >
            <span>Voir toutes nos applications</span>
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </div>
    </section>
  );
}