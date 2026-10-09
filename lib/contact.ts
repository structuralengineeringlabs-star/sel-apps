// Coordonnées de S.E.L. : seul endroit à modifier quand elles changent.

export const CONTACT = {
  /** Adresse affichée (le domaine sel-apps.cm reste à mettre en service). */
  email: "contact@sel-apps.cm",
  telephone: "+237 651 13 56 05",
  telephoneHref: "tel:+237651135605",
  whatsapp: "+237 696 20 65 86",
  whatsappNumero: "237696206586",
  ville: "Yaoundé, Cameroun",
} as const;

/** Lien WhatsApp, avec un message prérempli si fourni. */
export function lienWhatsApp(message?: string): string {
  const base = `https://wa.me/${CONTACT.whatsappNumero}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}
