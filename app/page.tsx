import Hero from "@/components/Hero";
import ExpertiseApps from "@/components/ExpertiseApps";
import CategoryTabs from "@/components/CategoryTabs";
import ApplicationCard from "@/components/ApplicationCard";
import CTA from "@/components/CTA";
import { getFreeApplications, getPaidApplications } from "@/data/applications";
import Link from "next/link";

export default function HomePage() {
  const freeApps = getFreeApplications();
  const paidApps = getPaidApplications();

  return (
    <>
      {/* ============================================================
          1. HERO
      ============================================================ */}
      <Hero />

      {/* ============================================================
          2. APPLICATIONS PHARES — Ponts & Dalots
      ============================================================ */}
      <ExpertiseApps />

      {/* ============================================================
          3. ONGLETS CATÉGORIES
      ============================================================ */}
      <CategoryTabs />

      {/* ============================================================
          4. APPLICATIONS GRATUITES
      ============================================================ */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* En-tête */}
          <div className="mb-10">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-status-free/10 mb-3">
              <span className="text-sm font-bold text-status-free uppercase tracking-wide">
                🎁 Gratuit
              </span>
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-3">
              Applications gratuites
            </h2>
            <p className="text-gray-600">
              {freeApps.length} applications à utiliser librement, sans
              inscription.
            </p>
          </div>

          {/* Grille */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {freeApps.map((app) => (
              <ApplicationCard key={app.id} application={app} />
            ))}
          </div>
        </div>
      </section>

      {/* ============================================================
          5. APPLICATIONS PROFESSIONNELLES (PAYANTES)
      ============================================================ */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* En-tête */}
          <div className="mb-10">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-status-paid/10 mb-3">
              <span className="text-sm font-bold text-status-paid uppercase tracking-wide">
                💰 Payant
              </span>
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-3">
              Applications professionnelles
            </h2>
            <p className="text-gray-600">
              {paidApps.length} applications avancées pour vos projets
              d'ingénierie.
            </p>
          </div>

          {/* Grille */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {paidApps.map((app) => (
              <ApplicationCard key={app.id} application={app} />
            ))}
          </div>

          {/* Lien catalogue */}
          <div className="text-center mt-10">
            <Link href="/applications" className="btn-primary">
              Voir le catalogue complet
            </Link>
          </div>
        </div>
      </section>

      {/* ============================================================
          6. CTA FINAL
      ============================================================ */}
      <CTA />
    </>
  );
}