import { NextResponse } from "next/server";
import { utilisateurCourant } from "@/lib/serveur/session";
import { creerPaiement, enregistrerRefPrestataire, TropDeCommandes } from "@/lib/serveur/abonnements";
import { initialiser } from "@/lib/serveur/cinetpay";
import { initialiserNotch } from "@/lib/serveur/notchpay";
import { baseUrl, origineSure, urlNotification } from "@/lib/serveur/securite";
import { estFormule, estPays, offre, PAYS } from "@/lib/offres";

/**
 * Commande d'un abonnement : contrôle de l'acceptation des CGV (aucun remboursement, accès immédiat), création de la
 * transaction en base dans la devise du pays choisi (XAF ou XOF), puis redirection vers la page de paiement du prestataire.
 */
export async function POST(req: Request) {
  const base = baseUrl(req);
  if (!origineSure(req)) return new NextResponse("Origine refusée", { status: 403 });
  const f = await req.formData();
  const application = String(f.get("application") ?? ""), formule = f.get("formule"), pays = f.get("pays") ?? "CM";
  const page = `/applications/${encodeURIComponent(application)}`;
  if (!estFormule(formule) || !estPays(pays) || !offre(application, formule)) return NextResponse.redirect(new URL(page, base), 303);
  if (f.get("cgv") !== "oui") return NextResponse.redirect(new URL(`${page}?erreur=cgv#souscrire`, base), 303);
  const u = await utilisateurCourant();
  if (!u) return NextResponse.redirect(new URL(`/connexion?retour=${encodeURIComponent(page)}`, base), 303);
  try {
    const p = await creerPaiement(u.id, application, formule, undefined, PAYS[pays].devise);
    const demande = {
      transactionId: p.transactionId, montant: p.montant, devise: p.devise, pays,
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
    if (e instanceof TropDeCommandes) return NextResponse.redirect(new URL(`/compte?erreur=trop`, base), 303);
    console.error("[paiement] initialisation impossible", e);
    return NextResponse.redirect(new URL(`/compte?erreur=paiement`, base), 303);
  }
}
