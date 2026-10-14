/** Envoi de courriels transactionnels par l'API HTTP de Resend (RESEND_API_KEY, EMAIL_EXPEDITEUR). */
import "server-only";

export interface Courriel { a: string; sujet: string; texte: string; html: string }

export async function envoyerCourriel(c: Courriel, f: typeof fetch = fetch): Promise<void> {
  const cle = process.env.RESEND_API_KEY, de = process.env.EMAIL_EXPEDITEUR;
  if (!cle || !de) throw new Error("Envoi de courriels non configuré (RESEND_API_KEY, EMAIL_EXPEDITEUR).");
  const r = await f("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${cle}`, "Content-Type": "application/json" },
    body: JSON.stringify({ from: de, to: [c.a], subject: c.sujet, text: c.texte, html: c.html }),
  });
  if (!r.ok) throw new Error(`Envoi du courriel refusé (${r.status}).`);
}

const echapper = (s: string) => s.replace(/[&<>"]/g, ch => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[ch]!);
/** Gabarit sobre : un paragraphe, un bouton, une mention. */
export function gabarit(titre: string, paragraphe: string, bouton: { texte: string; url: string } | null, mention: string): string {
  return `<div style="font-family:Arial,sans-serif;max-width:520px;margin:auto;color:#111">
<p style="font-weight:700;font-size:16px">${echapper(titre)}</p><p>${echapper(paragraphe)}</p>
${bouton ? `<p><a href="${echapper(bouton.url)}" style="display:inline-block;background:#3a9bd5;color:#fff;padding:10px 16px;border-radius:6px;text-decoration:none;font-weight:700">${echapper(bouton.texte)}</a></p>` : ""}
<p style="color:#6b7280;font-size:12px">${echapper(mention)}</p>
<p style="color:#6b7280;font-size:12px">Structural &amp; Engineering Labs</p></div>`;
}
