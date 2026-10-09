"use client";

import { useState } from "react";
import { MessageCircle } from "lucide-react";
import { lienWhatsApp } from "@/lib/contact";

type Props = {
  /** Message prérempli (par exemple une demande d'accès à une application). */
  messageInitial?: string;
};

const champ =
  "w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sel focus:border-transparent";

// Le message est transmis par WhatsApp : il arrive directement à S.E.L., sans serveur intermédiaire
// ni conservation de données sur le site.
export default function ContactForm({ messageInitial = "" }: Props) {
  const [ouvert, setOuvert] = useState(false);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const v = (cle: string) => String(f.get(cle) ?? "").trim();

    const lignes = [`Bonjour, je suis ${v("firstName")} ${v("name")}.`];
    if (v("company")) lignes.push(`Entreprise : ${v("company")}`);
    if (v("email")) lignes.push(`E-mail : ${v("email")}`);
    if (v("phone")) lignes.push(`Téléphone : ${v("phone")}`);
    lignes.push("", v("message"));

    window.open(lienWhatsApp(lignes.join("\n")), "_blank", "noopener,noreferrer");
    setOuvert(true);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="contact-nom" className="block text-sm font-medium text-gray-700 mb-2">
            Nom *
          </label>
          <input id="contact-nom" type="text" name="name" required maxLength={100} autoComplete="family-name" className={champ} />
        </div>
        <div>
          <label htmlFor="contact-prenom" className="block text-sm font-medium text-gray-700 mb-2">
            Prénom *
          </label>
          <input id="contact-prenom" type="text" name="firstName" required maxLength={100} autoComplete="given-name" className={champ} />
        </div>
      </div>

      <div>
        <label htmlFor="contact-email" className="block text-sm font-medium text-gray-700 mb-2">
          E-mail
        </label>
        <input id="contact-email" type="email" name="email" maxLength={200} autoComplete="email" className={champ} />
      </div>

      <div>
        <label htmlFor="contact-telephone" className="block text-sm font-medium text-gray-700 mb-2">
          Téléphone
        </label>
        <input id="contact-telephone" type="tel" name="phone" maxLength={40} autoComplete="tel" className={champ} />
      </div>

      <div>
        <label htmlFor="contact-entreprise" className="block text-sm font-medium text-gray-700 mb-2">
          Entreprise
        </label>
        <input id="contact-entreprise" type="text" name="company" maxLength={150} autoComplete="organization" className={champ} />
      </div>

      <div>
        <label htmlFor="contact-message" className="block text-sm font-medium text-gray-700 mb-2">
          Message *
        </label>
        <textarea
          id="contact-message"
          name="message"
          required
          rows={5}
          maxLength={3000}
          defaultValue={messageInitial}
          className={champ}
        />
      </div>

      <button type="submit" className="btn-primary w-full">
        <MessageCircle className="w-5 h-5 mr-2" aria-hidden="true" />
        Envoyer par WhatsApp
      </button>

      <p className="text-xs text-gray-500 text-center" aria-live="polite">
        {ouvert
          ? "WhatsApp s'est ouvert avec votre message : appuyez sur « Envoyer » dans WhatsApp pour nous le transmettre."
          : "Le message s'ouvre dans WhatsApp, prêt à être envoyé. Rien n'est enregistré sur ce site."}
      </p>
    </form>
  );
}
