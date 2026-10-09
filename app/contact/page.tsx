import type { Metadata } from "next";
import { Mail, Phone, MapPin, MessageCircle } from "lucide-react";
import ContactForm from "@/components/contact/ContactForm";
import { getApplicationBySlug } from "@/data/applications";
import { CONTACT, lienWhatsApp } from "@/lib/contact";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Contactez S.E.L. à Yaoundé : question sur une application de calcul, demande d'accès, démonstration ou projet d'ingénierie. Réponse par WhatsApp ou téléphone.",
};

type Props = {
  searchParams: Promise<{ app?: string }>;
};

export default async function ContactPage({ searchParams }: Props) {
  const { app: slug } = await searchParams;
  const app = slug ? getApplicationBySlug(slug) : undefined;
  const messageInitial = app
    ? `Je souhaite être informé de la disponibilité de l'application « ${app.name} » et de ses conditions d'accès.`
    : "";

  return (
    <div className="py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Contactez-nous</h1>
          <p className="text-lg text-gray-600">
            Une question ? Un projet ? Demandez une démo personnalisée.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {/* Formulaire */}
          <div className="card">
            <ContactForm messageInitial={messageInitial} />
          </div>

          {/* Coordonnées */}
          <div className="space-y-6">
            <div className="card">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Nos coordonnées</h2>
              <ul className="space-y-4">
                <li className="flex items-start space-x-3">
                  <MapPin className="w-5 h-5 text-sel mt-0.5" aria-hidden="true" />
                  <div>
                    <div className="font-semibold">Adresse</div>
                    <div className="text-sm text-gray-600">{CONTACT.ville}</div>
                  </div>
                </li>
                <li className="flex items-start space-x-3">
                  <Phone className="w-5 h-5 text-sel mt-0.5" aria-hidden="true" />
                  <div>
                    <div className="font-semibold">Téléphone</div>
                    <a href={CONTACT.telephoneHref} className="text-sm text-sel hover:underline">
                      {CONTACT.telephone}
                    </a>
                  </div>
                </li>
                <li className="flex items-start space-x-3">
                  <MessageCircle className="w-5 h-5 text-sel mt-0.5" aria-hidden="true" />
                  <div>
                    <div className="font-semibold">WhatsApp</div>
                    <a
                      href={lienWhatsApp()}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-sel hover:underline"
                    >
                      {CONTACT.whatsapp}
                    </a>
                  </div>
                </li>
                <li className="flex items-start space-x-3">
                  <Mail className="w-5 h-5 text-sel mt-0.5" aria-hidden="true" />
                  <div>
                    <div className="font-semibold">E-mail</div>
                    <a href={`mailto:${CONTACT.email}`} className="text-sm text-sel hover:underline break-all">
                      {CONTACT.email}
                    </a>
                  </div>
                </li>
              </ul>
            </div>

            <div className="card bg-sel-light">
              <h2 className="font-bold text-sel-dark mb-2">💬 Support rapide</h2>
              <p className="text-sm text-gray-700">
                Pour une réponse immédiate, écrivez-nous sur{" "}
                <a href={lienWhatsApp()} target="_blank" rel="noopener noreferrer" className="text-sel underline">
                  WhatsApp
                </a>
                .
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
