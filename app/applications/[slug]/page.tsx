import { notFound } from "next/navigation";
import Link from "next/link";
import { CheckCircle, ArrowLeft, Download, Calendar, Clock } from "lucide-react";
import { getApplicationBySlug, applications } from "@/data/applications";
import { categories } from "@/data/categories";
import { formatPrice } from "@/lib/utils";
import * as Icons from "lucide-react";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  return applications.map((app) => ({ slug: app.slug }));
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const app = getApplicationBySlug(slug);
  if (!app) return { title: "Application introuvable" };
  return {
    title: app.name,
    description: app.shortDescription,
  };
}

export default async function ApplicationDetailPage({ params }: Props) {
  const { slug } = await params;
  const app = getApplicationBySlug(slug);
  if (!app) notFound();

  const category = categories.find((c) => c.slug === app.categorySlug);
  const IconComponent = (Icons as any)[app.icon] || Icons.Box;

  const hasMonthly = !!app.priceMonthly;
  const hasAnnual = !!app.priceAnnual;
  const hasBoth = hasMonthly && hasAnnual;

  // Déterminer si l'app est exécutable directement
  const isExecutable = app.isFree && !!app.appUrl;

  return (
    <article className="py-12">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <Link
          href="/applications"
          className="inline-flex items-center text-sm text-sel hover:text-sel-dark mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Retour au catalogue
        </Link>

        {/* En-tête */}
        <div className="flex flex-col sm:flex-row items-start gap-6 mb-10">
          <div
            className="w-20 h-20 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: `${category?.color}15` }}
          >
            <IconComponent
              className="w-10 h-10"
              style={{ color: category?.color }}
            />
          </div>
          <div className="flex-grow">
            <div className="flex flex-wrap gap-2 mb-3">
              <span
                className="badge text-white"
                style={{ backgroundColor: category?.color }}
              >
                {category?.icon} {category?.name}
              </span>
              {app.isExpertise && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide bg-yellow-400 text-sel-dark">
                  ⭐ Expertise S.E.L.
                </span>
              )}
              {app.isFree && <span className="badge-free">Gratuit</span>}
              {app.isPopular && <span className="badge-hot">Populaire</span>}
              {app.isNew && <span className="badge-new">Nouveau</span>}
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">
              {app.name}
            </h1>
            <p className="text-lg text-gray-600">{app.shortDescription}</p>
          </div>
        </div>

        {/* Contenu principal */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Colonne gauche : description */}
          <div className="lg:col-span-2 space-y-8">
            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                Description
              </h2>
              <p className="text-gray-700 leading-relaxed">
                {app.longDescription}
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                Points clés
              </h2>
              <ul className="space-y-3">
                {app.tags.map((tag) => (
                  <li key={tag} className="flex items-start space-x-3">
                    <CheckCircle className="w-5 h-5 text-status-free flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">{tag}</span>
                  </li>
                ))}
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                Public cible
              </h2>
              <p className="text-gray-700">
                Ingénieurs civils, bureaux d'études, techniciens BTP,
                étudiants en génie civil, collectivités.
              </p>
            </section>
          </div>

          {/* Colonne droite : panneau tarifaire / action */}
          <aside className="lg:col-span-1">
            <div className="sticky top-24 card">
              <div className="text-center mb-6">
                {app.isFree ? (
                  <>
                    <div className="text-3xl font-bold text-status-free mb-1">
                      Gratuit
                    </div>
                    <div className="text-sm text-gray-500">0 XAF</div>
                  </>
                ) : hasBoth ? (
                  <>
                    <div className="text-xs uppercase tracking-wide text-gray-500 mb-4">
                      Choisissez votre formule
                    </div>

                    <div className="mb-4 pb-4 border-b border-gray-100">
                      <div className="text-sm font-semibold text-gray-700 mb-1">
                        Mensuel
                      </div>
                      <div className="text-2xl font-bold text-sel">
                        {formatPrice(app.priceMonthly!)}
                        <span className="text-base font-normal text-gray-500">
                          {" "}
                          / mois
                        </span>
                      </div>
                    </div>

                    <div>
                      <div className="text-sm font-semibold text-gray-700 mb-1">
                        Annuel
                      </div>
                      <div className="text-2xl font-bold text-sel">
                        {formatPrice(app.priceAnnual!)}
                        <span className="text-base font-normal text-gray-500">
                          {" "}
                          / an
                        </span>
                      </div>
                    </div>
                  </>
                ) : hasAnnual ? (
                  <>
                    <div className="text-xs uppercase tracking-wide text-gray-500 mb-1">
                      Abonnement annuel
                    </div>
                    <div className="text-2xl font-bold text-sel">
                      {formatPrice(app.priceAnnual!)}
                    </div>
                    <div className="text-sm text-gray-500">par an</div>
                  </>
                ) : hasMonthly ? (
                  <>
                    <div className="text-xs uppercase tracking-wide text-gray-500 mb-1">
                      Abonnement mensuel
                    </div>
                    <div className="text-2xl font-bold text-sel">
                      {formatPrice(app.priceMonthly!)}
                    </div>
                    <div className="text-sm text-gray-500">par mois</div>
                  </>
                ) : null}
              </div>

              {/* Boutons d'action */}
              <div className="space-y-3">
                {app.isFree ? (
                  isExecutable ? (
                    // App gratuite ET exécutable → lien vers l'app
                    <Link
                      href={app.appUrl!}
                      className="btn-primary w-full"
                    >
                      <Download className="w-5 h-5 mr-2" />
                      Ouvrir l'application
                    </Link>
                  ) : (
                    // App gratuite mais pas encore exécutable
                    <button
                      className="btn-primary w-full opacity-60 cursor-not-allowed flex items-center justify-center"
                      disabled
                    >
                      <Clock className="w-5 h-5 mr-2" />
                      Application bientôt disponible
                    </button>
                  )
                ) : (
                  // App payante
                  <>
                    <button className="btn-primary w-full">
                      S'abonner maintenant
                    </button>
                    <Link
                      href="/contact"
                      className="btn-secondary w-full"
                    >
                      <Calendar className="w-5 h-5 mr-2" />
                      Demander une démo
                    </Link>
                  </>
                )}
              </div>

              {/* Garanties */}
              <div className="mt-6 pt-6 border-t border-gray-100 text-xs text-gray-500 space-y-2">
                <p>✅ Paiement sécurisé (Mobile Money, CB)</p>
                <p>✅ Support en français</p>
                <p>✅ Mises à jour incluses</p>
                {!app.isFree && <p>✅ Résiliable à tout moment</p>}
              </div>
            </div>
          </aside>
        </div>
      </div>
    </article>
  );
}