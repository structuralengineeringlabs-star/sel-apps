import { beforeEach, describe, expect, it, vi } from "vitest";
import { baseDeTest } from "./base";
import { signatureNotch } from "@/lib/serveur/notchpay";
import { creerPaiement, enregistrerRefPrestataire, abonnementActif } from "@/lib/serveur/abonnements";
import { utilisateurPourEmail } from "@/lib/serveur/session";
import { POST as notificationNotch } from "@/app/api/paiement/notchpay/route";
import { GET as cron } from "@/app/api/cron/rappels/route";

process.env.NOTCHPAY_PUBLIC_KEY = "pk_test_cle";
process.env.NOTCHPAY_HASH = "hash_secret";
const appel = (corps: string, signature?: string) =>
  notificationNotch(new Request("https://sel-apps.com/api/paiement/notchpay", { method: "POST", body: corps, headers: signature ? { "x-notch-signature": signature } : {} }));

describe("route de notification Notch Pay", () => {
  beforeEach(async () => { await baseDeTest(); });
  it("signature absente ou fausse → 403, aucun accès", async () => {
    const corps = JSON.stringify({ event: "payment.complete", data: { reference: "trx.1" } });
    expect((await appel(corps)).status).toBe(403);
    expect((await appel(corps, signatureNotch(corps, "autre"))).status).toBe(403);
  });
  it("signature valide, paiement étranger au site → 200 sans effet", async () => {
    const corps = JSON.stringify({ event: "payment.complete", data: { reference: "trx.inconnue" } });
    expect((await appel(corps, signatureNotch(corps, "hash_secret"))).status).toBe(200);
  });
  it("signature valide → statut relu chez Notch Pay → accès ouvert (le contenu du message n'est pas cru)", async () => {
    const u = await utilisateurPourEmail("webhook@exemple.cm", null);
    const p = await creerPaiement(u, "reservoirs", "mensuel", "notchpay");
    await enregistrerRefPrestataire(p.transactionId, "trx.wh1");
    const f = vi.spyOn(globalThis, "fetch").mockImplementation(async u =>
      String(u).includes("api.notchpay.co/payments/trx.wh1")
        ? new Response(JSON.stringify({ transaction: { status: "complete", amount: 50000, currency: "XAF" } }), { status: 202 })
        : new Response("{}", { status: 500 }));
    try {
      const corps = JSON.stringify({ event: "payment.complete", data: { reference: "trx.wh1", merchant_reference: p.transactionId } });
      expect((await appel(corps, signatureNotch(corps, "hash_secret"))).status).toBe(200);
      expect(await abonnementActif(u, "reservoirs")).not.toBeNull();
    } finally { f.mockRestore(); }
  });
});

describe("route des rappels", () => {
  it("sans CRON_SECRET → 503 ; mauvais secret → 401", async () => {
    delete process.env.CRON_SECRET;
    expect((await cron(new Request("https://sel-apps.com/api/cron/rappels"))).status).toBe(503);
    process.env.CRON_SECRET = "s3cret";
    expect((await cron(new Request("https://sel-apps.com/api/cron/rappels", { headers: { Authorization: "Bearer faux" } }))).status).toBe(401);
  });
});
