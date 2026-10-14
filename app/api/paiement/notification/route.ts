import { NextResponse } from "next/server";
import { configuration, xTokenValide, CHAMPS_HMAC } from "@/lib/serveur/cinetpay";
import { synchroniserPaiement } from "@/lib/serveur/abonnements";
import { envoyerConfirmation } from "@/lib/serveur/notifications";

/** CinetPay teste la disponibilité de l'adresse en GET. */
export async function GET() { return new NextResponse("OK"); }

/**
 * Notification de paiement CinetPay : contrôle du jeton x-token (HMAC-SHA256), puis vérification du statut réel par
 * l'API /v2/payment/check (le corps de la notification n'est jamais cru tel quel). Répétitions sans effet.
 */
export async function POST(req: Request) {
  const f = await req.formData();
  const champs = Object.fromEntries(CHAMPS_HMAC.map(k => [k, String(f.get(k) ?? "")]));
  const { secret, site_id } = configuration();
  if (!xTokenValide(champs, req.headers.get("x-token"), secret) || champs.cpm_site_id !== site_id) {
    console.warn("[paiement] notification rejetée (jeton ou site invalide)", champs.cpm_trans_id);
    return new NextResponse("Jeton invalide", { status: 401 });
  }
  try {
    const r = await synchroniserPaiement(champs.cpm_trans_id);
    if (r.issue === "accepte") await envoyerConfirmation(r).catch(e => console.error("[paiement] courriel de confirmation non envoyé", e));
    if (r.issue === "anomalie") console.error("[paiement] ANOMALIE montant/devise", champs.cpm_trans_id);
    return new NextResponse("OK");
  } catch (e) {
    console.error("[paiement] notification non traitée", e);
    return new NextResponse("Erreur", { status: 500 }); // CinetPay renverra la notification
  }
}
