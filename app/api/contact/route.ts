import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const data = await request.json();

    // Validation basique
    if (!data.name || !data.email || !data.message) {
      return NextResponse.json(
        { error: "Champs obligatoires manquants" },
        { status: 400 }
      );
    }

    // TODO: Envoyer un email via Resend/SendGrid
    // TODO: Enregistrer en base de données
    console.log("Nouveau message de contact:", data);

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 }
    );
  }
}