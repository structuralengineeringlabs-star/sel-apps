import { NextResponse } from "next/server";
import { utilisateurCourant } from "@/lib/serveur/session";
import { abonnementActif, paiementsDe } from "@/lib/serveur/abonnements";
import { estAdmin } from "@/lib/serveur/admin";
import { nomPrestataire } from "@/lib/serveur/prestataires";

/** État du visiteur pour le portail d'abonnement d'une application (page publique statique) : jamais mis en cache. */
export async function GET(req: Request) {
  const application = new URL(req.url).searchParams.get("application") ?? "";
  const entetes = { "Cache-Control": "private, no-store" };
  const u = await utilisateurCourant().catch(() => null);
  if (!u) return NextResponse.json({ connecte: false }, { headers: entetes });
  const [fin, paiements] = await Promise.all([abonnementActif(u.id, application), paiementsDe(u.id)]);
  return NextResponse.json({
    connecte: true, email: u.email, admin: estAdmin(u.email),
    fin: fin?.toISOString() ?? null,
    paiements: paiements.filter(p => p.application === application).map(p => ({
      transaction: p.transaction_id, recu: p.numero_recu, date: new Date(p.paye_le ?? p.cree_le).toISOString(), formule: p.formule,
      montant: Number(p.montant), devise: p.devise, statut: p.statut, moyen: p.prestataire === "manuel" ? "Activation manuelle" : nomPrestataire(p.prestataire), essai: p.essai,
    })),
  }, { headers: entetes });
}
