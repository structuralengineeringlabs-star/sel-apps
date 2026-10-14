import { NextResponse } from "next/server";
import { adminCourant } from "@/lib/serveur/admin";
import { purgerEssais } from "@/lib/serveur/abonnements";
import { baseUrl, origineSure } from "@/lib/serveur/securite";

/** Supprime les paiements d'essai (confirmation « PURGER » exigée). */
export async function POST(req: Request) {
  const base = baseUrl(req);
  if (!origineSure(req)) return new NextResponse("Origine refusée", { status: 403 });
  if (!(await adminCourant())) return new NextResponse("Accès refusé", { status: 403 });
  if ((await req.formData()).get("confirmation") !== "PURGER")
    return NextResponse.redirect(new URL(`/admin?message=${encodeURIComponent("Purge annulée : tapez PURGER pour confirmer.")}`, base), 303);
  const r = await purgerEssais();
  const m = `${r.paiements} paiement(s) d'essai supprimé(s), ${r.abonnements} accès retiré(s)${r.numerotationRemiseAZero ? " ; numérotation des reçus remise à 000001" : ""}.`;
  return NextResponse.redirect(new URL(`/admin?message=${encodeURIComponent(m)}`, base), 303);
}
