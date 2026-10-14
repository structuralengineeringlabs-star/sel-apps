import { beforeEach, describe, expect, it } from "vitest";
import { createHmac } from "crypto";
import { baseDeTest } from "./base";
import { jetonHmac, xTokenValide, CHAMPS_HMAC, initialiser, type Verification } from "@/lib/serveur/cinetpay";
import { creerPaiement, synchroniserPaiement, abonnementActif } from "@/lib/serveur/abonnements";
import { utilisateurPourEmail } from "@/lib/serveur/session";
import { offre } from "@/lib/offres";
import type { PGlite } from "@electric-sql/pglite";

process.env.CINETPAY_API_KEY = "cle"; process.env.CINETPAY_SITE_ID = "123"; process.env.CINETPAY_SECRET_KEY = "secret";

const champs = { cpm_site_id: "123", cpm_trans_id: "SELX1", cpm_trans_date: "2026-10-14 12:00:00", cpm_amount: "50000", cpm_currency: "XAF", signature: "abc", payment_method: "OM",
  cel_phone_num: "650000000", cpm_phone_prefixe: "237", cpm_language: "fr", cpm_version: "V4", cpm_payment_config: "Single", cpm_page_action: "PAYMENT", cpm_custom: "", cpm_designation: "Abonnement", cpm_error_message: "" };
const reponse = (statut: string, montant = 50000, devise = "XAF") => async (): Promise<Verification> => ({ code: statut === "ACCEPTED" ? "00" : "627", statut, montant, devise, methode: "OM", brut: { statut } });

describe("CinetPay : jeton HMAC des notifications", () => {
  it("HMAC-SHA256 hexadécimal des 16 champs concaténés dans l'ordre de la documentation", () => {
    const attendu = createHmac("sha256", "secret").update(CHAMPS_HMAC.map(k => (champs as Record<string, string>)[k]).join("")).digest("hex");
    expect(jetonHmac(champs, "secret")).toBe(attendu);
    // Valeur calculée indépendamment (Python : hmac.new(b"secret", "".join(champs).encode(), hashlib.sha256).hexdigest())
    expect(jetonHmac(champs, "secret")).toBe("1bc58ac1967ad692ada2afb3830c70aab9d2140c78fceedcb0f7a1027c535b9f");
  });
  it("rejette un jeton absent, faux, ou calculé avec une autre clé ; accepte la casse majuscule", () => {
    const bon = jetonHmac(champs, "secret");
    expect(xTokenValide(champs, bon, "secret")).toBe(true);
    expect(xTokenValide(champs, bon.toUpperCase(), "secret")).toBe(true);
    expect(xTokenValide(champs, null, "secret")).toBe(false);
    expect(xTokenValide(champs, jetonHmac(champs, "autre"), "secret")).toBe(false);
    expect(xTokenValide({ ...champs, cpm_amount: "5" }, bon, "secret")).toBe(false);
  });
  it("initialisation : refuse un montant non multiple de 5, transmet XAF et les adresses", async () => {
    await expect(initialiser({ transactionId: "T", montant: 50001, description: "x", notifyUrl: "n", returnUrl: "r", client: { email: "a@b.cm", nom: null } }, async () => new Response("{}"))).rejects.toThrow(/multiple de 5/);
    let corps: Record<string, unknown> = {};
    const r = await initialiser({ transactionId: "T1", montant: 50000, description: "Abonnement", notifyUrl: "https://s/n", returnUrl: "https://s/r", client: { email: "a@b.cm", nom: "Jean Dupont" } },
      async (_u, init) => { corps = JSON.parse(String(init?.body)); return new Response(JSON.stringify({ code: "201", data: { payment_url: "https://checkout/x" } })); });
    expect(r.paymentUrl).toBe("https://checkout/x");
    expect(corps).toMatchObject({ amount: 50000, currency: "XAF", site_id: "123", transaction_id: "T1", notify_url: "https://s/n", return_url: "https://s/r", customer_surname: "Jean", customer_name: "Dupont" });
  });
});

describe("abonnements", () => {
  let pg: PGlite;
  beforeEach(async () => { pg = await baseDeTest(); });
  it("tarifs TTC de Réservoirs : 50 000 / 500 000 XAF, 30 / 365 jours", () => {
    expect(offre("reservoirs", "mensuel")).toMatchObject({ montant: 50000, jours: 30 });
    expect(offre("reservoirs", "annuel")).toMatchObject({ montant: 500000, jours: 365 });
    expect(offre("calcul-poutres", "mensuel")).toBeNull(); // application gratuite : pas d'offre
  });
  it("paiement accepté → accès 30 jours, reçu numéroté ; notification répétée sans double prolongation", async () => {
    const u = await utilisateurPourEmail("Client@Exemple.cm", "Client");
    const { transactionId } = await creerPaiement(u, "reservoirs", "mensuel");
    expect(await abonnementActif(u, "reservoirs")).toBeNull();
    const r1 = await synchroniserPaiement(transactionId, reponse("ACCEPTED"));
    expect(r1.issue).toBe("accepte");
    expect(r1.numeroRecu).toMatch(/^SEL-R-\d{4}-000001$/);
    const fin1 = await abonnementActif(u, "reservoirs");
    expect((fin1!.getTime() - Date.now()) / 86400e3).toBeCloseTo(30, 1);
    const r2 = await synchroniserPaiement(transactionId, reponse("ACCEPTED"));
    expect(r2.issue).toBe("deja_accepte");
    expect((await abonnementActif(u, "reservoirs"))!.getTime()).toBe(fin1!.getTime());
  });
  it("renouvellement : prolonge à partir de la fin en cours (30 + 365 jours)", async () => {
    const u = await utilisateurPourEmail("a@b.cm");
    const p1 = await creerPaiement(u, "reservoirs", "mensuel"), p2 = await creerPaiement(u, "reservoirs", "annuel");
    await synchroniserPaiement(p1.transactionId, reponse("ACCEPTED"));
    await synchroniserPaiement(p2.transactionId, reponse("ACCEPTED", 500000));
    expect(((await abonnementActif(u, "reservoirs"))!.getTime() - Date.now()) / 86400e3).toBeCloseTo(395, 1);
  });
  it("montant ou devise différents de la commande : pas d'activation (anomalie)", async () => {
    const u = await utilisateurPourEmail("a@b.cm");
    const p = await creerPaiement(u, "reservoirs", "annuel");
    expect((await synchroniserPaiement(p.transactionId, reponse("ACCEPTED", 50000))).issue).toBe("anomalie");
    expect((await synchroniserPaiement(p.transactionId, reponse("ACCEPTED", 500000, "XOF"))).issue).toBe("anomalie");
    expect(await abonnementActif(u, "reservoirs")).toBeNull();
  });
  it("refusé ou en attente : pas d'accès ; transaction inconnue ignorée", async () => {
    const u = await utilisateurPourEmail("a@b.cm");
    const p = await creerPaiement(u, "reservoirs", "mensuel");
    expect((await synchroniserPaiement(p.transactionId, reponse("WAITING_FOR_CUSTOMER"))).issue).toBe("en_attente");
    expect((await synchroniserPaiement(p.transactionId, reponse("REFUSED"))).issue).toBe("refuse");
    expect(await abonnementActif(u, "reservoirs")).toBeNull();
    expect((await synchroniserPaiement("INCONNU", reponse("ACCEPTED"))).issue).toBe("inconnu");
    expect((await pg.query("select count(*)::int as n from abonnements")).rows[0]).toEqual({ n: 0 });
  });
  it("abonnement expiré : plus d'accès", async () => {
    const u = await utilisateurPourEmail("a@b.cm");
    await pg.query("insert into abonnements (utilisateur_id, application, fin) values ($1, 'reservoirs', now() - interval '1 second')", [u]);
    expect(await abonnementActif(u, "reservoirs")).toBeNull();
  });
});
