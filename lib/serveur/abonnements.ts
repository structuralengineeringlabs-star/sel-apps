/**
 * Paiements et abonnements. Un paiement accepté prolonge l'accès à l'application de 30 ou 365 jours à compter de la
 * fin de l'abonnement en cours (ou de maintenant). L'activation exige la confirmation du prestataire (Notch Pay ou
 * CinetPay) par son API de lecture de transaction (paiement réussi, montant et devise identiques à la commande) ; elle est
 * idempotente (verrou de ligne). L'administration peut aussi enregistrer un paiement reçu hors ligne (activation manuelle).
 */
import "server-only";
import { randomBytes } from "crypto";
import { db, type Executeur } from "./db";
import { offre, DUREES, type Formule, type Devise } from "@/lib/offres";
import { verifier as verifierCinetPay, type Verification } from "./cinetpay";
import { verifierNotch, cleDeTest } from "./notchpay";
import { prestataireActif, type Prestataire } from "./prestataires";

/** Commandes au plus par utilisateur et par période de 10 minutes (protection contre les créations en rafale). */
export const LIMITE_COMMANDES = 5;
export class TropDeCommandes extends Error { constructor() { super("Trop de commandes en peu de temps."); } }

const nouvelId = (prefixe = "SEL") => `${prefixe}${Date.now().toString(36).toUpperCase()}${randomBytes(4).toString("hex").toUpperCase()}`;

export async function creerPaiement(utilisateurId: number, application: string, formule: Formule,
  prestataire: Prestataire = prestataireActif(), devise: Devise = "XAF") {
  const o = offre(application, formule);
  if (!o) throw new Error("Offre inconnue.");
  const [{ n }] = await db().requete<{ n: number }>(
    "select count(*)::int as n from paiements where utilisateur_id = $1 and cree_le > now() - interval '10 minutes'", [utilisateurId]);
  if (n >= LIMITE_COMMANDES) throw new TropDeCommandes();
  const transactionId = nouvelId();
  const essai = prestataire === "notchpay" && cleDeTest();
  await db().requete("insert into paiements (transaction_id, utilisateur_id, application, formule, montant, devise, prestataire, essai) values ($1, $2, $3, $4, $5, $6, $7, $8)",
    [transactionId, utilisateurId, application, formule, o.montant, devise, prestataire, essai]);
  return { transactionId, montant: o.montant, devise, nom: o.nom, jours: o.jours, prestataire };
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

/** Marque un paiement comme accepté, attribue le numéro de reçu et prolonge l'abonnement (dans une transaction). */
async function accepter(ex: Executeur, p: { id: string; utilisateur_id: string; application: string; formule: Formule }, methode: string | null, brut: unknown) {
  const [r] = await ex.requete<{ numero: string }>("select 'SEL-R-' || to_char(now(), 'YYYY') || '-' || lpad(nextval('recus_seq')::text, 6, '0') as numero");
  await ex.requete("update paiements set statut = 'accepte', methode = $2, reponse = $3, numero_recu = $4, paye_le = now(), maj_le = now() where id = $1",
    [p.id, methode, JSON.stringify(brut), r.numero]);
  const [a] = await ex.requete<{ fin: Date }>(
    `insert into abonnements (utilisateur_id, application, fin) values ($1, $2, now() + make_interval(days => $3))
     on conflict (utilisateur_id, application) do update set fin = greatest(abonnements.fin, now()) + make_interval(days => $3), maj_le = now()
     returning fin`, [p.utilisateur_id, p.application, DUREES[p.formule]]);
  return { fin: new Date(a.fin), numeroRecu: r.numero };
}

/** Interroge le prestataire et met à jour le paiement et l'abonnement (appelé par la notification et par la page de retour). */
export async function synchroniserPaiement(transactionId: string, verifier?: (t: string) => Promise<Verification>): Promise<ResultatSynchro> {
  return db().transaction(async ex => {
    const [p] = await ex.requete<{ id: string; utilisateur_id: string; application: string; formule: Formule; montant: number; devise: string; statut: string; numero_recu: string | null; prestataire: string; ref_prestataire: string | null }>(
      "select id, utilisateur_id, application, formule, montant, devise, statut, numero_recu, prestataire, ref_prestataire from paiements where transaction_id = $1 for update", [transactionId]);
    if (!p) return { issue: "inconnu" };
    const base = { utilisateurId: Number(p.utilisateur_id), application: p.application };
    if (p.statut === "accepte") return { issue: "deja_accepte", ...base, numeroRecu: p.numero_recu ?? undefined };
    if (p.prestataire === "manuel") return { issue: "en_attente", ...base };
    const v = verifier ? await verifier(transactionId) : await verifierSelon(p.prestataire, transactionId, p.ref_prestataire);
    if (v.statut === "ACCEPTED") {
      if (v.montant !== Number(p.montant) || v.devise !== p.devise) {
        await ex.requete("update paiements set reponse = $2, maj_le = now() where id = $1", [p.id, JSON.stringify(v.brut)]);
        return { issue: "anomalie", ...base };
      }
      return { issue: "accepte", ...base, ...(await accepter(ex, p, v.methode, v.brut)) };
    }
    if (v.statut === "REFUSED") {
      await ex.requete("update paiements set statut = 'refuse', methode = $2, reponse = $3, maj_le = now() where id = $1", [p.id, v.methode, JSON.stringify(v.brut)]);
      return { issue: "refuse", ...base };
    }
    await ex.requete("update paiements set reponse = $2, maj_le = now() where id = $1", [p.id, JSON.stringify(v.brut)]);
    return { issue: "en_attente", ...base };
  });
}

/**
 * Activation manuelle par l'administration : paiement reçu hors ligne (dépôt Mobile Money, virement, geste commercial).
 * Crée un paiement « manuel » accepté, avec reçu, et prolonge l'abonnement comme un paiement en ligne.
 */
export async function activerManuellement(d: { utilisateurId: number; application: string; formule: Formule; montant: number; devise: Devise; note: string; parAdmin: string }): Promise<ResultatSynchro> {
  if (!offre(d.application, d.formule)) throw new Error("Offre inconnue.");
  if (!Number.isInteger(d.montant) || d.montant < 0) throw new Error("Montant invalide.");
  const transactionId = nouvelId("SELM");
  return db().transaction(async ex => {
    const [p] = await ex.requete<{ id: string; utilisateur_id: string; application: string; formule: Formule }>(
      "insert into paiements (transaction_id, utilisateur_id, application, formule, montant, devise, prestataire) values ($1, $2, $3, $4, $5, $6, 'manuel') returning id, utilisateur_id, application, formule",
      [transactionId, d.utilisateurId, d.application, d.formule, d.montant, d.devise]);
    const r = await accepter(ex, p, "activation manuelle", { note: d.note, par: d.parAdmin, le: new Date().toISOString() });
    return { issue: "accepte" as const, utilisateurId: d.utilisateurId, application: d.application, ...r };
  });
}

/**
 * Supprime les paiements d'essai (clés de test) et les accès qu'ils ont ouverts ; si plus aucun paiement réel n'existe,
 * la numérotation des reçus repart à 000001.
 */
export async function purgerEssais(): Promise<{ paiements: number; abonnements: number; numerotationRemiseAZero: boolean }> {
  return db().transaction(async ex => {
    const touches = await ex.requete<{ utilisateur_id: string; application: string }>(
      "select distinct utilisateur_id, application from paiements where essai");
    const supp = await ex.requete<{ id: string }>("delete from paiements where essai returning id");
    let abonnements = 0;
    for (const t of touches) {
      const [reel] = await ex.requete<{ fin: Date | null }>(
        `select max(paye_le + make_interval(days => case formule when 'annuel' then 365 else 30 end)) as fin
         from paiements where utilisateur_id = $1 and application = $2 and statut = 'accepte'`, [t.utilisateur_id, t.application]);
      if (!reel?.fin) {
        abonnements += (await ex.requete("delete from abonnements where utilisateur_id = $1 and application = $2 returning 1", [t.utilisateur_id, t.application])).length;
        await ex.requete("delete from rappels where utilisateur_id = $1 and application = $2", [t.utilisateur_id, t.application]);
      }
    }
    const [{ n }] = await ex.requete<{ n: number }>("select count(*)::int as n from paiements where numero_recu is not null");
    if (n === 0) await ex.requete("select setval('recus_seq', 1, false)");
    return { paiements: supp.length, abonnements, numerotationRemiseAZero: n === 0 };
  });
}

/** Date de fin d'un abonnement actif, ou null. */
export async function abonnementActif(utilisateurId: number, application: string): Promise<Date | null> {
  const [r] = await db().requete<{ fin: Date }>("select fin from abonnements where utilisateur_id = $1 and application = $2 and fin > now()", [utilisateurId, application]);
  return r ? new Date(r.fin) : null;
}

const COLONNES = "id, transaction_id, application, formule, montant, devise, statut, numero_recu, cree_le, paye_le, methode, prestataire, essai";
export interface LignePaiement { id: number; transaction_id: string; application: string; formule: Formule; montant: number; devise: string; statut: string; numero_recu: string | null; cree_le: Date; paye_le: Date | null; methode: string | null; prestataire: string; essai: boolean }
export async function paiementsDe(utilisateurId: number): Promise<LignePaiement[]> {
  return db().requete<LignePaiement & Record<string, unknown>>(`select ${COLONNES} from paiements where utilisateur_id = $1 order by cree_le desc limit 50`, [utilisateurId]);
}
export async function abonnementsDe(utilisateurId: number): Promise<{ application: string; fin: Date }[]> {
  return db().requete<{ application: string; fin: Date }>("select application, fin from abonnements where utilisateur_id = $1 order by application", [utilisateurId]);
}
export async function paiementDe(utilisateurId: number, transactionId: string): Promise<LignePaiement | null> {
  const [p] = await db().requete<LignePaiement & Record<string, unknown>>(`select ${COLONNES} from paiements where utilisateur_id = $1 and transaction_id = $2`, [utilisateurId, transactionId]);
  return p ?? null;
}

/** Administration : paiements d'une période (AAAA-MM) ou les plus récents, avec l'adresse du client. */
export interface LigneAdmin extends LignePaiement { email: string; ref_prestataire: string | null }
export async function paiementsAdmin(mois: string | null, limite = 500): Promise<LigneAdmin[]> {
  const filtre = mois ? "where to_char(coalesce(p.paye_le, p.cree_le) at time zone 'Africa/Douala', 'YYYY-MM') = $1" : "";
  return db().requete<LigneAdmin & Record<string, unknown>>(
    `select p.${COLONNES.split(", ").join(", p.")}, p.ref_prestataire, u.email from paiements p join utilisateurs u on u.id = p.utilisateur_id
     ${filtre} order by coalesce(p.paye_le, p.cree_le) desc limit ${Math.max(1, Math.min(5000, limite))}`, mois ? [mois] : []);
}
