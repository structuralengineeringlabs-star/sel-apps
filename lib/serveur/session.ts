/**
 * Sessions en base : cookie HttpOnly « sel_session » contenant un jeton aléatoire ; la base n'en garde que
 * l'empreinte. Durée 30 jours. Déconnexion = suppression de la ligne.
 */
import "server-only";
import { cookies } from "next/headers";
import { db } from "./db";
import { empreinte, jetonAleatoire } from "./jetons";

export const COOKIE_SESSION = "sel_session";
const DUREE_JOURS = 30;
export interface Utilisateur { id: number; email: string; nom: string | null }

/** Crée une session en base ; le jeton est à poser dans le cookie COOKIE_SESSION (voir optionsCookieSession). */
export async function creerSession(utilisateurId: number, invite = false): Promise<{ jeton: string; expire: Date }> {
  const jeton = jetonAleatoire();
  const expire = new Date(Date.now() + DUREE_JOURS * 86400e3);
  await db().requete("insert into sessions (jeton_hash, utilisateur_id, expire_le, invite) values ($1, $2, $3, $4)", [empreinte(jeton), utilisateurId, expire, invite]);
  return { jeton, expire };
}
export const optionsCookieSession = (expire: Date) => ({ httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax" as const, path: "/", expires: expire });

export async function ouvrirSession(utilisateurId: number) {
  const { jeton, expire } = await creerSession(utilisateurId);
  (await cookies()).set(COOKIE_SESSION, jeton, optionsCookieSession(expire));
}

/** Valeur d'un cookie de la requête (routes appelées hors contexte Next, tests compris). */
export function lireCookie(req: Request, nom: string): string | null {
  for (const c of (req.headers.get("cookie") ?? "").split(";")) {
    const i = c.indexOf("=");
    if (i > 0 && c.slice(0, i).trim() === nom) return decodeURIComponent(c.slice(i + 1).trim());
  }
  return null;
}

/** Utilisateur de la requête, ou null. */
export async function utilisateurCourant(): Promise<Utilisateur | null> {
  const jeton = (await cookies()).get(COOKIE_SESSION)?.value;
  if (!jeton) return null;
  return utilisateurDeJeton(jeton);
}
export async function utilisateurDeJeton(jeton: string): Promise<Utilisateur | null> {
  const r = await db().requete<{ id: string; email: string; nom: string | null }>(
    "select u.id, u.email, u.nom from sessions s join utilisateurs u on u.id = s.utilisateur_id where s.jeton_hash = $1 and s.expire_le > now()",
    [empreinte(jeton)],
  );
  return r[0] ? { id: Number(r[0].id), email: r[0].email, nom: r[0].nom } : null;
}

export async function fermerSession() {
  const store = await cookies();
  const jeton = store.get(COOKIE_SESSION)?.value;
  if (jeton) await db().requete("delete from sessions where jeton_hash = $1", [empreinte(jeton)]);
  store.delete(COOKIE_SESSION);
}

/**
 * Connexion prouvant la maîtrise de l'adresse (lien, code, Google) : l'adresse devient vérifiée et les sessions
 * « invité » ouvertes par un achat sans compte sont révoquées (un tiers ayant payé pour cette adresse perd l'accès au compte).
 */
export async function marquerVerifie(utilisateurId: number) {
  const r = await db().requete("update utilisateurs set email_verifie = true where id = $1 and not email_verifie returning id", [utilisateurId]);
  if (r.length) await db().requete("delete from sessions where utilisateur_id = $1 and invite", [utilisateurId]);
}

/** Achat sans connexion : compte existant (nouveau = false) ou créé, adresse non vérifiée (nouveau = true). */
export async function utilisateurPourAchat(email: string): Promise<{ id: number; nouveau: boolean }> {
  const e = email.trim().toLowerCase();
  const cree = await db().requete<{ id: string }>("insert into utilisateurs (email, email_verifie) values ($1, false) on conflict (email) do nothing returning id", [e]);
  if (cree[0]) return { id: Number(cree[0].id), nouveau: true };
  const [u] = await db().requete<{ id: string }>("select id from utilisateurs where email = $1", [e]);
  return { id: Number(u.id), nouveau: false };
}

/** Trouve ou crée l'utilisateur d'une adresse e-mail (liaison du compte Google si fournie). */
export async function utilisateurPourEmail(email: string, nom?: string | null, googleSub?: string): Promise<number> {
  const e = email.trim().toLowerCase();
  const r = await db().requete<{ id: string }>(
    `insert into utilisateurs (email, nom, google_sub) values ($1, $2, $3)
     on conflict (email) do update set nom = coalesce(utilisateurs.nom, excluded.nom), google_sub = coalesce(utilisateurs.google_sub, excluded.google_sub)
     returning id`,
    [e, nom ?? null, googleSub ?? null],
  );
  return Number(r[0].id);
}
