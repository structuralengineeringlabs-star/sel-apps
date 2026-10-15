/**
 * Connexion par lien envoyé par e-mail : jeton aléatoire à usage unique, valable 15 minutes, au plus 3 demandes
 * par adresse et par quart d'heure.
 */
import "server-only";
import { db } from "./db";
import { randomInt } from "crypto";
import { egaliteSure, empreinte, jetonAleatoire } from "./jetons";
import { envoyerCourriel, gabarit } from "./courriel";

const VALIDITE_MIN = 15, MAX_DEMANDES = 3, MAX_ESSAIS_CODE = 5;
/** Code à 6 chiffres envoyé avec le lien : se saisit sur la page d'origine (pas de changement de navigateur sur téléphone). */
const empreinteCode = (email: string, code: string) => empreinte(`${email}:${code}`);
export const normaliserCode = (c: string) => c.replace(/\D/g, "");
export const emailValide = (e: string) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(e) && e.length <= 254;

export type ResultatDemande = "envoye" | "invalide" | "trop_de_demandes";
export async function demanderLien(emailBrut: string, retour: string, base: string, envoyer = envoyerCourriel): Promise<ResultatDemande> {
  const email = emailBrut.trim().toLowerCase();
  if (!emailValide(email)) return "invalide";
  const [{ n }] = await db().requete<{ n: string }>("select count(*) as n from liens_connexion where email = $1 and cree_le > now() - interval '15 minutes'", [email]);
  if (Number(n) >= MAX_DEMANDES) return "trop_de_demandes";
  const jeton = jetonAleatoire();
  const code = String(randomInt(0, 1_000_000)).padStart(6, "0");
  await db().requete("insert into liens_connexion (jeton_hash, email, retour, expire_le, code_hash) values ($1, $2, $3, now() + interval '15 minutes', $4)",
    [empreinte(jeton), email, retour, empreinteCode(email, code)]);
  const url = `${base}/connexion/confirmer?jeton=${encodeURIComponent(jeton)}`;
  const lisible = `${code.slice(0, 3)} ${code.slice(3)}`;
  await envoyer({
    a: email, sujet: `Code de connexion S.E.L. : ${lisible}`,
    texte: `Votre code de connexion : ${lisible} (à saisir sur la page restée ouverte). Ou ouvrez ce lien : ${url} (code et lien valables ${VALIDITE_MIN} minutes, usage unique).`,
    html: gabarit("Votre code de connexion S.E.L.", `Saisissez ce code sur la page restée ouverte, ou utilisez le bouton ci-dessous. Code et lien valables ${VALIDITE_MIN} minutes, une seule fois.`, { texte: "Se connecter", url }, "Si vous n'êtes pas à l'origine de cette demande, ignorez ce message.", lisible),
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
/**
 * Vérifie un code saisi : 5 essais au plus par demande, puis la demande est inutilisable. En cas de succès, la demande
 * est consommée (le lien ne sert plus) ; renvoie l'adresse et le chemin de retour.
 */
export async function verifierCode(emailBrut: string, codeBrut: string): Promise<{ email: string; retour: string | null } | null> {
  const email = emailBrut.trim().toLowerCase(), code = normaliserCode(codeBrut);
  if (!emailValide(email) || code.length !== 6) return null;
  const actifs = await db().requete<{ jeton_hash: string; code_hash: string; retour: string | null }>(
    `update liens_connexion set essais = essais + 1 where email = $1 and utilise_le is null and expire_le > now()
     and code_hash is not null and essais < $2 returning jeton_hash, code_hash, retour`, [email, MAX_ESSAIS_CODE]);
  const attendu = empreinteCode(email, code);
  const bon = actifs.find(a => egaliteSure(a.code_hash, attendu));
  if (!bon) return null;
  const r = await db().requete("update liens_connexion set utilise_le = now() where jeton_hash = $1 and utilise_le is null returning 1", [bon.jeton_hash]);
  return r.length ? { email, retour: bon.retour } : null;
}
export { MAX_DEMANDES, MAX_ESSAIS_CODE };
