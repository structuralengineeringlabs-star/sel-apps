import Link from "next/link";
import { Application } from "@/data/applications";
import { categories } from "@/data/categories";
import { getPricing } from "@/lib/utils";
import * as Icons from "lucide-react";

type Props = {
  application: Application;
  variant?: "dark" | "light";
};

export default function ApplicationCardCompact({
  application,
  variant = "light",
}: Props) {
  const category = categories.find((c) => c.slug === application.categorySlug);
  const IconComponent = (Icons as any)[application.icon] || Icons.Box;
  const isDark = variant === "dark";
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
      className={`group flex items-center gap-4 rounded-lg border transition-all duration-200 ${
        application.isExpertise ? "p-5" : "p-4"
      } ${
        isDark
          ? "bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20"
          : "bg-white border-gray-200 hover:border-sel hover:shadow-md"
      } ${
        application.isExpertise
          ? isDark
            ? "border-yellow-400/40 bg-yellow-400/5"
            : "border-yellow-400/60 bg-yellow-50/30"
          : ""
      }`}
    >
      {/* Icône */}
      <div
        className={`rounded-lg flex items-center justify-center flex-shrink-0 ${
          application.isExpertise ? "w-12 h-12" : "w-10 h-10"
        }`}
        style={{
          backgroundColor: isDark
            ? "rgba(255, 255, 255, 0.1)"
            : `${category?.color}15`,
        }}
      >
        <IconComponent
          className={application.isExpertise ? "w-6 h-6" : "w-5 h-5"}
          style={{ color: isDark ? "#ffffff" : category?.color }}
        />
      </div>

      {/* Infos */}
      <div className="flex-grow min-w-0">
        <div className="flex items-center gap-2 mb-1 flex-wrap">
          <h3
            className={`font-bold transition-colors truncate ${
              application.isExpertise ? "text-base" : "text-sm"
            } ${
              isDark
                ? "text-white group-hover:text-yellow-300"
                : "text-gray-900 group-hover:text-sel"
            }`}
          >
            {application.name}
          </h3>

          {application.isExpertise && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-black uppercase tracking-wider bg-yellow-400 text-sel-dark flex-shrink-0 shadow-lg border-2 border-yellow-200">
              <span className="text-base">⭐</span>
              <span>Expertise S.E.L.</span>
            </span>
          )}

          {application.isFree && !application.isExpertise && (
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide bg-status-free/15 text-status-free flex-shrink-0">
              Gratuit
            </span>
          )}
          {application.isPopular && !application.isExpertise && (
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide bg-status-hot/15 text-status-hot flex-shrink-0">
              Populaire
            </span>
          )}
        </div>
        <p
          className={`line-clamp-1 ${
            application.isExpertise ? "text-sm" : "text-xs"
          } ${isDark ? "text-white/60" : "text-gray-500"}`}
        >
          {application.shortDescription}
        </p>
      </div>

      {/* Prix */}
      <div className={`flex-shrink-0 text-right ${isDark ? "text-yellow-300" : "text-sel"}`}>
        {pricing.type === "free" && (
          <span className={`font-bold ${application.isExpertise ? "text-base" : "text-xs"}`}>
            Gratuit
          </span>
        )}
        {pricing.type === "monthly" && (
          <span className={`font-bold ${application.isExpertise ? "text-base" : "text-xs"}`}>
            {pricing.monthly}
          </span>
        )}
        {pricing.type === "annual" && (
          <span className={`font-bold ${application.isExpertise ? "text-base" : "text-xs"}`}>
            {pricing.annual}
          </span>
        )}
        {pricing.type === "dual" && (
          <div className="flex flex-col items-end">
            <span className={`font-bold ${application.isExpertise ? "text-base" : "text-xs"}`}>
              {pricing.monthly}
            </span>
            <span className={`text-[10px] ${isDark ? "text-white/60" : "text-gray-500"}`}>
              ou {pricing.annual}
            </span>
          </div>
        )}
      </div>
    </Link>
  );
}