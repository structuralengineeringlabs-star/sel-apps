import Link from "next/link";
import { CheckCircle } from "lucide-react";
import { getPaidApplications } from "@/data/applications";
import { categories } from "@/data/categories";
import { formatPrice } from "@/lib/utils";

export const metadata = {
  title: "Tarifs",
  description: "Découvrez les tarifs d'abonnement des applications S.E.L.",
};

export default function TarifsPage() {
  const paidApps = getPaidApplications();

  const plans = [
    {
      name: "Gratuit",
      price: "0 XAF",
      description: "9 applications gratuites, sans inscription",
      features: [
        "9 applications gratuites",
        "Accès immédiat",
        "Sans inscription",
        "Mises à jour incluses",
        "Support communautaire",
      ],
      cta: "Voir les applications gratuites",
      href: "/applications",
      featured: false,
    },
    {
      name: "Mensuel",
      price: "Dès 5 000 XAF",
      period: "par mois",
      description: "Abonnement mensuel flexible, résiliable à tout moment",
      features: [
        "Accès immédiat",
        "Résiliable à tout moment",
        "Mobile Money ou CB",
        "Support par email",
        "Mises à jour incluses",
      ],
      cta: "Voir le catalogue",
      href: "/applications",
      featured: false,
    },
    {
      name: "Annuel",
      price: "Dès 25 000 XAF",
      period: "par an",
      description: "Économisez jusqu'à 33% par rapport au mensuel",
      features: [
        "Économie jusqu'à 33%",
        "Accès illimité 12 mois",
        "Support prioritaire",
        "Mises à jour premium",
        "Formation incluse",
      ],
      cta: "Voir le catalogue",
      href: "/applications",
      featured: true,
    },
  ];

  return (
    <div className="py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* En-tête */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Tarifs simples et transparents
          </h1>
          <p className="text-lg text-gray-600">
            Choisissez la formule adaptée à vos besoins
          </p>
        </div>

        {/* 3 formules */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`card relative ${plan.featured ? "ring-2 ring-sel" : ""}`}
            >
              {plan.featured && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="badge bg-sel text-white">Recommandé</span>
                </div>
              )}
              <h2 className="text-xl font-bold text-gray-900 mb-2">
                {plan.name}
              </h2>
              <div className="mb-4">
                <span className="text-2xl font-bold text-sel">{plan.price}</span>
                {plan.period && (
                  <span className="text-sm text-gray-500 ml-1">/ {plan.period}</span>
                )}
              </div>
              <p className="text-sm text-gray-600 mb-6">{plan.description}</p>
              <ul className="space-y-3 mb-8">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start space-x-2 text-sm">
                    <CheckCircle className="w-5 h-5 text-status-free flex-shrink-0" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
              <Link href={plan.href} className="btn-primary w-full">
                {plan.cta}
              </Link>
            </div>
          ))}
        </div>

        {/* Tableau comparatif */}
        <div className="mb-16">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">
              Tarifs détaillés par application
            </h2>
            <p className="text-gray-600">
              {paidApps.length} applications disponibles en abonnement mensuel
              et/ou annuel.
            </p>
          </div>

          <div className="overflow-x-auto rounded-xl border border-gray-200">
            <table className="w-full bg-white">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-6 py-4 text-sm font-bold text-gray-900 uppercase tracking-wide">
                    Application
                  </th>
                  <th className="text-left px-6 py-4 text-sm font-bold text-gray-900 uppercase tracking-wide">
                    Catégorie
                  </th>
                  <th className="text-right px-6 py-4 text-sm font-bold text-gray-900 uppercase tracking-wide">
                    Mensuel
                  </th>
                  <th className="text-right px-6 py-4 text-sm font-bold text-gray-900 uppercase tracking-wide">
                    Annuel
                  </th>
                  <th className="text-right px-6 py-4 text-sm font-bold text-gray-900 uppercase tracking-wide">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody>
                {paidApps.map((app) => {
                  const category = categories.find(
                    (c) => c.slug === app.categorySlug
                  );
                  return (
                    <tr
                      key={app.id}
                      className="border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-2 h-2 rounded-full flex-shrink-0"
                            style={{ backgroundColor: category?.color }}
                          />
                          <div>
                            <div className="text-sm font-semibold text-gray-900">
                              {app.name}
                            </div>
                            {app.isExpertise && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide bg-yellow-400 text-sel-dark mt-1">
                                ⭐ Expertise
                              </span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-xs text-gray-500">
                          {category?.icon} {category?.name}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        {app.priceMonthly ? (
                          <span className="text-sm font-bold text-sel">
                            {formatPrice(app.priceMonthly)}
                            <span className="text-xs font-normal text-gray-500">/mois</span>
                          </span>
                        ) : (
                          <span className="text-sm text-gray-400">—</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        {app.priceAnnual ? (
                          <span className="text-sm font-bold text-sel">
                            {formatPrice(app.priceAnnual)}
                            <span className="text-xs font-normal text-gray-500">/an</span>
                          </span>
                        ) : (
                          <span className="text-sm text-gray-400">—</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Link
                          href={`/applications/${app.slug}`}
                          className="inline-flex items-center text-sm font-semibold text-sel hover:text-sel-dark"
                        >
                          Voir →
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* FAQ */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            Questions fréquentes
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {[
              {
                q: "Puis-je acheter une seule application ?",
                a: "Oui, chaque application est disponible en abonnement individuel, mensuel ou annuel.",
              },
              {
                q: "Quelle est la différence entre mensuel et annuel ?",
                a: "L'abonnement mensuel est plus flexible (résiliable à tout moment). L'annuel offre une économie pouvant atteindre 33%.",
              },
              {
                q: "Puis-je changer d'offre en cours d'abonnement ?",
                a: "Oui, vous pouvez passer du mensuel à l'annuel à tout moment.",
              },
              {
                q: "Quels moyens de paiement acceptez-vous ?",
                a: "MTN Mobile Money, Orange Money, cartes bancaires (Visa/Mastercard) et virement bancaire.",
              },
            ].map((item) => (
              <div key={item.q} className="card">
                <h3 className="font-bold text-gray-900 mb-2">{item.q}</h3>
                <p className="text-sm text-gray-600">{item.a}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA final */}
        <div className="text-center card bg-sel-light max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-sel-dark mb-2">
            Besoin d'une solution sur mesure ?
          </h2>
          <p className="text-gray-700 mb-6">
            Pour les entreprises, ONG et administrations : tarifs préférentiels
            et formations disponibles.
          </p>
          <Link href="/contact" className="btn-primary">
            Demander un devis
          </Link>
        </div>
      </div>
    </div>
  );
}