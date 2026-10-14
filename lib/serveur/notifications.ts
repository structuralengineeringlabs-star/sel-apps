/** Courriels liés aux abonnements : confirmation de paiement et rappels d'échéance (J-7, J-1). */
import "server-only";
import { db } from "./db";
import { envoyerCourriel, gabarit } from "./courriel";
import { applications } from "@/data/applications";
import { SITE_URL } from "@/lib/site";
import type { ResultatSynchro } from "./abonnements";

const nomApp = (slug: string) => applications.find(a => a.slug === slug)?.name ?? slug;
const date = (d: Date) => d.toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric", timeZone: "Africa/Douala" });

export async function envoyerConfirmation(r: ResultatSynchro, envoyer = envoyerCourriel) {
  if (!r.utilisateurId || !r.application || !r.fin) return;
  const [u] = await db().requete<{ email: string }>("select email from utilisateurs where id = $1", [r.utilisateurId]);
  if (!u) return;
  const app = nomApp(r.application), url = `${SITE_URL}/apps/${r.application}`;
  await envoyer({ a: u.email, sujet: `Abonnement activé : ${app}`,
    texte: `Votre paiement est confirmé (reçu ${r.numeroRecu}). Accès à ${app} jusqu'au ${date(r.fin)} : ${url}`,
    html: gabarit(`Abonnement activé : ${app}`, `Votre paiement est confirmé (reçu ${r.numeroRecu}). Votre accès est ouvert jusqu'au ${date(r.fin)}.`, { texte: "Ouvrir l'application", url }, "Le reçu est disponible dans votre compte.") });
}

/** Envoie les rappels dus (une seule fois par échéance et par type). Renvoie le nombre de courriels envoyés. */
export async function envoyerRappels(envoyer = envoyerCourriel): Promise<number> {
  let n = 0;
  for (const [type, jours] of [["J7", 7], ["J1", 1]] as const) {
    const dus = await db().requete<{ utilisateur_id: string; application: string; fin: Date; email: string }>(
      `select a.utilisateur_id, a.application, a.fin, u.email from abonnements a join utilisateurs u on u.id = a.utilisateur_id
       where a.fin > now() and a.fin <= now() + make_interval(days => $1)
       and not exists (select 1 from rappels r where r.utilisateur_id = a.utilisateur_id and r.application = a.application and r.fin = a.fin and r.type = $2)`, [jours, type]);
    for (const d of dus) {
      const app = nomApp(d.application), url = `${SITE_URL}/applications/${d.application}`;
      try {
        await envoyer({ a: d.email, sujet: `Votre abonnement ${app} expire le ${date(new Date(d.fin))}`,
          texte: `Votre accès à ${app} prend fin le ${date(new Date(d.fin))}. Pour le prolonger : ${url}`,
          html: gabarit(`Votre abonnement ${app} arrive à échéance`, `Votre accès prend fin le ${date(new Date(d.fin))}. Un nouveau paiement prolonge l'accès à partir de cette date.`, { texte: "Prolonger mon abonnement", url }, "Sans renouvellement, l'application repasse en version de démonstration ; vos projets restent dans votre navigateur.") });
        await db().requete("insert into rappels (utilisateur_id, application, fin, type) values ($1, $2, $3, $4) on conflict do nothing", [d.utilisateur_id, d.application, d.fin, type]);
        n++;
      } catch (e) { console.error("[rappels] échec d'envoi", d.email, e); }
    }
  }
  return n;
}
