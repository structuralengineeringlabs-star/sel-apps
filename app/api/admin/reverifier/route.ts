import { NextResponse } from "next/server";
import { adminCourant } from "@/lib/serveur/admin";
import { synchroniserPaiement } from "@/lib/serveur/abonnements";
import { envoyerConfirmation } from "@/lib/serveur/notifications";
import { baseUrl, origineSure } from "@/lib/serveur/securite";

/** Revérifie un paiement en attente auprès du prestataire (client qui dit avoir payé sans avoir accès). */
export async function POST(req: Request) {
  const base = baseUrl(req);
  if (!origineSure(req)) return new NextResponse("Origine refusée", { status: 403 });
  if (!(await adminCourant())) return new NextResponse("Accès refusé", { status: 403 });
  const t = String((await req.formData()).get("transaction") ?? "");
  let m: string;
  try {
    const r = await synchroniserPaiement(t);
    if (r.issue === "accepte") await envoyerConfirmation(r).catch(() => undefined);
    m = { accepte: "Paiement confirmé : abonnement activé.", deja_accepte: "Paiement déjà accepté.", refuse: "Le prestataire indique un échec ou une annulation.",
      en_attente: "Toujours en attente chez le prestataire.", anomalie: "ANOMALIE : montant ou devise différents de la commande, accès non ouvert.", inconnu: "Transaction inconnue." }[r.issue];
  } catch (e) { console.error("[admin] revérification impossible", e); m = "Revérification impossible (voir les journaux)."; }
  return NextResponse.redirect(new URL(`/admin?message=${encodeURIComponent(`${t} : ${m}`)}`, base), 303);
}
