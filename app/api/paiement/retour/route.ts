import { NextResponse } from "next/server";
import { baseUrl } from "@/lib/serveur/securite";

/** Retour du client depuis le guichet CinetPay (GET ou POST) : page d'état du paiement. */
async function retour(req: Request) {
  const t = new URL(req.url).searchParams.get("transaction") ?? "";
  const ok = /^SEL[A-Z0-9]{6,40}$/.test(t);
  return NextResponse.redirect(new URL(ok ? `/compte/paiement/${t}` : "/compte", baseUrl(req)), 303);
}
export { retour as GET, retour as POST };
