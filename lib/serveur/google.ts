/**
 * Connexion Google (OpenID Connect, code d'autorisation + PKCE S256). L'état, le vérificateur PKCE et le chemin de
 * retour sont gardés 10 minutes dans un cookie HttpOnly. Seules les adresses vérifiées par Google sont acceptées.
 */
import "server-only";
import { defiPkce, egaliteSure, jetonAleatoire } from "./jetons";

export const COOKIE_OAUTH = "sel_oauth";
const AUTORISATION = "https://accounts.google.com/o/oauth2/v2/auth";
const JETON = "https://oauth2.googleapis.com/token";
const INFOS = "https://openidconnect.googleapis.com/v1/userinfo";

function identifiants() {
  const id = process.env.GOOGLE_CLIENT_ID, secret = process.env.GOOGLE_CLIENT_SECRET;
  if (!id || !secret) throw new Error("Connexion Google non configurée (GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET).");
  return { id, secret };
}
export const urlRappel = (base: string) => `${base}/api/auth/google/rappel`;

export function preparer(base: string, retour: string) {
  const etat = jetonAleatoire(24), verificateur = jetonAleatoire(48);
  const u = new URL(AUTORISATION);
  u.search = new URLSearchParams({
    client_id: identifiants().id, redirect_uri: urlRappel(base), response_type: "code", scope: "openid email profile",
    state: etat, code_challenge: defiPkce(verificateur), code_challenge_method: "S256", prompt: "select_account",
  }).toString();
  return { url: u.toString(), cookie: JSON.stringify({ etat, verificateur, retour }) };
}

export interface ProfilGoogle { sub: string; email: string; nom: string | null }
export async function terminer(base: string, cookie: string | undefined, code: string | null, etat: string | null, f: typeof fetch = fetch): Promise<{ profil: ProfilGoogle; retour: string }> {
  if (!cookie || !code || !etat) throw new Error("Session de connexion expirée ou incomplète.");
  const c = JSON.parse(cookie) as { etat: string; verificateur: string; retour: string };
  if (!egaliteSure(c.etat, etat)) throw new Error("État de connexion invalide.");
  const { id, secret } = identifiants();
  const rj = await f(JETON, {
    method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ code, client_id: id, client_secret: secret, redirect_uri: urlRappel(base), grant_type: "authorization_code", code_verifier: c.verificateur }),
  });
  if (!rj.ok) throw new Error(`Échange du code refusé par Google (${rj.status}).`);
  const { access_token } = await rj.json() as { access_token: string };
  const ri = await f(INFOS, { headers: { Authorization: `Bearer ${access_token}` } });
  if (!ri.ok) throw new Error("Profil Google indisponible.");
  const p = await ri.json() as { sub: string; email?: string; email_verified?: boolean; name?: string };
  if (!p.email || p.email_verified !== true) throw new Error("Adresse e-mail Google non vérifiée.");
  return { profil: { sub: p.sub, email: p.email.toLowerCase(), nom: p.name ?? null }, retour: c.retour };
}
