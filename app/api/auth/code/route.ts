import { NextResponse } from "next/server";
import { verifierCode } from "@/lib/serveur/lien-connexion";
import { marquerVerifie, ouvrirSession, utilisateurPourEmail } from "@/lib/serveur/session";
import { baseUrl, cheminSur, origineSure } from "@/lib/serveur/securite";

/** Connexion par le code à 6 chiffres reçu par e-mail (saisi dans le navigateur d'origine). */
export async function POST(req: Request) {
  const base = baseUrl(req);
  if (!origineSure(req)) return new NextResponse("Origine refusée", { status: 403 });
  const f = await req.formData();
  const email = String(f.get("email") ?? ""), retour = cheminSur(String(f.get("retour") ?? ""));
  const ok = await verifierCode(email, String(f.get("code") ?? ""));
  if (!ok) return NextResponse.redirect(new URL(`/connexion/verifier?email=${encodeURIComponent(email.trim().toLowerCase())}&retour=${encodeURIComponent(retour)}&erreur=code`, base), 303);
  const id = await utilisateurPourEmail(ok.email);
  await marquerVerifie(id);
  await ouvrirSession(id);
  return NextResponse.redirect(new URL(cheminSur(ok.retour ?? retour), base), 303);
}
