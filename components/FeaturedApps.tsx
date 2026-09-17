import { getFeaturedApplications } from "@/data/applications";
import ApplicationCard from "./ApplicationCard";

export default function FeaturedApps() {
  const featured = getFeaturedApplications();

  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-3">
            ⭐ Applications phares
          </h2>
          <p className="text-gray-600">
            Les applications les plus utilisées par nos clients
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {featured.map((app) => (
            <ApplicationCard key={app.id} application={app} />
          ))}
        </div>

        <div className="text-center mt-10">
          <a
            href="/applications"
            className="btn-primary"
          >
            Voir les 21 applications
          </a>
        </div>
      </div>
    </section>
  );
}