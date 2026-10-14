import { beforeEach, describe, expect, it, vi } from "vitest";
import { createHmac } from "crypto";
import { baseDeTest } from "./base";
import { initialiserNotch, verifierNotch, signatureNotch, signatureNotchValide } from "@/lib/serveur/notchpay";
import { creerPaiement, enregistrerRefPrestataire, synchroniserPaiement, abonnementActif, transactionPourReferences } from "@/lib/serveur/abonnements";
import { prestataireActif } from "@/lib/serveur/prestataires";
import { utilisateurPourEmail } from "@/lib/serveur/session";

process.env.NOTCHPAY_PUBLIC_KEY = "pk_test_cle";
process.env.NOTCHPAY_HASH = "hash_secret";

const json = (o: unknown, status = 200) => new Response(JSON.stringify(o), { status, headers: { "Content-Type": "application/json" } });
const demande = { transactionId: "SELTEST1", montant: 50000, description: "Abonnement mensuel", notifyUrl: "n", returnUrl: "https://s/api/paiement/retour?transaction=SELTEST1", client: { email: "a@b.cm", nom: "Jean Dupont" } };

describe("Notch Pay : API", () => {
  it("initialisation : clé publique en Authorization, XAF, référence et adresse de retour", async () => {
    let url = "", init: RequestInit | undefined;
    const r = await initialiserNotch(demande, async (u, i) => { url = String(u); init = i; return json({ status: "Accepted", authorization_url: "https://pay.notchpay.co/pay_1", transaction: { reference: "trx.abc" } }, 201); });
    expect(url).toBe("https://api.notchpay.co/payments");
    expect((init!.headers as Record<string, string>).Authorization).toBe("pk_test_cle");
    expect(JSON.parse(String(init!.body))).toMatchObject({ amount: 50000, currency: "XAF", email: "a@b.cm", reference: "SELTEST1", callback: demande.returnUrl, customer: { name: "Jean Dupont" } });
    expect(r).toEqual({ paymentUrl: "https://pay.notchpay.co/pay_1", reference: "trx.abc" });
  });
  it("initialisation refusée : message d'erreur", async () => {
    await expect(initialiserNotch(demande, async () => json({ message: "Invalid key" }, 401))).rejects.toThrow(/Notch Pay : 401 Invalid key/);
  });
  it("lecture : complete → ACCEPTED ; failed/canceled/expired → REFUSED ; pending → attente", async () => {
    const lire = (status: string) => verifierNotch("trx.abc", async () => json({ transaction: { status, amount: 50000, currency: "XAF", payment_method: "cm.mtn" } }, 202));
    expect(await lire("complete")).toMatchObject({ statut: "ACCEPTED", montant: 50000, devise: "XAF", methode: "MTN Mobile Money" });
    expect((await verifierNotch("trx.abc", async () => json({ transaction: { status: "complete", amount: 1, currency: "XAF", payment_method: "pm.test_zbY" } }))).methode).toBeNull();
    for (const s of ["failed", "canceled", "expired"]) expect((await lire(s)).statut).toBe("REFUSED");
    expect((await lire("pending")).statut).toBe("PENDING");
  });
  it("signature des notifications : HMAC-SHA256 hexadécimal du corps brut", () => {
    const corps = '{"event":"payment.complete","data":{"reference":"trx.abc"}}';
    const attendu = createHmac("sha256", "hash_secret").update(corps).digest("hex");
    expect(signatureNotch(corps, "hash_secret")).toBe(attendu);
    expect(signatureNotchValide(corps, attendu, "hash_secret")).toBe(true);
    expect(signatureNotchValide(corps + " ", attendu, "hash_secret")).toBe(false);
    expect(signatureNotchValide(corps, null, "hash_secret")).toBe(false);
  });
  it("prestataire actif : Notch Pay dès que sa clé est présente, sauf choix explicite", () => {
    expect(prestataireActif()).toBe("notchpay");
    process.env.PAIEMENT_PRESTATAIRE = "cinetpay"; expect(prestataireActif()).toBe("cinetpay");
    delete process.env.PAIEMENT_PRESTATAIRE;
  });
});

describe("Notch Pay : abonnement", () => {
  beforeEach(async () => { await baseDeTest(); });
  it("paiement Notch Pay confirmé par l'API → accès 30 jours ; lecture faite avec la référence Notch Pay", async () => {
    const u = await utilisateurPourEmail("np@exemple.cm", null);
    const p = await creerPaiement(u, "reservoirs", "mensuel");
    expect(p.prestataire).toBe("notchpay");
    await enregistrerRefPrestataire(p.transactionId, "trx.np1");
    expect(await transactionPourReferences(["trx.np1"])).toBe(p.transactionId);
    expect(await transactionPourReferences([p.transactionId])).toBe(p.transactionId);
    const appels: string[] = [];
    const f = vi.spyOn(globalThis, "fetch").mockImplementation(async u => { appels.push(String(u)); return json({ transaction: { status: "complete", amount: 50000, currency: "XAF", payment_method: "cm.orange" } }, 202); });
    try {
      const r = await synchroniserPaiement(p.transactionId);
      expect(r.issue).toBe("accepte");
      expect(appels).toEqual(["https://api.notchpay.co/payments/trx.np1"]);
      expect((await abonnementActif(u, "reservoirs"))).not.toBeNull();
    } finally { f.mockRestore(); }
  });
  it("montant différent → anomalie, pas d'accès", async () => {
    const u = await utilisateurPourEmail("np2@exemple.cm", null);
    const p = await creerPaiement(u, "reservoirs", "annuel");
    await enregistrerRefPrestataire(p.transactionId, "trx.np2");
    const f = vi.spyOn(globalThis, "fetch").mockImplementation(async () => json({ transaction: { status: "complete", amount: 50000, currency: "XAF" } }, 202));
    try { expect((await synchroniserPaiement(p.transactionId)).issue).toBe("anomalie"); } finally { f.mockRestore(); }
    expect(await abonnementActif(u, "reservoirs")).toBeNull();
  });
});
