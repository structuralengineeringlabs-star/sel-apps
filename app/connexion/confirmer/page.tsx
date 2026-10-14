import type { Metadata } from "next";

export const metadata: Metadata = { title: "Confirmer la connexion", robots: { index: false } };
type Props = { searchParams: Promise<{ jeton?: string }> };

/** Le lien du courriel arrive ici ; la connexion n'a lieu qu'au clic (protège le jeton des robots d'analyse des messageries). */
export default async function ConfirmerPage({ searchParams }: Props) {
  const { jeton = "" } = await searchParams;
  return (
    <div className="py-16"><div className="max-w-md mx-auto px-4 card">
      <h1 className="text-2xl font-bold text-gray-900 mb-4">Confirmer la connexion</h1>
      <form action="/api/auth/verifier" method="post">
        <input type="hidden" name="jeton" value={jeton} />
        <button type="submit" className="btn-primary w-full">Me connecter</button>
      </form>
    </div></div>
  );
}
