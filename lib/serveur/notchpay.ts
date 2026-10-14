/**
 * Notch Pay (api.notchpay.co) : initialisation d'un paiement (page de paiement hébergée), lecture d'une transaction,
 * contrôle de la signature des notifications (en-tête x-notch-signature = HMAC-SHA256 hexadécimal du corps brut,
 * clé « hash » du point de notification). Documentation : developer.notchpay.co (API reference, webhooks/verify).
 * Les clés de test (pk_test_…) et réelles s'utilisent avec la même adresse d'API.
 */
import "server-only";
import { createHmac } from "crypto";
import { egaliteSure } from "./jetons";
import type { DemandeInit, Verification } from "./cinetpay";

const API = () => (process.env.NOTCHPAY_URL_BASE || "https://api.notchpay.co").replace(/\/$/, "");
const ENTETES = (cle: string) => ({ Authorization: cle, Accept: "application/json", "Content-Type": "application/json", "User-Agent": "SEL-Apps/1.0" });

export function configurationNotch() {
  const cle = process.env.NOTCHPAY_PUBLIC_KEY;
  if (!cle) throw new Error("Notch Pay non configuré (NOTCHPAY_PUBLIC_KEY).");
  return { cle, hash: process.env.NOTCHPAY_HASH ?? null };
}

/** Clé de test (paiements simulés) : les paiements correspondants sont marqués « essai ». */
export const cleDeTest = () => /test/i.test(process.env.NOTCHPAY_PUBLIC_KEY ?? "");

export function signatureNotch(corps: string, hash: string): string {
  return createHmac("sha256", hash).update(corps).digest("hex");
}
export function signatureNotchValide(corps: string, recue: string | null, hash: string): boolean {
  return !!recue && egaliteSure(signatureNotch(corps, hash), recue.trim().toLowerCase());
}

/** Crée la transaction chez Notch Pay ; renvoie l'adresse de la page de paiement et la référence Notch Pay. */
export async function initialiserNotch(d: DemandeInit, f: typeof fetch = fetch): Promise<{ paymentUrl: string; reference: string }> {
  const { cle } = configurationNotch();
  if (!Number.isInteger(d.montant) || d.montant <= 0) throw new Error("Montant invalide.");
  const r = await f(`${API()}/payments`, {
    method: "POST", headers: ENTETES(cle),
    body: JSON.stringify({
      amount: d.montant, currency: d.devise ?? "XAF", ...(d.pays ? { locked_country: d.pays } : {}), email: d.client.email, reference: d.transactionId, callback: d.returnUrl, description: d.description,
      customer: { email: d.client.email, ...(d.client.nom ? { name: d.client.nom } : {}) },
    }),
  });
  const j = await r.json().catch(() => ({})) as { message?: string; authorization_url?: string; transaction?: { reference?: string } };
  if (!r.ok || !j.authorization_url || !j.transaction?.reference) throw new Error(`Initialisation refusée par Notch Pay : ${r.status} ${j.message ?? ""}`.trim());
  return { paymentUrl: j.authorization_url, reference: j.transaction.reference };
}

/** Canal lisible (« cm.mtn » → « MTN Mobile Money ») ; les identifiants internes (« pm.… ») ne sont pas affichés. */
const CANAUX: Record<string, string> = { mtn: "MTN Mobile Money", orange: "Orange Money", wave: "Wave", airtel: "Airtel Money", mpesa: "M-Pesa", card: "carte bancaire", mobile: "Mobile Money" };
export function libelleCanal(c: string | null | undefined): string | null {
  if (!c || /^pm[._]/i.test(c)) return null;
  const op = c.toLowerCase().split(".").pop() ?? "";
  return CANAUX[op] ?? c;
}

const ECHEC = new Set(["failed", "canceled", "cancelled", "expired", "rejected", "abandoned", "refunded"]);
/** Lit la transaction chez Notch Pay et la ramène au format commun (ACCEPTED, REFUSED ou statut d'attente). */
export async function verifierNotch(reference: string, f: typeof fetch = fetch): Promise<Verification> {
  const { cle } = configurationNotch();
  const r = await f(`${API()}/payments/${encodeURIComponent(reference)}`, { headers: ENTETES(cle) });
  const j = await r.json().catch(() => ({})) as { transaction?: { status?: string; amount?: number | string; currency?: string; channel?: string; payment_method?: string | { channel?: string; name?: string } | null } };
  const t = j.transaction;
  const s = String(t?.status ?? "").toLowerCase();
  const methode = libelleCanal(t?.channel ?? (typeof t?.payment_method === "object" ? t?.payment_method?.channel ?? t?.payment_method?.name : t?.payment_method));
  return {
    code: String(r.status), statut: s === "complete" ? "ACCEPTED" : ECHEC.has(s) ? "REFUSED" : (s || "INCONNU").toUpperCase(),
    montant: Number(t?.amount ?? NaN), devise: String(t?.currency ?? "").toUpperCase(), methode, brut: j,
  };
}
