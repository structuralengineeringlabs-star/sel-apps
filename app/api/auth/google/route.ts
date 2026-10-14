import { NextResponse } from "next/server";
import { COOKIE_OAUTH, preparer } from "@/lib/serveur/google";
import { baseUrl, cheminSur } from "@/lib/serveur/securite";

/** Démarre la connexion Google : état et vérificateur PKCE dans un cookie de 10 minutes. */
export async function GET(req: Request) {
  const base = baseUrl(req);
  const retour = cheminSur(new URL(req.url).searchParams.get("retour"));
  try {
    const { url, cookie } = preparer(base, retour);
    const r = NextResponse.redirect(url);
    r.cookies.set(COOKIE_OAUTH, cookie, { httpOnly: true, secure: base.startsWith("https"), sameSite: "lax", path: "/api/auth/google", maxAge: 600 });
    return r;
  } catch (e) {
    console.error("[auth] Google indisponible", e);
    return NextResponse.redirect(new URL(`/connexion?erreur=google&retour=${encodeURIComponent(retour)}`, base));
  }
}
