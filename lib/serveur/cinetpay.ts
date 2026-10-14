/**
 * CinetPay (API Checkout v2) : initialisation d'un paiement, vérification d'une transaction, contrôle du jeton
 * HMAC « x-token » des notifications (HMAC-SHA256, clé secrète du marchand, 16 champs concaténés sans séparateur).
 * Documentation : docs.cinetpay.com — initialisation, notification, vérification, token HMAC.
 */
import "server-only";
import { createHmac } from "crypto";
import { egaliteSure } from "./jetons";

// Adresse de l'API (paramétrable pour une recette avec un serveur simulé ; par défaut, l'API officielle)
const API = () => (process.env.CINETPAY_URL_BASE || "https://api-checkout.cinetpay.com").replace(/\/$/, "");
const URL_INIT = () => `${API()}/v2/payment`;
const URL_CHECK = () => `${API()}/v2/payment/check`;
const ENTETES = { "Content-Type": "application/json", "User-Agent": "SEL-Apps/1.0" }; // CinetPay bloque les requêtes sans user-agent

export const CHAMPS_HMAC = ["cpm_site_id", "cpm_trans_id", "cpm_trans_date", "cpm_amount", "cpm_currency", "signature", "payment_method",
  "cel_phone_num", "cpm_phone_prefixe", "cpm_language", "cpm_version", "cpm_payment_config", "cpm_page_action", "cpm_custom", "cpm_designation", "cpm_error_message"] as const;

export function configuration() {
  const apikey = process.env.CINETPAY_API_KEY, site_id = process.env.CINETPAY_SITE_ID, secret = process.env.CINETPAY_SECRET_KEY;
  if (!apikey || !site_id || !secret) throw new Error("CinetPay non configuré (CINETPAY_API_KEY, CINETPAY_SITE_ID, CINETPAY_SECRET_KEY).");
  return { apikey, site_id, secret };
}

export function jetonHmac(champs: Record<string, string | undefined>, secret: string): string {
  const donnees = CHAMPS_HMAC.map(k => champs[k] ?? "").join("");
  return createHmac("sha256", secret).update(donnees).digest("hex");
}
export function xTokenValide(champs: Record<string, string | undefined>, recu: string | null, secret: string): boolean {
  return !!recu && egaliteSure(jetonHmac(champs, secret), recu.trim().toLowerCase());
}

export interface DemandeInit { transactionId: string; montant: number; description: string; notifyUrl: string; returnUrl: string; client: { email: string; nom: string | null } }
export async function initialiser(d: DemandeInit, f: typeof fetch = fetch): Promise<{ paymentUrl: string }> {
  const { apikey, site_id } = configuration();
  if (!Number.isInteger(d.montant) || d.montant % 5 !== 0) throw new Error("Montant invalide (entier multiple de 5 exigé par CinetPay).");
  const [prenom, ...reste] = (d.client.nom ?? "").trim().split(/\s+/);
  const r = await f(URL_INIT(), {
    method: "POST", headers: ENTETES,
    body: JSON.stringify({
      apikey, site_id, transaction_id: d.transactionId, amount: d.montant, currency: "XAF", description: d.description,
      notify_url: d.notifyUrl, return_url: d.returnUrl, channels: "ALL", lang: "fr",
      customer_email: d.client.email, ...(prenom ? { customer_name: reste.join(" ") || prenom, customer_surname: prenom } : {}), customer_country: "CM",
    }),
  });
  const j = await r.json().catch(() => ({})) as { code?: string; message?: string; description?: string; data?: { payment_url?: string } };
  if (j.code !== "201" || !j.data?.payment_url) throw new Error(`Initialisation refusée par CinetPay : ${j.message ?? r.status} ${j.description ?? ""}`.trim());
  return { paymentUrl: j.data.payment_url };
}

export interface Verification { code: string; statut: string; montant: number; devise: string; methode: string | null; brut: unknown }
export async function verifier(transactionId: string, f: typeof fetch = fetch): Promise<Verification> {
  const { apikey, site_id } = configuration();
  const r = await f(URL_CHECK(), { method: "POST", headers: ENTETES, body: JSON.stringify({ apikey, site_id, transaction_id: transactionId }) });
  const j = await r.json().catch(() => ({})) as { code?: string; data?: { status?: string; amount?: string | number; currency?: string; payment_method?: string } };
  return { code: String(j.code ?? r.status), statut: j.data?.status ?? "INCONNU", montant: Number(j.data?.amount ?? NaN), devise: j.data?.currency ?? "", methode: j.data?.payment_method ?? null, brut: j };
}
