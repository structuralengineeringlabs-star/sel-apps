import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { utilisateurCourant } from "@/lib/serveur/session";
import { paiementDe, synchroniserPaiement } from "@/lib/serveur/abonnements";
import { envoyerConfirmation } from "@/lib/serveur/notifications";
import { applications } from "@/data/applications";
import { LIBELLES } from "@/lib/offres";
import { formatPrice } from "@/lib/utils";
import { CONTACT } from "@/lib/contact";
import { nomPrestataire } from "@/lib/serveur/prestataires";
import BoutonImprimer from "./BoutonImprimer";

export const metadata: Metadata = { title: "Paiement", robots: { index: false } };
type Props = { params: Promise<{ transaction: string }> };
const date = (d: Date) => new Date(d).toLocaleString("fr-FR", { dateStyle: "long", timeStyle: "short", timeZone: "Africa/Douala" });

/** État d'un paiement ; s'il est encore en attente, le statut est vérifié auprès du prestataire (notification retardée). */
export default async function PaiementPage({ params }: Props) {
  const { transaction } = await params;
  const u = await utilisateurCourant();
  if (!u) redirect(`/connexion?retour=/compte/paiement/${encodeURIComponent(transaction)}`);
  let p = await paiementDe(u.id, transaction);
  if (!p) notFound();
  if (p.statut === "en_attente") {
    try {
      const r = await synchroniserPaiement(transaction);
      if (r.issue === "accepte") await envoyerConfirmation(r).catch(() => undefined);
      p = (await paiementDe(u.id, transaction))!;
    } catch (e) { console.error("[paiement] vérification au retour impossible", e); }
  }
  const app = applications.find(a => a.slug === p!.application);
  return (
    <div className="py-12"><div className="max-w-2xl mx-auto px-4">
      {p.statut === "accepte" ? (
        <div className="card" id="recu">
          <div className="flex justify-between items-start mb-6">
            <div><h1 className="text-2xl font-bold">Reçu de paiement</h1><p className="text-gray-600">N° {p.numero_recu}</p></div>
            <div className="text-right text-sm text-gray-600">Structural &amp; Engineering Labs<br />{CONTACT.email}</div>
          </div>
          <table className="w-full text-sm mb-6"><tbody>
            <tr><td className="py-1 text-gray-500">Client</td><td>{u.nom ? `${u.nom} — ` : ""}{u.email}</td></tr>
            <tr><td className="py-1 text-gray-500">Date du paiement</td><td>{p.paye_le ? date(p.paye_le) : "—"}</td></tr>
            <tr><td className="py-1 text-gray-500">Désignation</td><td>{app?.name} — {LIBELLES[p.formule]}</td></tr>
            <tr><td className="py-1 text-gray-500">Moyen de paiement</td><td>{nomPrestataire(p.prestataire)}{p.methode ? ` (${p.methode})` : ""}</td></tr>
            <tr><td className="py-1 text-gray-500">Référence de transaction</td><td className="font-mono">{p.transaction_id}</td></tr>
            <tr className="border-t border-gray-200"><td className="py-2 font-bold">Montant TTC</td><td className="font-bold">{formatPrice(p.montant)}</td></tr>
          </tbody></table>
          <div className="flex flex-wrap gap-3 print:hidden"><Link href={`/apps/${p.application}`} className="btn-primary">Ouvrir {app?.name}</Link><BoutonImprimer /></div>
        </div>
      ) : (
        <div className="card">
          <h1 className="text-2xl font-bold mb-3">{p.statut === "refuse" ? "Paiement non abouti" : "Paiement en cours de confirmation"}</h1>
          <p className="text-gray-700 mb-4">{p.statut === "refuse"
            ? "Le paiement a été refusé ou annulé. Aucun montant n'a été débité pour cet abonnement."
            : "La confirmation de l'opérateur peut prendre quelques minutes (Mobile Money). Cette page se met à jour à chaque visite ; un courriel vous sera envoyé dès l'activation."}</p>
          <div className="flex flex-wrap gap-3"><Link href={`/compte/paiement/${p.transaction_id}`} className="btn-primary">Actualiser</Link><Link href={`/applications/${p.application}`} className="btn-secondary">Retour à l&apos;offre</Link></div>
          <p className="text-xs text-gray-500 mt-4">Référence : <span className="font-mono">{p.transaction_id}</span> — {formatPrice(p.montant)} TTC</p>
        </div>
      )}
    </div></div>
  );
}
