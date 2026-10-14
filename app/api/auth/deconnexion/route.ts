import { NextResponse } from "next/server";
import { fermerSession } from "@/lib/serveur/session";
import { baseUrl, origineSure } from "@/lib/serveur/securite";

export async function POST(req: Request) {
  if (!origineSure(req)) return new NextResponse("Origine refusée", { status: 403 });
  await fermerSession();
  return NextResponse.redirect(new URL("/", baseUrl(req)), 303);
}
