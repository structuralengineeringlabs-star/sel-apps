import { NextResponse } from "next/server";
import { baseUrl } from "@/lib/serveur/securite";
import { consommerAchat } from "@/lib/serveur/abonnements";
import { empreinte } from "@/lib/serveur/jetons";
import { COOKIE_SESSION, creerSession, lireCookie, optionsCookieSession, utilisateurDeJeton } from "@/lib/serveur/session";
import { CHEMIN_RETOUR, COOKIE_ACHAT } from "@/lib/serveur/achat";

/**
 * Retour du client depuis la page de paiement (Notch Pay ou CinetPay, GET ou POST) : page d'état du paiement.
 * Achat sans compte : le navigateur qui a lancé la commande (jeton d'achat) est connecté à son nouveau compte.
 */
async function retour(req: Request) {
  const t = new URL(req.url).searchParams.get("transaction") ?? "";
  const ok = /^SEL[A-Z0-9]{6,40}$/.test(t);
  const res = NextResponse.redirect(new URL(ok ? `/compte/paiement/${t}` : "/compte", baseUrl(req)), 303);
  const jeton = lireCookie(req, COOKIE_ACHAT);
  if (ok && jeton) {
    const session = lireCookie(req, COOKIE_SESSION);
    const deja = session ? await utilisateurDeJeton(session) : null;
    const uid = await consommerAchat(t, empreinte(jeton));
    if (uid && !deja) {
      const s = await creerSession(uid, true);
      res.cookies.set(COOKIE_SESSION, s.jeton, optionsCookieSession(s.expire));
    }
    res.cookies.set(COOKIE_ACHAT, "", { path: CHEMIN_RETOUR, maxAge: 0 });
  }
  return res;
}
export { retour as GET, retour as POST };
