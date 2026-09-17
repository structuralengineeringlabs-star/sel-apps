import Link from "next/link";
import { MapPin, Users, Award, Target } from "lucide-react";
import Logo from "@/components/Logo";

export const metadata = {
  title: "À propos",
  description:
    "Découvrez S.E.L. — Structural & Engineering Labs, éditeur de logiciels de calcul pour l'ingénierie civile au Cameroun.",
};

export default function AboutPage() {
  return (
    <div className="py-16">
      {/* Hero */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center mb-16">
        <div className="flex justify-center mb-6">
          <Logo variant="dark" size="lg" showText={false} />
        </div>
        <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6">
          À propos de S.E.L.
        </h1>
        <p className="text-lg text-gray-600">
          Structural & Engineering Labs — éditeur de logiciels de calcul pour
          l'ingénierie civile, basé à Yaoundé, Cameroun.
        </p>
      </div>

      {/* Mission */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mb-16">
        <div className="card">
          <div className="flex items-start space-x-4">
            <Target className="w-8 h-8 text-sel flex-shrink-0 mt-1" />
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Notre mission
              </h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                S.E.L. développe des <strong>applications de calcul</strong>{" "}
                pour les ingénieurs civils, bureaux d'études et techniciens
                BTP. Nos outils couvrent le <strong>béton armé</strong>,{" "}
                <strong>l'hydraulique</strong>, les{" "}
                <strong>ouvrages d'art</strong>, les <strong>routes</strong> et
                la <strong>gestion de projets</strong>.
              </p>
              <p className="text-gray-700 leading-relaxed">
                Toutes nos applications sont conformes aux{" "}
                <strong>Eurocodes</strong> (EC2, EC3, EC5) et aux normes
                internationales (AASHTO, HDM-4). Elles sont conçues pour être{" "}
                <strong>simples, rapides et précises</strong>, adaptées aux
                réalités du terrain africain.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Valeurs */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mb-16">
        <h2 className="text-3xl font-bold text-gray-900 text-center mb-10">
          Nos valeurs
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              icon: Award,
              title: "Excellence technique",
              description:
                "Nos calculs sont vérifiés et conformes aux normes en vigueur.",
            },
            {
              icon: Users,
              title: "Proximité client",
              description:
                "Support en français, réactif, adapté aux besoins locaux.",
            },
            {
              icon: MapPin,
              title: "Ancrage africain",
              description:
                "Développé au Cameroun, pour l'Afrique et la francophonie.",
            },
          ].map((v) => {
            const IconComponent = v.icon;
            return (
              <div key={v.title} className="card text-center">
                <div className="w-14 h-14 bg-sel-light rounded-xl flex items-center justify-center mx-auto mb-4">
                  <IconComponent className="w-7 h-7 text-sel" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">
                  {v.title}
                </h3>
                <p className="text-sm text-gray-600">{v.description}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Chiffres */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mb-16">
        <div className="bg-gradient-to-br from-sel to-sel-dark text-white rounded-2xl p-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { value: "19", label: "Applications" },
              { value: "7", label: "Gratuites" },
              { value: "6", label: "Catégories" },
              { value: "100%", label: "Conforme EC" },
            ].map((s) => (
              <div key={s.label}>
                <div className="text-4xl font-bold mb-2">{s.value}</div>
                <div className="text-sm text-white/80 uppercase tracking-wide">
                  {s.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Envie de découvrir nos applications ?
        </h2>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/applications" className="btn-primary">
            Voir le catalogue
          </Link>
          <Link href="/contact" className="btn-secondary">
            Nous contacter
          </Link>
        </div>
      </section>
    </div>
  );
}