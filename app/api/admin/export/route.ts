import { NextResponse } from "next/server";
import { adminCourant, ligneCsv } from "@/lib/serveur/admin";
import { paiementsAdmin } from "@/lib/serveur/abonnements";
import { nomPrestataire } from "@/lib/serveur/prestataires";

/** Export comptable CSV (Excel, séparateur « ; ») : paiements acceptés réels d'un mois, ou de toute la période. */
export async function GET(req: Request) {
  if (!(await adminCourant())) return new NextResponse("Accès refusé", { status: 403 });
  const q = new URL(req.url).searchParams;
  const mois = /^\d{4}-\d{2}$/.test(q.get("mois") ?? "") ? q.get("mois")! : null;
  const lignes = (await paiementsAdmin(mois, 5000)).filter(p => p.statut === "accepte" && !p.essai);
  const d = (x: Date | null) => (x ? new Date(x).toLocaleString("fr-FR", { timeZone: "Africa/Douala" }) : "");
  const csv = [
    ligneCsv(["Date de paiement", "N° de reçu", "Client", "Application", "Formule", "Montant TTC", "Devise", "Prestataire", "Moyen", "Référence S.E.L.", "Référence prestataire"]),
    ...lignes.map(p => ligneCsv([d(p.paye_le), p.numero_recu, p.email, p.application, p.formule, p.montant, p.devise, p.prestataire === "manuel" ? "Manuel" : nomPrestataire(p.prestataire), p.methode, p.transaction_id, p.ref_prestataire])),
  ].join("\r\n");
  return new NextResponse("﻿" + csv, { headers: {
    "Content-Type": "text/csv; charset=utf-8",
    "Content-Disposition": `attachment; filename="sel-ventes-${mois ?? "tout"}.csv"`,
    "Cache-Control": "private, no-store",
  } });
}
