import { beforeEach, describe, expect, it } from "vitest";
import { baseDeTest } from "./base";
import { creerPaiement, synchroniserPaiement, abonnementActif, activerManuellement, purgerEssais, purgerAbandons, paiementsAdmin, TropDeCommandes, LIMITE_COMMANDES } from "@/lib/serveur/abonnements";
import { utilisateurPourEmail } from "@/lib/serveur/session";
import { estAdmin, ligneCsv } from "@/lib/serveur/admin";
import { sslStrict } from "@/lib/serveur/db";
import { offre, tarifEssai, estPays, PAYS } from "@/lib/offres";
import type { Verification } from "@/lib/serveur/cinetpay";
import type { PGlite } from "@electric-sql/pglite";

process.env.PAIEMENT_PRESTATAIRE = "cinetpay";
const ok = (montant: number, devise = "XAF") => async (): Promise<Verification> => ({ code: "00", statut: "ACCEPTED", montant, devise, methode: "OM", brut: {} });

describe("offres : pays, devises, tarif d'essai", () => {
  it("Cameroun en XAF, Côte d'Ivoire et Sénégal en XOF ; pays inconnu refusé", () => {
    expect(PAYS.CM.devise).toBe("XAF"); expect(PAYS.CI.devise).toBe("XOF"); expect(PAYS.SN.devise).toBe("XOF");
    expect(estPays("CI")).toBe(true); expect(estPays("FR")).toBe(false); expect(estPays("toString")).toBe(false);
  });
  it("TARIF_ESSAI remplace tous les prix, puis les prix normaux reviennent", () => {
    process.env.TARIF_ESSAI = "100";
    expect(tarifEssai()).toBe(100);
    expect(offre("reservoirs", "annuel")).toMatchObject({ montant: 100, jours: 365, essai: true });
    process.env.TARIF_ESSAI = "abc"; expect(tarifEssai()).toBeNull();
    delete process.env.TARIF_ESSAI;
    expect(offre("reservoirs", "annuel")).toMatchObject({ montant: 500000, essai: false });
  });
});

describe("base de données", () => {
  it("sslmode=require → verify-full (même sécurité, sans avertissement) ; autres paramètres conservés", () => {
    expect(sslStrict("postgres://u:p@h/db?sslmode=require&channel_binding=require")).toBe("postgres://u:p@h/db?sslmode=verify-full&channel_binding=require");
    expect(sslStrict("postgres://u:p@h/db?a=1&sslmode=prefer")).toBe("postgres://u:p@h/db?a=1&sslmode=verify-full");
    expect(sslStrict("postgres://u:p@h/db")).toBe("postgres://u:p@h/db");
  });
});

describe("administration : accès et export", () => {
  it("ADMIN_EMAILS : liste séparée par des virgules, sans tenir compte de la casse", () => {
    process.env.ADMIN_EMAILS = " Admin@Sel-Apps.com , autre@x.cm";
    expect(estAdmin("admin@sel-apps.com")).toBe(true);
    expect(estAdmin("intrus@x.cm")).toBe(false);
    expect(estAdmin(null)).toBe(false);
    delete process.env.ADMIN_EMAILS;
    expect(estAdmin("admin@sel-apps.com")).toBe(false);
  });
  it("CSV : séparateur « ; », guillemets, formules de tableur neutralisées", () => {
    expect(ligneCsv(["a", 1, null, "x;y", 'dit "oui"', "=1+1"])).toBe(`a;1;;"x;y";"dit ""oui""";'=1+1`);
  });
});

describe("paiements : devise, limite, activation manuelle, purge", () => {
  let pg: PGlite;
  beforeEach(async () => { pg = await baseDeTest(); });

  it("commande en XOF : la confirmation doit être en XOF (XAF → anomalie)", async () => {
    const u = await utilisateurPourEmail("ci@exemple.ci", null);
    const p = await creerPaiement(u, "reservoirs", "mensuel", "cinetpay", "XOF");
    expect(p.devise).toBe("XOF");
    expect((await synchroniserPaiement(p.transactionId, ok(50000, "XAF"))).issue).toBe("anomalie");
    expect((await synchroniserPaiement(p.transactionId, ok(50000, "XOF"))).issue).toBe("accepte");
  });

  it(`au plus ${LIMITE_COMMANDES} commandes en 10 minutes par utilisateur`, async () => {
    const u = await utilisateurPourEmail("rafale@exemple.cm", null);
    for (let i = 0; i < LIMITE_COMMANDES; i++) await creerPaiement(u, "reservoirs", "mensuel");
    await expect(creerPaiement(u, "reservoirs", "mensuel")).rejects.toBeInstanceOf(TropDeCommandes);
  });

  it("activation manuelle : reçu, accès prolongé, jamais revérifiée auprès d'un prestataire", async () => {
    const u = await utilisateurPourEmail("hors-ligne@exemple.cm", null);
    const r = await activerManuellement({ utilisateurId: u, application: "reservoirs", formule: "annuel", montant: 500000, devise: "XAF", note: "dépôt MoMo 123", parAdmin: "admin@sel-apps.com" });
    expect(r.numeroRecu).toMatch(/^SEL-R-\d{4}-000001$/);
    expect(((await abonnementActif(u, "reservoirs"))!.getTime() - Date.now()) / 86400e3).toBeCloseTo(365, 1);
    const [l] = await paiementsAdmin(null);
    expect(l).toMatchObject({ prestataire: "manuel", statut: "accepte", email: "hors-ligne@exemple.cm" });
  });

  it("purge : supprime essais et accès d'essai, garde les paiements réels, remet la numérotation à zéro s'il n'en reste aucun", async () => {
    const t = await utilisateurPourEmail("test@exemple.cm", null), r = await utilisateurPourEmail("reel@exemple.cm", null);
    const pt = await creerPaiement(t, "reservoirs", "mensuel");
    await pg.query("update paiements set essai = true where transaction_id = $1", [pt.transactionId]);
    await synchroniserPaiement(pt.transactionId, ok(50000));
    expect(await abonnementActif(t, "reservoirs")).not.toBeNull();
    let res = await purgerEssais();
    expect(res).toEqual({ paiements: 1, abonnements: 1, numerotationRemiseAZero: true });
    expect(await abonnementActif(t, "reservoirs")).toBeNull();
    const pr = await creerPaiement(r, "reservoirs", "mensuel");
    expect((await synchroniserPaiement(pr.transactionId, ok(50000))).numeroRecu).toMatch(/-000001$/);
    const pt2 = await creerPaiement(t, "reservoirs", "mensuel");
    await pg.query("update paiements set essai = true where transaction_id = $1", [pt2.transactionId]);
    await synchroniserPaiement(pt2.transactionId, ok(50000));
    res = await purgerEssais();
    expect(res).toMatchObject({ paiements: 1, numerotationRemiseAZero: false });
    expect(await abonnementActif(r, "reservoirs")).not.toBeNull();
    const pr2 = await creerPaiement(r, "reservoirs", "annuel");
    expect((await synchroniserPaiement(pr2.transactionId, ok(500000))).numeroRecu).toMatch(/-000003$/);
  });

  it("commandes abandonnées : supprime les non payées de plus d'une heure, jamais les payées ni les récentes", async () => {
    const u = await utilisateurPourEmail("panier@exemple.cm", null);
    const vieille = await creerPaiement(u, "reservoirs", "mensuel", "cinetpay");
    const recente = await creerPaiement(u, "reservoirs", "mensuel", "cinetpay");
    const payee = await creerPaiement(u, "reservoirs", "mensuel", "cinetpay");
    await synchroniserPaiement(payee.transactionId, ok(50000));
    await pg.query("update paiements set cree_le = now() - interval '2 hours' where transaction_id in ($1, $2)", [vieille.transactionId, payee.transactionId]);
    expect(await purgerAbandons()).toBe(1);
    const restants = (await paiementsAdmin(null)).map(p => p.transaction_id).sort();
    expect(restants).toEqual([recente.transactionId, payee.transactionId].sort());
  });
});
