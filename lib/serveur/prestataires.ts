/** Choix du prestataire de paiement : PAIEMENT_PRESTATAIRE, sinon Notch Pay s'il est configuré, sinon CinetPay. */
import "server-only";

export type Prestataire = "notchpay" | "cinetpay";
export const NOMS_PRESTATAIRES: Record<Prestataire, string> = { notchpay: "Notch Pay", cinetpay: "CinetPay" };

export function prestataireActif(): Prestataire {
  const choix = process.env.PAIEMENT_PRESTATAIRE;
  if (choix === "notchpay" || choix === "cinetpay") return choix;
  return process.env.NOTCHPAY_PUBLIC_KEY ? "notchpay" : "cinetpay";
}
export const nomPrestataire = (p: string | null | undefined) => NOMS_PRESTATAIRES[p as Prestataire] ?? "CinetPay";
