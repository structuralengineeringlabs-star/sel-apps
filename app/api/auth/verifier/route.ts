import { NextResponse } from "next/server";
import { consommerLien } from "@/lib/serveur/lien-connexion";
import { ouvrirSession, utilisateurPourEmail } from "@/lib/serveur/session";
import { baseUrl, cheminSur, origineSure } from "@/lib/serveur/securite";

/**
 * Confirmation du lien de connexion. Le lien du courriel ouvre /connexion/confirmer, qui poste ici : les robots
 * d'analyse des messageries qui « visitent » les liens ne consomment donc pas le jeton.
 */
export async function POST(req: Request) {
  const base = baseUrl(req);
  if (!origineSure(req)) return new NextResponse("Origine refusée", { status: 403 });
  const jeton = String((await req.formData()).get("jeton") ?? "");
  const lien = jeton ? await consommerLien(jeton) : null;
  if (!lien) return NextResponse.redirect(new URL("/connexion?erreur=lien", base), 303);
  await ouvrirSession(await utilisateurPourEmail(lien.email));
  return NextResponse.redirect(new URL(cheminSur(lien.retour), base), 303);
}
/** Ancien format de lien (GET) : redirige vers la page de confirmation sans consommer le jeton. */
export async function GET(req: Request) {
  const jeton = new URL(req.url).searchParams.get("jeton") ?? "";
  return NextResponse.redirect(new URL(`/connexion/confirmer?jeton=${encodeURIComponent(jeton)}`, baseUrl(req)));
}
