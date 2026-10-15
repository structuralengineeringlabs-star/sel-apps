import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "Vérifiez votre boîte de réception", robots: { index: false } };
type Props = { searchParams: Promise<{ email?: string; retour?: string; erreur?: string }> };

/** Après la demande : saisie du code à 6 chiffres dans ce navigateur (ou clic sur le lien du courriel). */
export default async function VerifierPage({ searchParams }: Props) {
  const { email = "", retour = "/compte", erreur } = await searchParams;
  const r = retour.startsWith("/") && !retour.startsWith("//") ? retour : "/compte";
  return (
    <div className="py-16"><div className="max-w-md mx-auto px-4 card">
      <h1 className="text-2xl font-bold text-gray-900 mb-3">Saisissez votre code</h1>
      <p className="text-gray-700">Un code à 6 chiffres et un lien de connexion ont été envoyés{email ? <> à <strong>{email}</strong></> : null}. Valables 15 minutes, une seule fois.</p>
      {erreur === "code" && <p role="alert" className="mt-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">Code incorrect ou expiré. Vérifiez le dernier courriel reçu ou demandez un nouveau code.</p>}
      {email && (
        <form action="/api/auth/code" method="post" className="mt-5 space-y-3">
          <input type="hidden" name="email" value={email} />
          <input type="hidden" name="retour" value={r} />
          <label className="block text-sm font-semibold text-gray-700" htmlFor="code">Code reçu par e-mail</label>
          <input id="code" name="code" inputMode="numeric" autoComplete="one-time-code" pattern="[0-9 ]{6,7}" maxLength={7} required autoFocus
            className="w-full h-12 rounded-md border border-gray-300 px-3 text-center font-mono text-2xl tracking-[0.4em]" placeholder="000 000" />
          <button type="submit" className="btn-primary w-full">Me connecter</button>
        </form>
      )}
      <p className="text-sm text-gray-500 mt-4">Rien reçu ? Regardez dans les courriers indésirables, ou <Link href={`/connexion?retour=${encodeURIComponent(r)}`} className="underline">recommencez</Link>.</p>
    </div></div>
  );
}
