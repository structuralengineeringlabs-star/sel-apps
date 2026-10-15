import type { Metadata } from "next";
import Link from "next/link";
import { utilisateurCourant } from "@/lib/serveur/session";
import { abonnementActif } from "@/lib/serveur/abonnements";
import { estAdmin } from "@/lib/serveur/admin";

export const metadata: Metadata = {
  title: "Buses enterrées — fascicule 70 et Eurocodes",
  description:
    "Justifiez les buses en béton armé, non armé ou fibré selon le fascicule 70 (CCTG titre I, chapitre IV) : charges Bc ou LM1, force portante et fissuration, armatures EC2, tête de buse EC2 et EC7, capacité hydraulique Manning-Strickler, note de calcul, plans A3 et DXF.",
};

/** Abonné : édition complète (servie par /outils/buses). Sinon : édition de démonstration publique. */
export default async function BusesPage() {
  const u = await utilisateurCourant().catch(() => null);
  const fin = u ? await abonnementActif(u.id, "buses").catch(() => null) : null;
  const apercu = !fin && estAdmin(u?.email); // administrateur sans abonnement : aperçu de l'édition complète
  const src = fin || apercu ? "/outils/buses/index.html" : "/tools/buses/index.html";
  return (
    <div className="space-y-3">
      {fin && (
        <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-900">
          <strong>Édition complète</strong> — abonnement actif jusqu&apos;au {fin.toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}.{" "}
          <Link href="/compte" className="underline">Mon compte</Link>
        </div>
      )}
      {apercu && (
        <div className="rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          <strong>Aperçu administrateur</strong> — édition complète affichée sans abonnement. Les clients sans abonnement voient la démonstration.
        </div>
      )}
      {!fin && !apercu && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-sel/30 bg-white px-4 py-3 text-sm">
          <span>Vous utilisez la <strong>démonstration</strong>. {u ? "Abonnez-vous pour débloquer le diamètre, la hauteur de couverture, la note de calcul, les plans et le DXF." : "Déjà abonné ? Connectez-vous pour ouvrir l'édition complète."}</span>
          <span className="flex gap-2">
            {!u && <Link href="/connexion?retour=/apps/buses" className="btn-secondary">Se connecter</Link>}
            <Link href="/applications/buses#souscrire" className="btn-primary">S&apos;abonner</Link>
          </span>
        </div>
      )}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-200" style={{ height: "calc(100vh - 180px)", minHeight: 700 }}>
        <h1 className="sr-only">Buses enterrées — fascicule 70 et Eurocodes</h1>
        <iframe src={src} title="Buses enterrées — fascicule 70 et Eurocodes" className="w-full h-full border-0" allow="clipboard-write; fullscreen" />
      </div>
    </div>
  );
}
