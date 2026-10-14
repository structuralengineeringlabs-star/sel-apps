import { NextResponse } from "next/server";
import { configurationNotch, signatureNotchValide } from "@/lib/serveur/notchpay";
import { synchroniserPaiement, transactionPourReferences } from "@/lib/serveur/abonnements";
import { envoyerConfirmation } from "@/lib/serveur/notifications";

/**
 * Notification Notch Pay (webhook) : contrôle de la signature x-notch-signature (HMAC-SHA256 du corps brut, clé
 * NOTCHPAY_HASH), puis lecture du statut réel par l'API (le contenu de la notification n'est jamais cru tel quel).
 * Répétitions sans effet. Adresse à déclarer dans Notch Pay : https://sel-apps.com/api/paiement/notchpay
 */
export async function POST(req: Request) {
  const corps = await req.text();
  const { hash } = configurationNotch();
  if (!hash) return new NextResponse("Notifications Notch Pay non configurées (NOTCHPAY_HASH)", { status: 503 });
  if (!signatureNotchValide(corps, req.headers.get("x-notch-signature"), hash)) {
    console.warn("[paiement] notification Notch Pay rejetée (signature invalide)");
    return new NextResponse("Signature invalide", { status: 403 });
  }
  let evt: { event?: string; type?: string; data?: Record<string, unknown> } = {};
  try { evt = JSON.parse(corps); } catch { return new NextResponse("Corps illisible", { status: 400 }); }
  const d = evt.data ?? {};
  const refs = ["merchant_reference", "reference", "trxref", "id"].map(k => (typeof d[k] === "string" ? (d[k] as string) : ""));
  const transaction = await transactionPourReferences(refs);
  if (!transaction) return new NextResponse("OK"); // paiement étranger au site (lien de paiement manuel, etc.)
  try {
    const r = await synchroniserPaiement(transaction);
    if (r.issue === "accepte") await envoyerConfirmation(r).catch(e => console.error("[paiement] courriel de confirmation non envoyé", e));
    if (r.issue === "anomalie") console.error("[paiement] ANOMALIE montant/devise", transaction);
    return new NextResponse("OK");
  } catch (e) {
    console.error("[paiement] notification Notch Pay non traitée", e);
    return new NextResponse("Erreur", { status: 500 });
  }
}
