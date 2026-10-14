/** Offres payables en ligne : prix TTC et durées, tirés du catalogue (data/applications.ts). */
import { applications } from "@/data/applications";

export type Formule = "mensuel" | "annuel";
export const DUREES: Record<Formule, number> = { mensuel: 30, annuel: 365 }; // jours
export const LIBELLES: Record<Formule, string> = { mensuel: "Abonnement mensuel (30 jours)", annuel: "Abonnement annuel (365 jours)" };

/** Pays de paiement proposés : le franc CFA d'Afrique centrale (XAF) et d'Afrique de l'Ouest (XOF) ont la même valeur. */
export const PAYS = {
  CM: { nom: "Cameroun", devise: "XAF", moyens: "MTN Mobile Money, Orange Money" },
  CI: { nom: "Côte d'Ivoire", devise: "XOF", moyens: "MTN, Orange Money, Wave" },
  SN: { nom: "Sénégal", devise: "XOF", moyens: "Wave, Orange Money, Free Money" },
} as const;
export type Pays = keyof typeof PAYS;
export type Devise = (typeof PAYS)[Pays]["devise"];
export const estPays = (v: unknown): v is Pays => typeof v === "string" && Object.hasOwn(PAYS, v);

/** Tarif d'essai (TARIF_ESSAI, en francs CFA) : remplace temporairement tous les prix, le temps d'un test réel. */
export function tarifEssai(): number | null {
  const v = Number(process.env.TARIF_ESSAI);
  return Number.isInteger(v) && v > 0 ? v : null;
}

export function offre(slug: string, formule: Formule): { nom: string; montant: number; jours: number; essai: boolean } | null {
  const app = applications.find(a => a.slug === slug && a.paiementEnLigne && !a.isFree);
  const prix = app ? (formule === "mensuel" ? app.priceMonthly : app.priceAnnual) : undefined;
  if (!app || !prix) return null;
  const essai = tarifEssai();
  return { nom: app.name, montant: essai ?? prix, jours: DUREES[formule], essai: essai !== null };
}
export const estFormule = (v: unknown): v is Formule => v === "mensuel" || v === "annuel";
