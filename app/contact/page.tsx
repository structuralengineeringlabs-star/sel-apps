"use client";

import { useState } from "react";
import { Mail, Phone, MapPin, Send } from "lucide-react";

export default function ContactPage() {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("loading");

    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData);

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (res.ok) {
        setStatus("success");
        e.currentTarget.reset();
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
  }

  return (
    <div className="py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Contactez-nous
          </h1>
          <p className="text-lg text-gray-600">
            Une question ? Un projet ? Demandez une démo personnalisée.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {/* Formulaire */}
          <div className="card">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nom *
                  </label>
                  <input
                    type="text"
                    name="name"
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sel focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Prénom *
                  </label>
                  <input
                    type="text"
                    name="firstName"
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sel focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email *
                </label>
                <input
                  type="email"
                  name="email"
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sel focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Téléphone
                </label>
                <input
                  type="tel"
                  name="phone"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sel focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Entreprise
                </label>
                <input
                  type="text"
                  name="company"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sel focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Message *
                </label>
                <textarea
                  name="message"
                  required
                  rows={5}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sel focus:border-transparent"
                />
              </div>

              <button
                type="submit"
                disabled={status === "loading"}
                className="btn-primary w-full disabled:opacity-50"
              >
                <Send className="w-5 h-5 mr-2" />
                {status === "loading" ? "Envoi..." : "Envoyer le message"}
              </button>

              {status === "success" && (
                <p className="text-sm text-status-free text-center">
                  ✅ Message envoyé ! Nous vous répondrons sous 24h.
                </p>
              )}
              {status === "error" && (
                <p className="text-sm text-status-new text-center">
                  ❌ Erreur. Veuillez réessayer ou nous contacter directement.
                </p>
              )}
            </form>
          </div>

          {/* Coordonnées */}
          <div className="space-y-6">
            <div className="card">
              <h2 className="text-xl font-bold text-gray-900 mb-6">
                Nos coordonnées
              </h2>
              <ul className="space-y-4">
                <li className="flex items-start space-x-3">
                  <MapPin className="w-5 h-5 text-sel mt-0.5" />
                  <div>
                    <div className="font-semibold">Adresse</div>
                    <div className="text-sm text-gray-600">
                      Yaoundé, Cameroun
                    </div>
                  </div>
                </li>
                <li className="flex items-start space-x-3">
                  <Mail className="w-5 h-5 text-sel mt-0.5" />
                  <div>
                    <div className="font-semibold">Email</div>
                    <a
                      href="mailto:contact@sel-apps.cm"
                      className="text-sm text-sel hover:underline"
                    >
                      contact@sel-apps.cm
                    </a>
                  </div>
                </li>
                <li className="flex items-start space-x-3">
                  <Phone className="w-5 h-5 text-sel mt-0.5" />
                  <div>
                    <div className="font-semibold">Téléphone / WhatsApp</div>
                    <div className="text-sm text-gray-600">
                      +237 6XX XX XX XX
                    </div>
                  </div>
                </li>
              </ul>
            </div>

            <div className="card bg-sel-light">
              <h3 className="font-bold text-sel-dark mb-2">
                💬 Support rapide
              </h3>
              <p className="text-sm text-gray-700">
                Pour une réponse immédiate, contactez-nous sur WhatsApp.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}