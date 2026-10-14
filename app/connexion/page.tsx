import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "Connexion", robots: { index: false } };

const ERREURS: Record<string, string> = {
  invalide: "Adresse e-mail invalide.",
  trop_de_demandes: "Trop de demandes pour cette adresse : réessayez dans quelques minutes.",
  envoi: "Le courriel n'a pas pu être envoyé. Réessayez ou utilisez la connexion Google.",
  lien: "Ce lien de connexion est expiré ou a déjà servi. Demandez-en un nouveau.",
  google: "La connexion Google a échoué. Réessayez ou recevez un lien par e-mail.",
};
type Props = { searchParams: Promise<{ retour?: string; erreur?: string }> };

export default async function ConnexionPage({ searchParams }: Props) {
  const { retour = "/compte", erreur } = await searchParams;
  const r = retour.startsWith("/") && !retour.startsWith("//") ? retour : "/compte";
  return (
    <div className="py-16">
      <div className="max-w-md mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Connexion</h1>
        <p className="text-gray-600 mb-6">Un compte permet de souscrire un abonnement et d&apos;accéder aux applications payantes. Pas de mot de passe : connexion par Google ou par un lien envoyé par e-mail.</p>
        {erreur && ERREURS[erreur] && <p role="alert" className="mb-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{ERREURS[erreur]}</p>}
        <div className="card space-y-5">
          <a href={`/api/auth/google?retour=${encodeURIComponent(r)}`} className="btn-secondary w-full">Continuer avec Google</a>
          <div className="flex items-center gap-3 text-xs text-gray-600"><span className="h-px flex-1 bg-gray-200" />ou<span className="h-px flex-1 bg-gray-200" /></div>
          <form action="/api/auth/email" method="post" className="space-y-3">
            <input type="hidden" name="retour" value={r} />
            <label className="block text-sm font-semibold text-gray-700" htmlFor="email">Adresse e-mail</label>
            <input id="email" name="email" type="email" required autoComplete="email" className="w-full h-11 rounded-md border border-gray-300 px-3" placeholder="vous@exemple.cm" />
            <button type="submit" className="btn-primary w-full">Recevoir un lien de connexion</button>
          </form>
        </div>
        <p className="mt-4 text-xs text-gray-500">En vous connectant, vous acceptez les <Link href="/cgv" className="underline">conditions générales de vente</Link> et la <Link href="/confidentialite" className="underline">politique de confidentialité</Link>.</p>
      </div>
    </div>
  );
}
