import Link from "next/link";
import { Application } from "@/data/applications";
import { categories } from "@/data/categories";
import { formatPrice, getPricing } from "@/lib/utils";
import * as Icons from "lucide-react";

type Props = {
  application: Application;
};

export default function ApplicationCard({ application }: Props) {
  const category = categories.find((c) => c.slug === application.categorySlug);
  const IconComponent = (Icons as any)[application.icon] || Icons.Box;
  const pricing = getPricing(application);

  // Déterminer la destination du clic
  // Si l'app est gratuite ET a une URL → aller directement à l'app
  // Sinon → aller à la fiche descriptive
  const targetUrl =
    application.isFree && application.appUrl
      ? application.appUrl
      : `/applications/${application.slug}`;

  return (
    <Link
      href={targetUrl}
      className={`card group flex flex-col h-full relative ${
        application.isExpertise ? "ring-2 ring-yellow-400 pt-8" : ""
      }`}
    >
      {/* Badge Expertise */}
      {application.isExpertise && (
        <div className="absolute -top-5 left-1/2 -translate-x-1/2 z-10">
          <span className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full text-base font-black uppercase tracking-wider bg-yellow-400 text-sel-dark shadow-2xl border-4 border-white whitespace-nowrap">
            <span className="text-xl">⭐</span>
            <span>Expertise S.E.L.</span>
          </span>
        </div>
      )}

      {/* Icône + badges */}
      <div className="flex items-start justify-between mb-4">
        <div
          className="w-12 h-12 rounded-lg flex items-center justify-center"
          style={{ backgroundColor: `${category?.color}15` }}
        >
          <IconComponent
            className="w-6 h-6"
            style={{ color: category?.color }}
          />
        </div>
        <div className="flex flex-col items-end space-y-1">
          {application.isFree && <span className="badge-free">Gratuit</span>}
          {application.isPopular && !application.isExpertise && (
            <span className="badge-hot">Populaire</span>
          )}
          {application.isNew && <span className="badge-new">Nouveau</span>}
        </div>
      </div>

      {/* Titre + description */}
      <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-sel transition-colors">
        {application.name}
      </h3>
      <p className="text-sm text-gray-600 mb-4 flex-grow line-clamp-3">
        {application.shortDescription}
      </p>

      {/* Tags */}
      {application.tags && application.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-4">
          {application.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="inline-block px-2 py-0.5 rounded text-xs bg-gray-100 text-gray-600"
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* Prix */}
      <div className="pt-4 border-t border-gray-100">
        {pricing.type === "free" && (
          <div className="text-sm font-bold text-status-free">
            Gratuit — 0 XAF
          </div>
        )}

        {pricing.type === "monthly" && (
          <div>
            <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">
              Abonnement mensuel
            </div>
            <div className="text-base font-bold text-sel">{pricing.monthly}</div>
          </div>
        )}

        {pricing.type === "annual" && (
          <div>
            <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">
              Abonnement annuel
            </div>
            <div className="text-base font-bold text-sel">{pricing.annual}</div>
          </div>
        )}

        {pricing.type === "dual" && (
          <div className="space-y-1.5">
            <div className="flex items-baseline justify-between">
              <span className="text-xs text-gray-500">Mensuel</span>
              <span className="text-sm font-bold text-sel">{pricing.monthly}</span>
            </div>
            <div className="flex items-baseline justify-between">
              <span className="text-xs text-gray-500">Annuel</span>
              <span className="text-sm font-bold text-sel">{pricing.annual}</span>
            </div>
          </div>
        )}
      </div>
    </Link>
  );
}