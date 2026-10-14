import { NextResponse } from "next/server";
import { envoyerRappels } from "@/lib/serveur/notifications";
import { egaliteSure } from "@/lib/serveur/jetons";

/** Tâche planifiée Vercel (vercel.json) : rappels d'échéance. Protégée par CRON_SECRET (en-tête Authorization). */
export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret || !egaliteSure(req.headers.get("authorization") ?? "", `Bearer ${secret}`)) return new NextResponse("Non autorisé", { status: 401 });
  return NextResponse.json({ envoyes: await envoyerRappels() });
}
