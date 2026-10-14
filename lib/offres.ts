/** Offres payables en ligne : prix TTC (XAF) et durées, tirés du catalogue (data/applications.ts). */
import { applications } from "@/data/applications";

export type Formule = "mensuel" | "annuel";
export const DUREES: Record<Formule, number> = { mensuel: 30, annuel: 365 }; // jours
export const LIBELLES: Record<Formule, string> = { mensuel: "Abonnement mensuel (30 jours)", annuel: "Abonnement annuel (365 jours)" };

export function offre(slug: string, formule: Formule): { nom: string; montant: number; jours: number } | null {
  const app = applications.find(a => a.slug === slug && a.paiementEnLigne && !a.isFree);
  const montant = app ? (formule === "mensuel" ? app.priceMonthly : app.priceAnnual) : undefined;
  return app && montant ? { nom: app.name, montant, jours: DUREES[formule] } : null;
}
export const estFormule = (v: unknown): v is Formule => v === "mensuel" || v === "annuel";
