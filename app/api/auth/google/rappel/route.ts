import { NextResponse, type NextRequest } from "next/server";
import { COOKIE_OAUTH, terminer } from "@/lib/serveur/google";
import { ouvrirSession, utilisateurPourEmail } from "@/lib/serveur/session";
import { baseUrl, cheminSur } from "@/lib/serveur/securite";

/** Retour de Google : vérifie l'état, échange le code (PKCE), crée ou retrouve le compte, ouvre la session. */
export async function GET(req: NextRequest) {
  const base = baseUrl(req), p = req.nextUrl.searchParams;
  try {
    const { profil, retour } = await terminer(base, req.cookies.get(COOKIE_OAUTH)?.value, p.get("code"), p.get("state"));
    const id = await utilisateurPourEmail(profil.email, profil.nom, profil.sub);
    await ouvrirSession(id);
    const r = NextResponse.redirect(new URL(cheminSur(retour), base));
    r.cookies.delete({ name: COOKIE_OAUTH, path: "/api/auth/google" });
    return r;
  } catch (e) {
    console.error("[auth] échec de la connexion Google", e);
    return NextResponse.redirect(new URL("/connexion?erreur=google", base));
  }
}
