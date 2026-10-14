import { NextResponse } from "next/server";
import { demanderLien } from "@/lib/serveur/lien-connexion";
import { baseUrl, cheminSur, origineSure } from "@/lib/serveur/securite";

/** Demande d'un lien de connexion par e-mail (formulaire de /connexion). */
export async function POST(req: Request) {
  const base = baseUrl(req);
  if (!origineSure(req)) return new NextResponse("Origine refusée", { status: 403 });
  const f = await req.formData();
  const email = String(f.get("email") ?? ""), retour = cheminSur(String(f.get("retour") ?? ""));
  const retourQ = `retour=${encodeURIComponent(retour)}`;
  try {
    const r = await demanderLien(email, retour, base);
    if (r === "envoye") return NextResponse.redirect(new URL(`/connexion/verifier?email=${encodeURIComponent(email.trim().toLowerCase())}`, base), 303);
    return NextResponse.redirect(new URL(`/connexion?erreur=${r}&${retourQ}`, base), 303);
  } catch (e) {
    console.error("[auth] lien de connexion non envoyé", e);
    return NextResponse.redirect(new URL(`/connexion?erreur=envoi&${retourQ}`, base), 303);
  }
}
