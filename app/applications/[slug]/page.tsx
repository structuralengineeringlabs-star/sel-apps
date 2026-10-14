import { notFound } from "next/navigation";
import Link from "next/link";
import { CheckCircle, ArrowLeft, Download, Calendar, Clock } from "lucide-react";
import { getApplicationBySlug, applications } from "@/data/applications";
import { categories } from "@/data/categories";
import { formatPrice } from "@/lib/utils";
import { offre, tarifEssai, PAYS } from "@/lib/offres";
import * as Icons from "lucide-react";

// Description de 160 caractères au plus, coupée sur un mot
function resumer(long: string, court: string): string {
  const texte = long.length > court.length ? long : court;
  if (texte.length <= 160) return texte;
  const coupe = texte.slice(0, 157);
  return coupe.slice(0, coupe.lastIndexOf(" ")).replace(/[ ,;:(]+$/, "") + "…";
}

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
    description: resumer(app.longDescription, app.shortDescription),
    alternates: { canonical: `/applications/${app.slug}` },
  };
}

export default async function ApplicationDetailPage({ params }: Props) {
  const { slug } = await params;
  const app = getApplicationBySlug(slug);
  if (!app) notFound();

  const category = categories.find((c) => c.slug === app.categorySlug);
  const IconComponent = (Icons as unknown as Record<string, Icons.LucideIcon>)[app.icon] || Icons.Box;

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
                Ingénieurs civils, bureaux d&apos;études, techniciens BTP,
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
                      Ouvrir l&apos;application
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
                ) : app.paiementEnLigne ? (
                  // App payante, abonnement en ligne (Notch Pay ou CinetPay) ; démonstration libre
                  <>
                    {tarifEssai() !== null && (
                      <p className="rounded-md border border-amber-300 bg-amber-50 px-3 py-2 text-xs text-amber-900">
                        Tarif d&apos;essai temporaire : {formatPrice(tarifEssai()!)} quelle que soit la formule.
                      </p>
                    )}
                    <form id="souscrire" action="/api/paiement/initier" method="post" className="space-y-3 text-sm">
                      <input type="hidden" name="application" value={app.slug} />
                      <fieldset className="space-y-2">
                        <legend className="font-semibold text-gray-700 mb-1">Formule</legend>
                        {(["annuel", "mensuel"] as const).filter(f => offre(app.slug, f)).map(f => (
                          <label key={f} className="flex items-center gap-2 rounded-md border border-gray-200 px-3 py-2 cursor-pointer has-[:checked]:border-sel has-[:checked]:bg-sel/5">
                            <input type="radio" name="formule" value={f} defaultChecked={f === "annuel"} required />
                            <span className="flex-1">{f === "annuel" ? "1 an (365 jours)" : "1 mois (30 jours)"}</span>
                            <strong>{formatPrice(offre(app.slug, f)!.montant, "F CFA")}</strong>
                          </label>
                        ))}
                      </fieldset>
                      <label className="block">
                        <span className="font-semibold text-gray-700">Pays de paiement</span>
                        <select name="pays" defaultValue="CM" className="mt-1 w-full h-10 rounded-md border border-gray-300 px-2">
                          {(Object.keys(PAYS) as (keyof typeof PAYS)[]).map(k => (
                            <option key={k} value={k}>{PAYS[k].nom} — {PAYS[k].devise}</option>
                          ))}
                        </select>
                        <span className="mt-1 block text-xs text-gray-500">Cameroun : MTN, Orange Money · Côte d&apos;Ivoire : MTN, Orange Money, Wave · Sénégal : Wave, Orange Money, Free Money</span>
                      </label>
                      <label className="flex items-start gap-2 text-xs text-gray-600">
                        <input type="checkbox" name="cgv" value="oui" required className="mt-0.5" />
                        <span>J&apos;accepte les <Link href="/cgv" className="underline">conditions générales de vente</Link>. L&apos;accès étant ouvert dès le paiement, <strong>aucun remboursement</strong> n&apos;est possible ; la démonstration permet d&apos;essayer avant d&apos;acheter.</span>
                      </label>
                      <button type="submit" className="btn-primary w-full">Payer et accéder à l&apos;application</button>
                    </form>
                    {app.appUrl && (
                      <Link href={app.appUrl} className="btn-secondary w-full">
                        Essayer la démonstration
                      </Link>
                    )}
                  </>
                ) : (
                  // App payante
                  <>
                    <Link
                      href={`/contact?app=${app.slug}`}
                      className="btn-primary w-full"
                    >
                      Demander l&apos;accès
                    </Link>
                    <Link
                      href={`/contact?app=${app.slug}`}
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
                <p>
                  {app.isFree
                    ? "✅ Utilisation libre, sans inscription"
                    : app.paiementEnLigne
                      ? "✅ Paiement sécurisé par Mobile Money (Cameroun, Côte d'Ivoire, Sénégal), prix TTC, accès immédiat, sans reconduction automatique, sans remboursement"
                      : "✅ Accès ouvert sur demande"}
                </p>
                <p>✅ Support en français</p>
                <p>✅ Mises à jour incluses</p>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </article>
  );
}