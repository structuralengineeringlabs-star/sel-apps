import { NextResponse } from "next/server";
import { COOKIE_SESSION, lireCookie, utilisateurDeJeton, utilisateurPourAchat } from "@/lib/serveur/session";
import { creerPaiement, enregistrerRefPrestataire, TropDeCommandes } from "@/lib/serveur/abonnements";
import { initialiser } from "@/lib/serveur/cinetpay";
import { initialiserNotch } from "@/lib/serveur/notchpay";
import { emailValide } from "@/lib/serveur/lien-connexion";
import { empreinte, jetonAleatoire } from "@/lib/serveur/jetons";
import { baseUrl, origineSure, urlNotification } from "@/lib/serveur/securite";
import { estFormule, offre, zoneDe, ZONES } from "@/lib/offres";
import { CHEMIN_RETOUR, COOKIE_ACHAT } from "@/lib/serveur/achat";


/**
 * Commande d'un abonnement : contrôle de l'acceptation des CGV (aucun remboursement, accès immédiat), création de la
 * transaction en base dans la devise de la zone choisie (CEMAC : XAF, UEMOA : XOF), puis redirection vers la page de paiement du prestataire.
 *
 * Sans connexion préalable : l'adresse e-mail saisie suffit. Adresse inconnue → compte créé (non vérifié) et jeton
 * d'achat remis à ce navigateur, qui sera connecté au retour du paiement. Adresse déjà inscrite → la commande est
 * rattachée au compte, mais aucune session n'est ouverte : le titulaire se connecte (lien, code ou Google).
 */
export async function POST(req: Request) {
  const base = baseUrl(req);
  if (!origineSure(req)) return new NextResponse("Origine refusée", { status: 403 });
  const f = await req.formData();
  const application = String(f.get("application") ?? ""), formule = f.get("formule"), zone = zoneDe(f.get("zone"), f.get("pays"));
  const page = `/applications/${encodeURIComponent(application)}`;
  const erreur = (code: string) => NextResponse.redirect(new URL(`${page}?erreur=${code}&formule=${String(formule)}&zone=${zone ?? "CEMAC"}#souscrire`, base), 303);
  if (!estFormule(formule) || !zone || !offre(application, formule)) return NextResponse.redirect(new URL(page, base), 303);
  if (f.get("cgv") !== "oui") return erreur("cgv");

  const jetonSession = lireCookie(req, COOKIE_SESSION);
  const connecte = jetonSession ? await utilisateurDeJeton(jetonSession) : null;
  let client: { id: number; email: string; nom: string | null }, jetonAchat: string | null = null;
  if (connecte) client = connecte;
  else {
    const email = String(f.get("email") ?? "").trim().toLowerCase();
    if (!emailValide(email)) return erreur("email");
    const a = await utilisateurPourAchat(email);
    client = { id: a.id, email, nom: null };
    if (a.nouveau) jetonAchat = jetonAleatoire();
  }
  try {
    const p = await creerPaiement(client.id, application, formule, undefined, ZONES[zone].devise, jetonAchat ? empreinte(jetonAchat) : null);
    const demande = {
      transactionId: p.transactionId, montant: p.montant, devise: p.devise, // pays laissé au choix du client chez le prestataire
      description: `Abonnement ${formule} ${p.nom}`.replace(/[#/$_&]/g, " "),
      notifyUrl: urlNotification(base), returnUrl: `${base}${CHEMIN_RETOUR}?transaction=${p.transactionId}`,
      client: { email: client.email, nom: client.nom },
    };
    let paymentUrl: string;
    if (p.prestataire === "notchpay") {
      const r = await initialiserNotch(demande);
      await enregistrerRefPrestataire(p.transactionId, r.reference);
      paymentUrl = r.paymentUrl;
    } else paymentUrl = (await initialiser(demande)).paymentUrl;
    const res = NextResponse.redirect(paymentUrl, 303);
    if (jetonAchat) {
      // SameSite=None (HTTPS) : le retour CinetPay est un POST venant du site du prestataire
      const https = base.startsWith("https");
      res.cookies.set(COOKIE_ACHAT, jetonAchat, { httpOnly: true, secure: https, sameSite: https ? "none" : "lax", path: CHEMIN_RETOUR, maxAge: 3 * 3600 });
    }
    return res;
  } catch (e) {
    if (e instanceof TropDeCommandes) return connecte ? NextResponse.redirect(new URL(`/compte?erreur=trop`, base), 303) : erreur("trop");
    console.error("[paiement] initialisation impossible", e);
    return connecte ? NextResponse.redirect(new URL(`/compte?erreur=paiement`, base), 303) : erreur("paiement");
  }
}
