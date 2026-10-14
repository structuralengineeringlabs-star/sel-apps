/** Garde-fous communs aux routes : chemin de retour interne, origine des requêtes POST, adresse de base. */
import "server-only";
import { SITE_URL } from "@/lib/site";

/** N'accepte qu'un chemin interne (« /… », jamais « //… » ni une URL absolue) : pas de redirection ouverte. */
export function cheminSur(retour: string | null | undefined, defaut = "/compte"): string {
  if (!retour || !retour.startsWith("/") || retour.startsWith("//") || retour.startsWith("/\\")) return defaut;
  return retour;
}

/** Adresse publique du déploiement courant (prévisualisation comprise), pour les liens de retour et de notification. */
export function baseUrl(req: Request): string {
  const h = req.headers;
  const hote = h.get("x-forwarded-host") ?? h.get("host");
  const proto = h.get("x-forwarded-proto") ?? "https";
  return hote ? `${proto}://${hote}` : SITE_URL;
}

/** Requête POST de formulaire émise par le site lui-même (protection CSRF en plus des cookies SameSite=Lax). */
export function origineSure(req: Request): boolean {
  const origine = req.headers.get("origin");
  if (!origine) return false;
  try { return new URL(origine).host === new URL(baseUrl(req)).host; } catch { return false; }
}

/**
 * Adresse de notification CinetPay. Sur un déploiement de prévisualisation protégé par Vercel, le secret de
 * contournement « automatisation » (VERCEL_AUTOMATION_BYPASS_SECRET) est ajouté pour que la notification atteigne le site.
 */
export function urlNotification(base: string): string {
  const url = `${base}/api/paiement/notification`;
  const secret = process.env.VERCEL_ENV === "preview" ? process.env.VERCEL_AUTOMATION_BYPASS_SECRET : undefined;
  return secret ? `${url}?x-vercel-protection-bypass=${encodeURIComponent(secret)}` : url;
}
