import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { Application } from "@/data/applications";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(price: number) {
  return `${new Intl.NumberFormat("fr-FR").format(price)} XAF`;
}

// Retourne les prix formatés selon les règles métier
export function getPricing(application: Application) {
  if (application.isFree) {
    return {
      type: "free" as const,
      label: "Gratuit",
      monthly: null,
      annual: null,
    };
  }

  const hasMonthly = !!application.priceMonthly;
  const hasAnnual = !!application.priceAnnual;

  return {
    type: hasMonthly && hasAnnual ? ("dual" as const) : hasMonthly ? ("monthly" as const) : ("annual" as const),
    monthly: hasMonthly ? formatPrice(application.priceMonthly!) + "/mois" : null,
    annual: hasAnnual ? formatPrice(application.priceAnnual!) + "/an" : null,
    monthlyRaw: application.priceMonthly,
    annualRaw: application.priceAnnual,
  };
}