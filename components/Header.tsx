"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, X, Search } from "lucide-react";
import Logo from "./Logo";

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { label: "Accueil", href: "/" },
    { label: "Applications", href: "/applications" },
    { label: "Tarifs", href: "/tarifs" },
    { label: "Documentation", href: "/documentation" },
    { label: "Contact", href: "/contact" },
  ];

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo S.E.L. */}
          <Logo variant="dark" size="md" />

          {/* Navigation desktop */}
          <nav className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-sm font-medium text-gray-700 hover:text-sel transition-colors relative group"
              >
                {item.label}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-sel group-hover:w-full transition-all duration-200" />
              </Link>
            ))}
          </nav>

          {/* Actions */}
          <div className="flex items-center space-x-3">
            {/* Recherche */}
            <button
              className="p-2 text-gray-500 hover:text-sel transition-colors"
              aria-label="Rechercher"
            >
              <Search className="w-5 h-5" />
            </button>

            {/* Bouton démo desktop */}
            <Link
              href="/contact"
              className="hidden md:inline-flex items-center justify-center px-4 py-2 rounded-lg bg-sel text-white text-sm font-semibold hover:bg-sel-dark transition-colors"
            >
              Demander une démo
            </Link>

            {/* Menu burger mobile */}
            <button
              className="md:hidden p-2 text-gray-700 hover:text-sel transition-colors"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label={mobileMenuOpen ? "Fermer le menu" : "Ouvrir le menu"}
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Menu mobile */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-gray-200 bg-white shadow-lg">
          <nav className="px-4 py-4 space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="block px-4 py-3 rounded-lg text-sm font-medium text-gray-700 hover:bg-sel-light hover:text-sel transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                {item.label}
              </Link>
            ))}

            {/* Bouton démo mobile */}
            <Link
              href="/contact"
              className="block mt-3 px-4 py-3 rounded-lg bg-sel text-white text-sm font-semibold text-center hover:bg-sel-dark transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              Demander une démo
            </Link>

            {/* Contact mobile */}
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="text-xs text-gray-500 mb-2">Contact rapide</div>
              <a
                href="mailto:contact@sel-apps.cm"
                className="block text-sm text-sel hover:underline"
              >
                contact@sel-apps.cm
              </a>
              <a
                href="https://wa.me/2376XXXXXXXX"
                target="_blank"
                rel="noopener noreferrer"
                className="block text-sm text-sel hover:underline mt-1"
              >
                WhatsApp : +237 6XX XX XX XX
              </a>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}