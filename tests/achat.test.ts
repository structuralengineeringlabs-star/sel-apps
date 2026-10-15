import { beforeEach, describe, expect, it, vi } from "vitest";
import type { PGlite } from "@electric-sql/pglite";
import { baseDeTest } from "./base";
import { POST as initier } from "@/app/api/paiement/initier/route";
import { GET as retour } from "@/app/api/paiement/retour/route";
import { consommerAchat, creerPaiement, purgerAbandons } from "@/lib/serveur/abonnements";
import { creerSession, marquerVerifie, utilisateurDeJeton, utilisateurPourAchat, utilisateurPourEmail, COOKIE_SESSION } from "@/lib/serveur/session";
import { demanderLien, verifierCode, consommerLien, MAX_ESSAIS_CODE } from "@/lib/serveur/lien-connexion";
import { empreinte } from "@/lib/serveur/jetons";
import { COOKIE_ACHAT } from "@/lib/serveur/achat";
import type { Courriel } from "@/lib/serveur/courriel";

delete process.env.NOTCHPAY_PUBLIC_KEY; process.env.PAIEMENT_PRESTATAIRE = "cinetpay";
process.env.CINETPAY_API_KEY = "cle"; process.env.CINETPAY_SITE_ID = "123"; process.env.CINETPAY_SECRET_KEY = "secret";
delete process.env.TARIF_ESSAI;

const SITE = "https://sel-apps.com";
function commande(champs: Record<string, string>, cookie?: string) {
  const f = new FormData();
  for (const [k, v] of Object.entries({ application: "reservoirs", formule: "annuel", pays: "CM", cgv: "oui", ...champs })) f.set(k, v);
  return initier(new Request(`${SITE}/api/paiement/initier`, { method: "POST", body: f, headers: { origin: SITE, host: "sel-apps.com", ...(cookie ? { cookie } : {}) } }));
}
const cookieDe = (r: Response, nom: string) => {
  const l = r.headers.getSetCookie().find(c => c.startsWith(`${nom}=`));
  return l ? decodeURIComponent(l.slice(nom.length + 1).split(";")[0]) : null;
};

let pg: PGlite;
beforeEach(async () => {
  pg = await baseDeTest();
  vi.spyOn(globalThis, "fetch").mockImplementation(async () => new Response(JSON.stringify({ code: "201", data: { payment_url: "https://checkout.cinetpay/x" } })));
});

describe("achat sans connexion préalable", () => {
  it("adresse nouvelle : compte non vérifié, jeton d'achat au navigateur, connexion au retour (une seule fois)", async () => {
    const r = await commande({ email: " Nouveau@Exemple.CM " });
    expect(r.status).toBe(303);
    expect(r.headers.get("location")).toBe("https://checkout.cinetpay/x");
    const jeton = cookieDe(r, COOKIE_ACHAT)!;
    expect(jeton).toBeTruthy();
    expect(r.headers.getSetCookie().find(c => c.startsWith(COOKIE_ACHAT))).toMatch(/HttpOnly/i);
    const [u] = (await pg.query<{ id: number; email_verifie: boolean }>("select id, email_verifie from utilisateurs where email = 'nouveau@exemple.cm'")).rows;
    expect(u.email_verifie).toBe(false);
    const [p] = (await pg.query<{ transaction_id: string; achat_hash: string }>("select transaction_id, achat_hash from paiements")).rows;
    expect(p.achat_hash).toBe(empreinte(jeton));

    const rt = await retour(new Request(`${SITE}/api/paiement/retour?transaction=${p.transaction_id}`, { headers: { cookie: `${COOKIE_ACHAT}=${jeton}`, host: "sel-apps.com" } }));
    expect(rt.headers.get("location")).toBe(`${SITE}/compte/paiement/${p.transaction_id}`);
    const session = cookieDe(rt, COOKIE_SESSION)!;
    expect((await utilisateurDeJeton(session))?.email).toBe("nouveau@exemple.cm");
    expect(cookieDe(rt, COOKIE_ACHAT)).toBe("");
    // Rejeu du même jeton : aucune nouvelle session
    const rt2 = await retour(new Request(`${SITE}/api/paiement/retour?transaction=${p.transaction_id}`, { headers: { cookie: `${COOKIE_ACHAT}=${jeton}` } }));
    expect(cookieDe(rt2, COOKIE_SESSION)).toBeNull();
  });

  it("adresse déjà inscrite : commande rattachée au compte, aucun jeton ni session (pas de prise de compte)", async () => {
    const id = await utilisateurPourEmail("client@exemple.cm");
    const r = await commande({ email: "client@exemple.cm" });
    expect(r.status).toBe(303);
    expect(cookieDe(r, COOKIE_ACHAT)).toBeNull();
    const [p] = (await pg.query<{ utilisateur_id: number; achat_hash: string | null; transaction_id: string }>("select utilisateur_id, achat_hash, transaction_id from paiements")).rows;
    expect(Number(p.utilisateur_id)).toBe(id);
    expect(p.achat_hash).toBeNull();
    const rt = await retour(new Request(`${SITE}/api/paiement/retour?transaction=${p.transaction_id}`, { headers: { cookie: `${COOKIE_ACHAT}=nimporte` } }));
    expect(cookieDe(rt, COOKIE_SESSION)).toBeNull();
  });

  it("client connecté : la session prime sur l'adresse saisie", async () => {
    const id = await utilisateurPourEmail("connecte@exemple.cm");
    const s = await creerSession(id);
    const r = await commande({ email: "autre@exemple.cm" }, `${COOKIE_SESSION}=${s.jeton}`);
    expect(r.status).toBe(303);
    expect(cookieDe(r, COOKIE_ACHAT)).toBeNull();
    expect((await pg.query("select 1 from utilisateurs where email = 'autre@exemple.cm'")).rows).toHaveLength(0);
  });

  it("adresse invalide ou CGV non acceptées : retour au portail avec les choix conservés", async () => {
    const r = await commande({ email: "pas-une-adresse", formule: "mensuel", pays: "SN" });
    expect(r.headers.get("location")).toBe(`${SITE}/applications/reservoirs?erreur=email&formule=mensuel&pays=SN#souscrire`);
    const c = await commande({ email: "a@b.cm", cgv: "" });
    expect(c.headers.get("location")).toContain("erreur=cgv");
    expect((await pg.query("select 1 from paiements")).rows).toHaveLength(0);
  });

  it("vérification de l'adresse par son titulaire : sessions invité révoquées, jeton d'achat devenu inutilisable", async () => {
    const a = await utilisateurPourAchat("tiers@exemple.cm");
    expect(a.nouveau).toBe(true);
    const p = await creerPaiement(a.id, "reservoirs", "mensuel", "cinetpay", "XAF", empreinte("jeton-x"));
    const invite = await creerSession(a.id, true);
    await marquerVerifie(a.id);
    expect(await utilisateurDeJeton(invite.jeton)).toBeNull();
    expect(await consommerAchat(p.transactionId, empreinte("jeton-x"))).toBeNull();
    expect((await utilisateurPourAchat("tiers@exemple.cm")).nouveau).toBe(false);
  });

  it("purge : comptes d'achat jamais payés supprimés, comptes vérifiés conservés", async () => {
    const a = await utilisateurPourAchat("abandon@exemple.cm");
    await creerPaiement(a.id, "reservoirs", "mensuel", "cinetpay");
    await utilisateurPourEmail("garde@exemple.cm");
    await pg.query("update paiements set cree_le = now() - interval '2 hours'");
    await pg.query("update utilisateurs set cree_le = now() - interval '2 hours'");
    expect(await purgerAbandons()).toBe(1);
    const emails = (await pg.query<{ email: string }>("select email from utilisateurs")).rows.map(r => r.email);
    expect(emails).toEqual(["garde@exemple.cm"]);
  });
});

describe("code de connexion à 6 chiffres", () => {
  const demander = async (email: string) => {
    const recus: Courriel[] = [];
    await demanderLien(email, "/applications/buses?onglet=3", "https://site", async c => { recus.push(c); });
    const code = /code de connexion : (\d{3}) (\d{3})/.exec(recus[0].texte)!;
    return { code: code[1] + code[2], jeton: decodeURIComponent(/jeton=([^\s"]+)/.exec(recus[0].texte)![1]), courriel: recus[0] };
  };
  it("le bon code connecte une fois et consomme aussi le lien ; le code n'est pas stocké en clair", async () => {
    const { code, jeton, courriel } = await demander("Code@Exemple.cm");
    expect(courriel.sujet).toContain(`${code.slice(0, 3)} ${code.slice(3)}`);
    const [l] = (await pg.query<{ code_hash: string }>("select code_hash from liens_connexion")).rows;
    expect(l.code_hash).not.toContain(code);
    expect(await verifierCode("code@exemple.cm", `${code.slice(0, 3)} ${code.slice(3)}`)).toEqual({ email: "code@exemple.cm", retour: "/applications/buses?onglet=3" });
    expect(await verifierCode("code@exemple.cm", code)).toBeNull();
    expect(await consommerLien(jeton)).toBeNull();
  });
  it(`${MAX_ESSAIS_CODE} essais au plus : ensuite même le bon code est refusé`, async () => {
    const { code } = await demander("essais@exemple.cm");
    const faux = code === "000000" ? "111111" : "000000";
    for (let i = 0; i < MAX_ESSAIS_CODE; i++) expect(await verifierCode("essais@exemple.cm", faux)).toBeNull();
    expect(await verifierCode("essais@exemple.cm", code)).toBeNull();
  });
  it("le code d'une adresse ne connecte pas une autre adresse", async () => {
    const { code } = await demander("a@exemple.cm");
    await demander("b@exemple.cm");
    expect(await verifierCode("b@exemple.cm", code)).toBeNull();
  });
});
