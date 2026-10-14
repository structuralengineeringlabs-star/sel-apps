import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "Vérifiez votre boîte de réception", robots: { index: false } };
type Props = { searchParams: Promise<{ email?: string }> };

export default async function VerifierPage({ searchParams }: Props) {
  const { email } = await searchParams;
  return (
    <div className="py-16"><div className="max-w-md mx-auto px-4 card">
      <h1 className="text-2xl font-bold text-gray-900 mb-3">Vérifiez votre boîte de réception</h1>
      <p className="text-gray-700">Un lien de connexion a été envoyé{email ? <> à <strong>{email}</strong></> : null}. Il est valable 15 minutes et ne sert qu&apos;une fois.</p>
      <p className="text-sm text-gray-500 mt-3">Rien reçu ? Regardez dans les courriers indésirables, ou <Link href="/connexion" className="underline">recommencez</Link>.</p>
    </div></div>
  );
}
