import type { Metadata } from "next";
import Link from "next/link";
import { utilisateurCourant } from "@/lib/serveur/session";
import { abonnementActif } from "@/lib/serveur/abonnements";

export const metadata: Metadata = {
  title: "Réservoirs en béton armé — Eurocodes",
  description:
    "Pré-dimensionnez un réservoir en béton armé cylindrique ou rectangulaire, enterré, semi-enterré, posé ou surélevé, aux Eurocodes : coques et plaques par éléments finis, étanchéité EN 1992-3, déformations gênées, radier, couverture, soulèvement, séisme et vent, note de calcul, plans A3 DXF et métrés.",
};

/** Abonné : édition complète (servie par /outils/reservoirs). Sinon : édition de démonstration publique. */
export default async function ReservoirsPage() {
  const u = await utilisateurCourant().catch(() => null);
  const fin = u ? await abonnementActif(u.id, "reservoirs").catch(() => null) : null;
  const src = fin ? "/outils/reservoirs/index.html" : "/tools/reservoirs/index.html";
  return (
    <div className="space-y-3">
      {!fin && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-sel/30 bg-white px-4 py-3 text-sm">
          <span>Vous utilisez la <strong>démonstration</strong>. {u ? "Abonnez-vous pour débloquer toutes les dimensions, la note de calcul et les plans." : "Déjà abonné ? Connectez-vous pour ouvrir l'édition complète."}</span>
          <span className="flex gap-2">
            {!u && <Link href="/connexion?retour=/apps/reservoirs" className="btn-secondary">Se connecter</Link>}
            <Link href="/applications/reservoirs" className="btn-primary">S&apos;abonner</Link>
          </span>
        </div>
      )}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-200" style={{ height: "calc(100vh - 180px)", minHeight: 700 }}>
        <h1 className="sr-only">Réservoirs en béton armé — Eurocodes</h1>
        <iframe src={src} title="Réservoirs en béton armé — Eurocodes" className="w-full h-full border-0" allow="clipboard-write; fullscreen" />
      </div>
    </div>
  );
}
