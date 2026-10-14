/**
 * Connexion par lien envoyé par e-mail : jeton aléatoire à usage unique, valable 15 minutes, au plus 3 demandes
 * par adresse et par quart d'heure.
 */
import "server-only";
import { db } from "./db";
import { empreinte, jetonAleatoire } from "./jetons";
import { envoyerCourriel, gabarit } from "./courriel";

const VALIDITE_MIN = 15, MAX_DEMANDES = 3;
export const emailValide = (e: string) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(e) && e.length <= 254;

export type ResultatDemande = "envoye" | "invalide" | "trop_de_demandes";
export async function demanderLien(emailBrut: string, retour: string, base: string, envoyer = envoyerCourriel): Promise<ResultatDemande> {
  const email = emailBrut.trim().toLowerCase();
  if (!emailValide(email)) return "invalide";
  const [{ n }] = await db().requete<{ n: string }>("select count(*) as n from liens_connexion where email = $1 and cree_le > now() - interval '15 minutes'", [email]);
  if (Number(n) >= MAX_DEMANDES) return "trop_de_demandes";
  const jeton = jetonAleatoire();
  await db().requete("insert into liens_connexion (jeton_hash, email, retour, expire_le) values ($1, $2, $3, now() + interval '15 minutes')", [empreinte(jeton), email, retour]);
  const url = `${base}/connexion/confirmer?jeton=${encodeURIComponent(jeton)}`;
  await envoyer({
    a: email, sujet: "Votre lien de connexion S.E.L.",
    texte: `Pour vous connecter, ouvrez ce lien (valable ${VALIDITE_MIN} minutes, usage unique) : ${url}`,
    html: gabarit("Connexion à votre compte S.E.L.", `Ce lien est valable ${VALIDITE_MIN} minutes et ne peut servir qu'une fois.`, { texte: "Se connecter", url }, "Si vous n'êtes pas à l'origine de cette demande, ignorez ce message."),
  });
  return "envoye";
}

/** Consomme le jeton ; renvoie l'adresse et le chemin de retour, ou null si invalide, expiré ou déjà utilisé. */
export async function consommerLien(jeton: string): Promise<{ email: string; retour: string | null } | null> {
  const r = await db().requete<{ email: string; retour: string | null }>(
    "update liens_connexion set utilise_le = now() where jeton_hash = $1 and utilise_le is null and expire_le > now() returning email, retour",
    [empreinte(jeton)],
  );
  return r[0] ?? null;
}
export { MAX_DEMANDES };
