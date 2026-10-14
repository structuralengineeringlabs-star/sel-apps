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

export async function ouvrirSession(utilisateurId: number) {
  const jeton = jetonAleatoire();
  const expire = new Date(Date.now() + DUREE_JOURS * 86400e3);
  await db().requete("insert into sessions (jeton_hash, utilisateur_id, expire_le) values ($1, $2, $3)", [empreinte(jeton), utilisateurId, expire]);
  (await cookies()).set(COOKIE_SESSION, jeton, { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/", expires: expire });
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
