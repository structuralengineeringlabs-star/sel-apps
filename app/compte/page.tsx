import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { utilisateurCourant } from "@/lib/serveur/session";
import { abonnementsDe, paiementsDe } from "@/lib/serveur/abonnements";
import { applications } from "@/data/applications";
import { formatPrice } from "@/lib/utils";
import { estAdmin } from "@/lib/serveur/admin";

export const metadata: Metadata = { title: "Mon compte", robots: { index: false } };
const date = (d: Date) => new Date(d).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric", timeZone: "Africa/Douala" });
const nomApp = (s: string) => applications.find(a => a.slug === s)?.name ?? s;
const STATUTS: Record<string, string> = { en_attente: "en attente", accepte: "payé", refuse: "refusé" };
type Props = { searchParams: Promise<{ erreur?: string }> };

export default async function ComptePage({ searchParams }: Props) {
  const u = await utilisateurCourant();
  if (!u) redirect("/connexion?retour=/compte");
  const { erreur } = await searchParams;
  const [abos, paiements] = await Promise.all([abonnementsDe(u.id), paiementsDe(u.id)]);
  return (
    <div className="py-12"><div className="max-w-4xl mx-auto px-4 space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div><h1 className="text-3xl font-bold text-gray-900">Mon compte</h1><p className="text-gray-600">{u.email}</p></div>
        <span className="flex gap-2">{estAdmin(u.email) && <Link href="/admin" className="btn-secondary">Administration</Link>}<form action="/api/auth/deconnexion" method="post"><button className="btn-secondary">Se déconnecter</button></form></span>
      </div>
      {erreur === "trop" && <p role="alert" className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">Plusieurs commandes viennent d&apos;être lancées : patientez dix minutes avant d&apos;en créer une nouvelle. Une commande déjà payée apparaît ci-dessous.</p>}
      {erreur === "paiement" && <p role="alert" className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">Le paiement n&apos;a pas pu être lancé. Réessayez dans quelques instants ou contactez-nous.</p>}
      <section className="card">
        <h2 className="text-xl font-bold mb-4">Abonnements</h2>
        {abos.length === 0 ? <p className="text-gray-600">Aucun abonnement. <Link href="/tarifs" className="underline">Voir les offres</Link>.</p> : (
          <ul className="divide-y divide-gray-100">{abos.map(a => {
            const actif = new Date(a.fin) > new Date();
            return <li key={a.application} className="py-3 flex flex-wrap items-center justify-between gap-2">
              <span><strong>{nomApp(a.application)}</strong> — {actif ? `actif jusqu'au ${date(a.fin)}` : `expiré le ${date(a.fin)}`}</span>
              <span className="flex gap-2">{actif && <Link href={`/apps/${a.application}`} className="btn-primary">Ouvrir</Link>}<Link href={`/applications/${a.application}`} className="btn-secondary">{actif ? "Prolonger" : "Renouveler"}</Link></span>
            </li>;
          })}</ul>
        )}
      </section>
      <section className="card">
        <h2 className="text-xl font-bold mb-4">Paiements</h2>
        {paiements.length === 0 ? <p className="text-gray-600">Aucun paiement.</p> : (
          <div className="overflow-x-auto"><table className="w-full text-sm"><thead><tr className="text-left text-gray-500"><th className="py-2">Date</th><th>Application</th><th>Formule</th><th>Montant TTC</th><th>État</th><th /></tr></thead>
            <tbody>{paiements.map(p => <tr key={p.transaction_id} className="border-t border-gray-100">
              <td className="py-2">{date(p.cree_le)}</td><td>{nomApp(p.application)}</td><td>{p.formule}</td><td>{formatPrice(p.montant, p.devise)}{p.essai ? " (essai)" : ""}</td><td>{STATUTS[p.statut] ?? p.statut}</td>
              <td><Link href={`/compte/paiement/${p.transaction_id}`} className="underline">{p.statut === "accepte" ? "Reçu" : "Détail"}</Link></td>
            </tr>)}</tbody></table></div>
        )}
      </section>
    </div></div>
  );
}
