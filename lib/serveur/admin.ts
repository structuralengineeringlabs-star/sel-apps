/** Administration : réservée aux adresses listées dans ADMIN_EMAILS (séparées par des virgules), connectées au site. */
import "server-only";
import { utilisateurCourant, type Utilisateur } from "./session";

export function estAdmin(email: string | null | undefined): boolean {
  if (!email) return false;
  const liste = (process.env.ADMIN_EMAILS ?? "").split(",").map(s => s.trim().toLowerCase()).filter(Boolean);
  return liste.includes(email.trim().toLowerCase());
}

/** Utilisateur courant s'il est administrateur, sinon null. */
export async function adminCourant(): Promise<Utilisateur | null> {
  const u = await utilisateurCourant();
  return u && estAdmin(u.email) ? u : null;
}

/** Ligne CSV (séparateur « ; », guillemets doublés, neutralisation des formules de tableur). */
export function ligneCsv(valeurs: (string | number | null | undefined)[]): string {
  return valeurs.map(v => {
    let s = v === null || v === undefined ? "" : String(v);
    if (/^[=+\-@\t\r]/.test(s)) s = `'${s}`;
    return /[;"\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  }).join(";");
}
