import { NextResponse } from "next/server";
import { adminCourant } from "@/lib/serveur/admin";
import { activerManuellement } from "@/lib/serveur/abonnements";
import { utilisateurPourEmail } from "@/lib/serveur/session";
import { envoyerConfirmation } from "@/lib/serveur/notifications";
import { baseUrl, origineSure } from "@/lib/serveur/securite";
import { estFormule, offre } from "@/lib/offres";

/** Activation manuelle (paiement reçu hors ligne) : crée le compte si besoin, émet le reçu, prévient le client. */
export async function POST(req: Request) {
  const base = baseUrl(req);
  if (!origineSure(req)) return new NextResponse("Origine refusée", { status: 403 });
  const admin = await adminCourant();
  if (!admin) return new NextResponse("Accès refusé", { status: 403 });
  const f = await req.formData();
  const email = String(f.get("email") ?? "").trim().toLowerCase(), application = String(f.get("application") ?? ""), formule = f.get("formule");
  const devise = f.get("devise") === "XOF" ? "XOF" : "XAF", montant = Number(f.get("montant")), note = String(f.get("note") ?? "").slice(0, 300);
  const retour = (m: string) => NextResponse.redirect(new URL(`/admin?message=${encodeURIComponent(m)}`, base), 303);
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || !estFormule(formule) || !offre(application, formule) || !Number.isInteger(montant) || montant < 0 || !note)
    return retour("Activation refusée : vérifiez l'adresse, l'application, la formule, le montant et la note.");
  try {
    const id = await utilisateurPourEmail(email, null);
    const r = await activerManuellement({ utilisateurId: id, application, formule, montant, devise, note, parAdmin: admin.email });
    await envoyerConfirmation(r).catch(e => console.error("[admin] courriel de confirmation non envoyé", e));
    return retour(`Abonnement activé pour ${email} (reçu ${r.numeroRecu}).`);
  } catch (e) {
    console.error("[admin] activation impossible", e);
    return retour("Activation impossible (voir les journaux).");
  }
}
