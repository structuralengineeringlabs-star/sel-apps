import Link from "next/link";
import { Mail, Phone, MapPin, MessageCircle, Globe } from "lucide-react";
import Logo from "./Logo";
import { CONTACT, lienWhatsApp } from "@/lib/contact";

export default function Footer() {
  return (
    <footer className="bg-sel-dark text-white mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-10">
          {/* Colonne 1 — Logo + description */}
          <div className="lg:col-span-1">
            <div className="mb-4">
              <Logo variant="light" size="md" />
            </div>
            <p className="text-sm text-white/80 mb-6">
              Éditeur de logiciels de calcul pour l&apos;ingénierie civile. 19
              applications conformes aux Eurocodes.
            </p>
            <div className="flex items-center space-x-3">
              <a
                href={lienWhatsApp()}
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
                aria-label="WhatsApp"
              >
                <MessageCircle className="w-4 h-4" />
              </a>
              <a
                href="https://linkedin.com/company/sel-apps"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
                aria-label="LinkedIn"
              >
                <Globe className="w-4 h-4" />
              </a>
              <a
                href={`mailto:${CONTACT.email}`}
                className="w-9 h-9 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
                aria-label="Email"
              >
                <Mail className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Colonne 2 — Applications (6 catégories) */}
          <div>
            <h2 className="text-sm font-bold uppercase tracking-wide mb-4 text-white">
              Applications
            </h2>
            <ul className="space-y-2 text-sm text-white/80">
              <li>
                <Link
                  href="/applications?cat=batiments"
                  className="hover:text-white transition-colors"
                >
                  Bâtiments
                </Link>
              </li>
              <li>
                <Link
                  href="/applications?cat=ponts-dalots-reservoirs"
                  className="hover:text-white transition-colors"
                >
                  Ponts, Dalots & Réservoirs
                </Link>
              </li>
              <li>
                <Link
                  href="/applications?cat=routes"
                  className="hover:text-white transition-colors"
                >
                  Routes & Infrastructures
                </Link>
              </li>
              <li>
                <Link
                  href="/applications?cat=charpente"
                  className="hover:text-white transition-colors"
                >
                  Charpente bois & Métallique
                </Link>
              </li>
              <li>
                <Link
                  href="/applications?cat=geotechnique"
                  className="hover:text-white transition-colors"
                >
                  Géotechnique
                </Link>
              </li>
              <li>
                <Link
                  href="/applications?cat=autres"
                  className="hover:text-white transition-colors"
                >
                  Autres
                </Link>
              </li>
            </ul>
          </div>

          {/* Colonne 3 — Liens utiles */}
          <div>
            <h2 className="text-sm font-bold uppercase tracking-wide mb-4 text-white">
              Liens utiles
            </h2>
            <ul className="space-y-2 text-sm text-white/80">
              <li>
                <Link href="/a-propos" className="hover:text-white transition-colors">
                  À propos
                </Link>
              </li>
              <li>
                <Link href="/tarifs" className="hover:text-white transition-colors">
                  Tarifs
                </Link>
              </li>
              <li>
                <Link href="/documentation" className="hover:text-white transition-colors">
                  Documentation
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-white transition-colors">
                  Contact
                </Link>
              </li>
              <li className="pt-2 border-t border-white/10 mt-3">
                <Link href="/mentions-legales" className="hover:text-white transition-colors">
                  Mentions légales
                </Link>
              </li>
              <li>
                <Link href="/cgv" className="hover:text-white transition-colors">
                  CGV
                </Link>
              </li>
              <li>
                <Link href="/confidentialite" className="hover:text-white transition-colors">
                  Politique de confidentialité
                </Link>
              </li>
            </ul>
          </div>

          {/* Colonne 4 — Contact */}
          <div>
            <h2 className="text-sm font-bold uppercase tracking-wide mb-4 text-white">
              Contact
            </h2>
            <ul className="space-y-3 text-sm text-white/80">
              <li className="flex items-start space-x-2">
                <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span>
                  Yaoundé, Cameroun
                  <br />
                  <span className="text-white/75 text-xs">(sur rendez-vous)</span>
                </span>
              </li>
              <li className="flex items-start space-x-2">
                <Mail className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <a
                  href={`mailto:${CONTACT.email}`}
                  className="hover:text-white transition-colors break-all"
                >
                  {CONTACT.email}
                </a>
              </li>
              <li className="flex items-start space-x-2">
                <Phone className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <a
                  href={CONTACT.telephoneHref}
                  className="hover:text-white transition-colors"
                >
                  {CONTACT.telephone}
                </a>
              </li>
              <li className="flex items-start space-x-2">
                <MessageCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <a
                  href={lienWhatsApp()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors"
                >
                  WhatsApp : {CONTACT.whatsapp}
                </a>
              </li>
            </ul>

            <div className="mt-6 pt-4 border-t border-white/10">
              <div className="text-xs text-white/75 mb-2">Horaires</div>
              <div className="text-xs text-white/80">
                Lun – Ven : 8h – 18h
                <br />
                Sam : 9h – 13h
              </div>
            </div>
          </div>
        </div>

        {/* Newsletter */}
        <div className="border-t border-white/20 py-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
            <div>
              <h2 className="text-sm font-bold uppercase tracking-wide mb-2 text-white">
                Restez informé
              </h2>
              <p className="text-sm text-white/70">
                Nouvelles applications et mises à jour : demandez à être prévenu.
              </p>
            </div>
            <div className="md:text-right">
              <a
                href={lienWhatsApp("Bonjour, je souhaite être informé des nouveautés des applications S.E.L.")}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2 rounded-lg bg-white text-sel-dark font-semibold hover:bg-gray-100 transition-colors"
              >
                <MessageCircle className="w-4 h-4" aria-hidden="true" />
                Être prévenu sur WhatsApp
              </a>
            </div>
          </div>
        </div>

        {/* Bas de page */}
        <div className="border-t border-white/20 pt-8 flex flex-col sm:flex-row justify-between items-center text-xs text-white/75 space-y-4 sm:space-y-0">
          <div className="text-center sm:text-left">
            © {new Date().getFullYear()} S.E.L. — Structural & Engineering Labs.
            Tous droits réservés.
          </div>
          <div className="flex flex-wrap justify-center gap-x-4 gap-y-2">
            <Link href="/mentions-legales" className="hover:text-white">
              Mentions légales
            </Link>
            <span className="text-white/30">·</span>
            <Link href="/cgv" className="hover:text-white">
              CGV
            </Link>
            <span className="text-white/30">·</span>
            <Link href="/confidentialite" className="hover:text-white">
              Confidentialité
            </Link>
          </div>
          <div className="text-center sm:text-right">
            Conçu à Yaoundé, Cameroun 🇨🇲
          </div>
        </div>
      </div>
    </footer>
  );
}