/**
 * Paiements et abonnements. Un paiement accepté prolonge l'accès à l'application de 30 ou 365 jours à compter de la
 * fin de l'abonnement en cours (ou de maintenant). L'activation exige la confirmation du prestataire (Notch Pay ou
 * CinetPay) par son API de lecture de transaction (paiement réussi, montant et devise identiques à la commande) ; elle est
 * idempotente (verrou de ligne).
 */
import "server-only";
import { randomBytes } from "crypto";
import { db } from "./db";
import { offre, type Formule } from "@/lib/offres";
import { verifier as verifierCinetPay, type Verification } from "./cinetpay";
import { verifierNotch } from "./notchpay";
import { prestataireActif, type Prestataire } from "./prestataires";

export async function creerPaiement(utilisateurId: number, application: string, formule: Formule, prestataire: Prestataire = prestataireActif()) {
  const o = offre(application, formule);
  if (!o) throw new Error("Offre inconnue.");
  const transactionId = `SEL${Date.now().toString(36).toUpperCase()}${randomBytes(4).toString("hex").toUpperCase()}`;
  await db().requete("insert into paiements (transaction_id, utilisateur_id, application, formule, montant, prestataire) values ($1, $2, $3, $4, $5, $6)",
    [transactionId, utilisateurId, application, formule, o.montant, prestataire]);
  return { transactionId, montant: o.montant, nom: o.nom, jours: o.jours, prestataire };
}

/** Référence de la transaction chez le prestataire (Notch Pay), connue après l'initialisation. */
export async function enregistrerRefPrestataire(transactionId: string, ref: string) {
  await db().requete("update paiements set ref_prestataire = $2, maj_le = now() where transaction_id = $1", [transactionId, ref]);
}

/** Retrouve notre identifiant de transaction à partir de références reçues d'un prestataire. */
export async function transactionPourReferences(refs: string[]): Promise<string | null> {
  const l = refs.filter(Boolean);
  if (!l.length) return null;
  const [p] = await db().requete<{ transaction_id: string }>(
    "select transaction_id from paiements where transaction_id = any($1) or ref_prestataire = any($1) limit 1", [l]);
  return p?.transaction_id ?? null;
}

const verifierSelon = (prestataire: string, transactionId: string, ref: string | null): Promise<Verification> =>
  prestataire === "notchpay" ? verifierNotch(ref ?? transactionId) : verifierCinetPay(transactionId);

export type Issue = "inconnu" | "deja_accepte" | "accepte" | "refuse" | "en_attente" | "anomalie";
export interface ResultatSynchro { issue: Issue; utilisateurId?: number; application?: string; fin?: Date; numeroRecu?: string }

/** Interroge le prestataire et met à jour le paiement et l'abonnement (appelé par la notification et par la page de retour). */
export async function synchroniserPaiement(transactionId: string, verifier?: (t: string) => Promise<Verification>): Promise<ResultatSynchro> {
  return db().transaction(async ex => {
    const [p] = await ex.requete<{ id: string; utilisateur_id: string; application: string; formule: Formule; montant: number; statut: string; numero_recu: string | null; prestataire: string; ref_prestataire: string | null }>(
      "select id, utilisateur_id, application, formule, montant, statut, numero_recu, prestataire, ref_prestataire from paiements where transaction_id = $1 for update", [transactionId]);
    if (!p) return { issue: "inconnu" };
    const base = { utilisateurId: Number(p.utilisateur_id), application: p.application };
    if (p.statut === "accepte") return { issue: "deja_accepte", ...base, numeroRecu: p.numero_recu ?? undefined };
    const v = verifier ? await verifier(transactionId) : await verifierSelon(p.prestataire, transactionId, p.ref_prestataire);
    if (v.statut === "ACCEPTED") {
      if (v.montant !== Number(p.montant) || v.devise !== "XAF") {
        await ex.requete("update paiements set reponse = $2, maj_le = now() where id = $1", [p.id, JSON.stringify(v.brut)]);
        return { issue: "anomalie", ...base };
      }
      const [r] = await ex.requete<{ numero: string }>("select 'SEL-R-' || to_char(now(), 'YYYY') || '-' || lpad(nextval('recus_seq')::text, 6, '0') as numero");
      await ex.requete("update paiements set statut = 'accepte', methode = $2, reponse = $3, numero_recu = $4, paye_le = now(), maj_le = now() where id = $1",
        [p.id, v.methode, JSON.stringify(v.brut), r.numero]);
      const jours = p.formule === "annuel" ? 365 : 30;
      const [a] = await ex.requete<{ fin: Date }>(
        `insert into abonnements (utilisateur_id, application, fin) values ($1, $2, now() + make_interval(days => $3))
         on conflict (utilisateur_id, application) do update set fin = greatest(abonnements.fin, now()) + make_interval(days => $3), maj_le = now()
         returning fin`, [p.utilisateur_id, p.application, jours]);
      return { issue: "accepte", ...base, fin: new Date(a.fin), numeroRecu: r.numero };
    }
    if (v.statut === "REFUSED") {
      await ex.requete("update paiements set statut = 'refuse', methode = $2, reponse = $3, maj_le = now() where id = $1", [p.id, v.methode, JSON.stringify(v.brut)]);
      return { issue: "refuse", ...base };
    }
    await ex.requete("update paiements set reponse = $2, maj_le = now() where id = $1", [p.id, JSON.stringify(v.brut)]);
    return { issue: "en_attente", ...base };
  });
}

/** Date de fin d'un abonnement actif, ou null. */
export async function abonnementActif(utilisateurId: number, application: string): Promise<Date | null> {
  const [r] = await db().requete<{ fin: Date }>("select fin from abonnements where utilisateur_id = $1 and application = $2 and fin > now()", [utilisateurId, application]);
  return r ? new Date(r.fin) : null;
}

export interface LignePaiement { id: number; transaction_id: string; application: string; formule: Formule; montant: number; statut: string; numero_recu: string | null; cree_le: Date; paye_le: Date | null; methode: string | null; prestataire: string }
export async function paiementsDe(utilisateurId: number): Promise<LignePaiement[]> {
  return db().requete<LignePaiement & Record<string, unknown>>(
    "select id, transaction_id, application, formule, montant, statut, numero_recu, cree_le, paye_le, methode, prestataire from paiements where utilisateur_id = $1 order by cree_le desc limit 50", [utilisateurId]);
}
export async function abonnementsDe(utilisateurId: number): Promise<{ application: string; fin: Date }[]> {
  return db().requete<{ application: string; fin: Date }>("select application, fin from abonnements where utilisateur_id = $1 order by application", [utilisateurId]);
}
export async function paiementDe(utilisateurId: number, transactionId: string): Promise<LignePaiement | null> {
  const [p] = await db().requete<LignePaiement & Record<string, unknown>>(
    "select id, transaction_id, application, formule, montant, statut, numero_recu, cree_le, paye_le, methode, prestataire from paiements where utilisateur_id = $1 and transaction_id = $2", [utilisateurId, transactionId]);
  return p ?? null;
}
