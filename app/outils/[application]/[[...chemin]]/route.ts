import { NextResponse } from "next/server";
import { readFile } from "fs/promises";
import { utilisateurCourant } from "@/lib/serveur/session";
import { abonnementActif } from "@/lib/serveur/abonnements";
import { resoudre, typeDe } from "@/lib/serveur/fichiers-proteges";
import { applications } from "@/data/applications";

/**
 * Édition complète d'une application payante : servie uniquement à un abonné en cours de validité.
 * Sinon, redirection vers la page de l'application (édition de démonstration et offres).
 */
export async function GET(req: Request, ctx: { params: Promise<{ application: string; chemin?: string[] }> }) {
  const { application, chemin } = await ctx.params;
  const app = applications.find(a => a.slug === application && a.paiementEnLigne);
  if (!app) return new NextResponse("Introuvable", { status: 404 });
  const u = await utilisateurCourant();
  const fin = u ? await abonnementActif(u.id, application) : null;
  if (!fin) return NextResponse.redirect(new URL(`/apps/${application}`, req.url), 302);
  const fichier = resoudre(application, chemin);
  if (!fichier) return new NextResponse("Introuvable", { status: 404 });
  try {
    const contenu = await readFile(fichier);
    const immuable = /\/assets\//.test(fichier);
    return new NextResponse(new Uint8Array(contenu), { headers: {
      "Content-Type": typeDe(fichier),
      "Cache-Control": immuable ? "private, max-age=31536000, immutable" : "private, no-store",
      "X-Robots-Tag": "noindex",
    } });
  } catch {
    return new NextResponse("Introuvable", { status: 404 });
  }
}
