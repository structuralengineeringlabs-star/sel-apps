import { NextResponse } from "next/server";
import { utilisateurCourant } from "@/lib/serveur/session";
import { creerPaiement, enregistrerRefPrestataire } from "@/lib/serveur/abonnements";
import { initialiser } from "@/lib/serveur/cinetpay";
import { initialiserNotch } from "@/lib/serveur/notchpay";
import { baseUrl, origineSure, urlNotification } from "@/lib/serveur/securite";
import { estFormule, offre } from "@/lib/offres";

/** Commande d'un abonnement : crée la transaction en base puis redirige vers la page de paiement du prestataire actif. */
export async function POST(req: Request) {
  const base = baseUrl(req);
  if (!origineSure(req)) return new NextResponse("Origine refusée", { status: 403 });
  const f = await req.formData();
  const application = String(f.get("application") ?? ""), formule = f.get("formule");
  const page = `/applications/${encodeURIComponent(application)}`;
  if (!estFormule(formule) || !offre(application, formule)) return NextResponse.redirect(new URL(page, base), 303);
  const u = await utilisateurCourant();
  if (!u) return NextResponse.redirect(new URL(`/connexion?retour=${encodeURIComponent(page)}`, base), 303);
  try {
    const p = await creerPaiement(u.id, application, formule);
    const demande = {
      transactionId: p.transactionId, montant: p.montant,
      description: `Abonnement ${formule} ${p.nom}`.replace(/[#/$_&]/g, " "),
      notifyUrl: urlNotification(base), returnUrl: `${base}/api/paiement/retour?transaction=${p.transactionId}`,
      client: { email: u.email, nom: u.nom },
    };
    if (p.prestataire === "notchpay") {
      const { paymentUrl, reference } = await initialiserNotch(demande);
      await enregistrerRefPrestataire(p.transactionId, reference);
      return NextResponse.redirect(paymentUrl, 303);
    }
    const { paymentUrl } = await initialiser(demande);
    return NextResponse.redirect(paymentUrl, 303);
  } catch (e) {
    console.error("[paiement] initialisation impossible", e);
    return NextResponse.redirect(new URL(`/compte?erreur=paiement`, base), 303);
  }
}
