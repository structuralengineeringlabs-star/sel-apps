import { beforeEach, describe, expect, it } from "vitest";
import path from "path";
import type { PGlite } from "@electric-sql/pglite";
import { baseDeTest } from "./base";
import { demanderLien, consommerLien, MAX_DEMANDES } from "@/lib/serveur/lien-connexion";
import { utilisateurPourEmail, utilisateurDeJeton } from "@/lib/serveur/session";
import { empreinte, jetonAleatoire, defiPkce } from "@/lib/serveur/jetons";
import { envoyerRappels } from "@/lib/serveur/notifications";
import { resoudre } from "@/lib/serveur/fichiers-proteges";
import { cheminSur } from "@/lib/serveur/securite";
import type { Courriel } from "@/lib/serveur/courriel";

let pg: PGlite;
beforeEach(async () => { pg = await baseDeTest(); });

describe("connexion par lien e-mail", () => {
  it("envoie un lien de confirmation (jamais le jeton en clair dans la base), usage unique", async () => {
    const recus: Courriel[] = [];
    expect(await demanderLien(" Client@Exemple.CM ", "/apps/reservoirs", "https://site", async c => { recus.push(c); })).toBe("envoye");
    expect(recus[0].a).toBe("client@exemple.cm");
    const jeton = decodeURIComponent(/jeton=([^\s"]+)/.exec(recus[0].texte)![1]);
    expect(recus[0].texte).toContain("https://site/connexion/confirmer?jeton=");
    const stocke = (await pg.query<{ jeton_hash: string }>("select jeton_hash from liens_connexion")).rows[0].jeton_hash;
    expect(stocke).toBe(empreinte(jeton));
    expect(stocke).not.toContain(jeton);
    expect(await consommerLien(jeton)).toEqual({ email: "client@exemple.cm", retour: "/apps/reservoirs" });
    expect(await consommerLien(jeton)).toBeNull();
    expect(await consommerLien("faux")).toBeNull();
  });
  it("lien expiré refusé ; adresse invalide ; limite de demandes", async () => {
    const envoyer = async () => undefined;
    expect(await demanderLien("pas-une-adresse", "/", "https://s", envoyer)).toBe("invalide");
    for (let i = 0; i < MAX_DEMANDES; i++) expect(await demanderLien("a@b.cm", "/", "https://s", envoyer)).toBe("envoye");
    expect(await demanderLien("a@b.cm", "/", "https://s", envoyer)).toBe("trop_de_demandes");
    const j = jetonAleatoire();
    await pg.query("insert into liens_connexion (jeton_hash, email, expire_le) values ($1, 'x@y.cm', now() - interval '1 minute')", [empreinte(j)]);
    expect(await consommerLien(j)).toBeNull();
  });
});

describe("sessions et comptes", () => {
  it("une adresse = un compte ; le compte Google se lie au compte e-mail existant", async () => {
    const a = await utilisateurPourEmail("A@B.cm");
    const b = await utilisateurPourEmail("a@b.cm", "Awa Ngono", "google-123");
    expect(b).toBe(a);
    expect((await pg.query("select nom, google_sub from utilisateurs")).rows[0]).toEqual({ nom: "Awa Ngono", google_sub: "google-123" });
  });
  it("session valide, expirée ou inconnue", async () => {
    const u = await utilisateurPourEmail("a@b.cm");
    const j1 = jetonAleatoire(), j2 = jetonAleatoire();
    await pg.query("insert into sessions (jeton_hash, utilisateur_id, expire_le) values ($1, $2, now() + interval '1 day'), ($3, $2, now() - interval '1 second')", [empreinte(j1), u, empreinte(j2)]);
    expect((await utilisateurDeJeton(j1))?.email).toBe("a@b.cm");
    expect(await utilisateurDeJeton(j2)).toBeNull();
    expect(await utilisateurDeJeton("inconnu")).toBeNull();
  });
  it("PKCE S256 (RFC 7636, annexe B)", () => {
    expect(defiPkce("dBjftJeZ4CVP-mB92K27uhbUJU1p1r_wW1gFWFOEjXk")).toBe("E9Melhoa2OwvFrEMTJguCHaoeK1t8URWbuGJSstw-cM");
  });
});

describe("rappels d'échéance", () => {
  it("J-7 puis J-1, une seule fois par échéance", async () => {
    const u = await utilisateurPourEmail("a@b.cm");
    await pg.query("insert into abonnements (utilisateur_id, application, fin) values ($1, 'reservoirs', now() + interval '5 days')", [u]);
    const recus: Courriel[] = [];
    const envoyer = async (c: Courriel) => { recus.push(c); };
    expect(await envoyerRappels(envoyer)).toBe(1); // J7 seulement
    expect(await envoyerRappels(envoyer)).toBe(0);
    await pg.query("update abonnements set fin = now() + interval '12 hours'");
    expect(await envoyerRappels(envoyer)).toBe(2); // nouvelle échéance : J7 et J1
    expect(recus[0].sujet).toMatch(/Calcul des Réservoirs/);
  });
});

describe("garde-fous", () => {
  const racine = path.join("/srv", "prive", "outils");
  it("fichiers protégés : aucun accès hors du dossier de l'application", () => {
    expect(resoudre("reservoirs", undefined, racine)).toBe(path.join(racine, "reservoirs", "index.html"));
    expect(resoudre("reservoirs", ["assets", "index.js"], racine)).toBe(path.join(racine, "reservoirs", "assets", "index.js"));
    expect(resoudre("reservoirs", ["..", "..", "etc", "passwd"], racine)).toBeNull();
    expect(resoudre("reservoirs", ["assets", "..", "..", "autre", "x"], racine)).toBeNull();
    expect(resoudre("../x", ["a"], racine)).toBeNull();
    expect(resoudre("reservoirs", ["a\\..\\..\\b"], racine)).toBeNull();
    expect(resoudre("reservoirs", ["a\0b"], racine)).toBeNull();
  });
  it("chemin de retour : pas de redirection ouverte", () => {
    expect(cheminSur("/apps/reservoirs")).toBe("/apps/reservoirs");
    for (const m of ["https://pirate.cm", "//pirate.cm", "/\\pirate.cm", "javascript:alert(1)", "", null]) expect(cheminSur(m)).toBe("/compte");
  });
});
