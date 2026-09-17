import CategoryTabs from "@/components/CategoryTabs";
import ApplicationCard from "@/components/ApplicationCard";
import ApplicationCardCompact from "@/components/ApplicationCardCompact";
import {
  applications,
  getExpertiseApplications,
  getFreeApplications,
  getPaidApplications,
} from "@/data/applications";
import { categories } from "@/data/categories";

export const metadata = {
  title: "Catalogue des applications",
  description:
    "Découvrez les 19 applications de calcul S.E.L. — structures, hydraulique, ouvrages d'art, routes, gestion et matériaux.",
};

type Props = {
  searchParams: Promise<{ cat?: string }>;
};

export default async function ApplicationsPage({ searchParams }: Props) {
  const params = await searchParams;
  const cat = params.cat;

  // Si un filtre est actif, on affiche la vue filtrée simple
  if (cat) {
    const filtered = applications.filter((a) => a.categorySlug === cat);
    const activeCategory = categories.find((c) => c.slug === cat);

    return (
      <>
        <div className="bg-gray-50 border-b border-gray-200 py-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {activeCategory?.icon} {activeCategory?.name}
            </h1>
            <p className="text-gray-600">
              {filtered.length} application{filtered.length > 1 ? "s" : ""}{" "}
              disponible{filtered.length > 1 ? "s" : ""}
            </p>
          </div>
        </div>

        <CategoryTabs activeSlug={cat} />

        <section className="py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {filtered.length === 0 ? (
              <p className="text-center text-gray-500 py-20">
                Aucune application dans cette catégorie.
              </p>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {filtered.map((app) => (
                  <ApplicationCardCompact key={app.id} application={app} />
                ))}
              </div>
            )}
          </div>
        </section>
      </>
    );
  }

  // Vue par défaut : 3 sections compactes
  const expertiseApps = getExpertiseApplications();
  const freeApps = getFreeApplications();
  const paidApps = getPaidApplications();

  return (
    <>
      {/* En-tête */}
      <div className="bg-gray-50 border-b border-gray-200 py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Catalogue des applications
          </h1>
          <p className="text-gray-600">
            {applications.length} applications disponibles
          </p>
        </div>
      </div>

      {/* Onglets catégories */}
      <CategoryTabs activeSlug={cat} />

      {/* ============================================================
          SECTION 1 — OUVRAGES D'ART (EXPERTISE)
      ============================================================ */}
      <section className="py-16 bg-sel-dark text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-10">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-yellow-400 text-sel-dark mb-4">
              <span className="text-xs font-bold uppercase tracking-wide">
                ⭐ Expertise S.E.L.
              </span>
            </div>
            <h2 className="text-3xl font-bold mb-3">
              Ouvrages d'art : notre spécialité
            </h2>
            <p className="text-white/80">
              Les applications les plus avancées de notre catalogue, pour vos
              projets complexes.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {expertiseApps.map((app) => (
              <ApplicationCardCompact
                key={app.id}
                application={app}
                variant="dark"
              />
            ))}
          </div>
        </div>
      </section>

      {/* ============================================================
          SECTION 2 — AUTRES APPLICATIONS (PAYANTES)
      ============================================================ */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-10">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-status-paid/10 mb-3">
              <span className="text-sm font-bold text-status-paid uppercase tracking-wide">
                💰 Payant
              </span>
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-3">
              Autres applications
            </h2>
            <p className="text-gray-600">
              {paidApps.length} applications professionnelles pour vos projets
              d'ingénierie.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {paidApps.map((app) => (
              <ApplicationCardCompact key={app.id} application={app} />
            ))}
          </div>
        </div>
      </section>

      {/* ============================================================
          SECTION 3 — LOGICIELS GRATUITS
      ============================================================ */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-10">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-status-free/10 mb-3">
              <span className="text-sm font-bold text-status-free uppercase tracking-wide">
                🎁 Gratuit
              </span>
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-3">
              Logiciels gratuits
            </h2>
            <p className="text-gray-600">
              {freeApps.length} applications à utiliser librement, sans
              inscription.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {freeApps.map((app) => (
              <ApplicationCardCompact key={app.id} application={app} />
            ))}
          </div>
        </div>
      </section>
    </>
  );
}