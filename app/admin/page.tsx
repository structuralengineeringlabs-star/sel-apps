import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { utilisateurCourant } from "@/lib/serveur/session";
import { estAdmin } from "@/lib/serveur/admin";
import { paiementsAdmin } from "@/lib/serveur/abonnements";
import { nomPrestataire } from "@/lib/serveur/prestataires";
import { applications } from "@/data/applications";
import { formatPrice } from "@/lib/utils";
import { tarifEssai } from "@/lib/offres";

export const metadata: Metadata = { title: "Administration", robots: { index: false, follow: false } };

const STATUTS: Record<string, string> = { en_attente: "en attente", accepte: "payé", refuse: "refusé" };
const date = (d: Date | null) => (d ? new Date(d).toLocaleString("fr-FR", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit", timeZone: "Africa/Douala" }) : "—");
const moisCourant = () => new Date().toLocaleDateString("sv-SE", { timeZone: "Africa/Douala" }).slice(0, 7);
type Props = { searchParams: Promise<{ mois?: string; message?: string }> };

/** Administration des ventes : synthèse du mois, paiements, export comptable, activation manuelle, purge des essais. */
export default async function AdminPage({ searchParams }: Props) {
  const u = await utilisateurCourant();
  if (!u) redirect("/connexion?retour=/admin");
  if (!estAdmin(u.email)) notFound();
  const { mois: m, message } = await searchParams;
  const mois = /^\d{4}-\d{2}$/.test(m ?? "") ? m! : moisCourant();
  const lignes = await paiementsAdmin(mois);
  const reels = lignes.filter(p => p.statut === "accepte" && !p.essai);
  const totaux = Object.entries(reels.reduce<Record<string, number>>((t, p) => ({ ...t, [p.devise]: (t[p.devise] ?? 0) + Number(p.montant) }), {}));
  const enAttente = lignes.filter(p => p.statut === "en_attente").length;
  const essais = lignes.filter(p => p.essai).length;
  const payantes = applications.filter(a => a.paiementEnLigne && !a.isFree);
  const essai = tarifEssai();

  return (
    <div className="py-10"><div className="max-w-6xl mx-auto px-4 space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div><h1 className="text-3xl font-bold text-gray-900">Administration</h1><p className="text-gray-600">Ventes et abonnements — {u.email}</p></div>
        <form className="flex items-end gap-2" method="get">
          <label className="text-sm">Mois<input type="month" name="mois" defaultValue={mois} className="block h-10 rounded-md border border-gray-300 px-2" /></label>
          <button className="btn-secondary">Afficher</button>
        </form>
      </div>
      {message && <p role="status" className="rounded-md border border-sel/30 bg-sel/5 px-3 py-2 text-sm">{message}</p>}
      {essai !== null && <p className="rounded-md border border-amber-300 bg-amber-50 px-3 py-2 text-sm text-amber-900"><strong>Tarif d&apos;essai actif</strong> : toutes les offres sont facturées {formatPrice(essai, "F CFA")} (variable TARIF_ESSAI). Supprimez-la et redéployez pour revenir aux prix normaux.</p>}

      <section className="grid gap-4 sm:grid-cols-4">
        <div className="card"><div className="text-xs uppercase text-gray-500">Encaissé ({mois})</div><div className="text-xl font-bold text-sel">{totaux.length ? totaux.map(([d, t]) => formatPrice(t, d)).join(" + ") : "0"}</div></div>
        <div className="card"><div className="text-xs uppercase text-gray-500">Ventes réelles</div><div className="text-xl font-bold">{reels.length}</div></div>
        <div className="card"><div className="text-xs uppercase text-gray-500">En attente</div><div className="text-xl font-bold">{enAttente}</div></div>
        <div className="card"><div className="text-xs uppercase text-gray-500">Paiements d&apos;essai</div><div className="text-xl font-bold">{essais}</div></div>
      </section>

      <section className="card">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
          <h2 className="text-xl font-bold">Paiements</h2>
          <span className="flex gap-2">
            <a href={`/api/admin/export?mois=${mois}`} className="btn-secondary">Export comptable du mois (CSV)</a>
            <a href="/api/admin/export" className="btn-secondary">Tout exporter</a>
          </span>
        </div>
        {lignes.length === 0 ? <p className="text-gray-600">Aucun paiement ce mois-ci.</p> : (
          <div className="overflow-x-auto"><table className="w-full text-sm">
            <thead><tr className="text-left text-gray-500"><th className="py-2">Date</th><th>Client</th><th>Application</th><th>Formule</th><th className="text-right pr-4">Montant</th><th>Prestataire</th><th>État</th><th>Reçu</th><th /></tr></thead>
            <tbody>{lignes.map(p => (
              <tr key={p.transaction_id} className={`border-t border-gray-100 ${p.essai ? "text-gray-400" : ""}`}>
                <td className="py-2 whitespace-nowrap">{date(p.paye_le ?? p.cree_le)}</td>
                <td className="break-all">{p.email}</td>
                <td>{applications.find(a => a.slug === p.application)?.name ?? p.application}</td>
                <td>{p.formule}</td>
                <td className="text-right whitespace-nowrap pr-4">{formatPrice(Number(p.montant), p.devise)}</td>
                <td>{p.prestataire === "manuel" ? "Manuel" : nomPrestataire(p.prestataire)}{p.methode && p.prestataire !== "manuel" ? ` (${p.methode})` : ""}</td>
                <td>{STATUTS[p.statut] ?? p.statut}{p.essai ? " · essai" : ""}</td>
                <td className="font-mono text-xs whitespace-nowrap">{p.numero_recu ?? "—"}</td>
                <td>{p.statut === "en_attente" && p.prestataire !== "manuel" && (
                  <form action="/api/admin/reverifier" method="post"><input type="hidden" name="transaction" value={p.transaction_id} /><button className="underline text-sel">Revérifier</button></form>
                )}</td>
              </tr>
            ))}</tbody>
          </table></div>
        )}
      </section>

      <section className="card">
        <h2 className="text-xl font-bold mb-1">Activation manuelle</h2>
        <p className="text-sm text-gray-600 mb-4">Pour un paiement reçu hors ligne (dépôt Mobile Money, virement) ou un geste commercial. Le compte du client est créé s&apos;il n&apos;existe pas ; un reçu est émis et le client reçoit un e-mail.</p>
        <form action="/api/admin/activer" method="post" className="grid gap-3 sm:grid-cols-2 text-sm">
          <label>Adresse e-mail du client<input name="email" type="email" required className="mt-1 w-full h-10 rounded-md border border-gray-300 px-2" /></label>
          <label>Application<select name="application" className="mt-1 w-full h-10 rounded-md border border-gray-300 px-2">{payantes.map(a => <option key={a.slug} value={a.slug}>{a.name}</option>)}</select></label>
          <label>Formule<select name="formule" className="mt-1 w-full h-10 rounded-md border border-gray-300 px-2"><option value="mensuel">Mensuel (30 jours)</option><option value="annuel">Annuel (365 jours)</option></select></label>
          <span className="grid grid-cols-2 gap-2">
            <label>Montant reçu<input name="montant" type="number" min={0} step={1} required className="mt-1 w-full h-10 rounded-md border border-gray-300 px-2" /></label>
            <label>Devise<select name="devise" className="mt-1 w-full h-10 rounded-md border border-gray-300 px-2"><option>XAF</option><option>XOF</option></select></label>
          </span>
          <label className="sm:col-span-2">Note (référence de l&apos;opération, motif)<input name="note" required maxLength={300} className="mt-1 w-full h-10 rounded-md border border-gray-300 px-2" placeholder="Ex. : dépôt MoMo n° … du …" /></label>
          <div className="sm:col-span-2"><button className="btn-primary">Activer l&apos;abonnement</button></div>
        </form>
      </section>

      <section className="card border-red-200">
        <h2 className="text-xl font-bold mb-1 text-red-800">Données d&apos;essai</h2>
        <p className="text-sm text-gray-600 mb-4">Supprime tous les paiements réalisés avec les clés de test et les accès qu&apos;ils ont ouverts. Si aucun paiement réel n&apos;existe encore, la numérotation des reçus repart à SEL-R-…-000001. Les paiements réels ne sont jamais touchés.</p>
        <form action="/api/admin/purger" method="post" className="flex flex-wrap items-end gap-2 text-sm">
          <label>Tapez PURGER pour confirmer<input name="confirmation" autoComplete="off" className="mt-1 block h-10 rounded-md border border-gray-300 px-2" /></label>
          <button className="btn-secondary">Purger les données d&apos;essai</button>
        </form>
      </section>
      <p className="text-xs text-gray-500"><Link href="/compte" className="underline">Mon compte</Link></p>
    </div></div>
  );
}
