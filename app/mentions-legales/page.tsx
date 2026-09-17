export const metadata = {
  title: "Mentions légales",
  description: "Mentions légales du site S.E.L. Applications.",
};

export default function LegalPage() {
  return (
    <div className="py-16">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">
          Mentions légales
        </h1>

        <div className="prose prose-slate max-w-none space-y-8">
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              1. Éditeur du site
            </h2>
            <p className="text-gray-700">
              <strong>S.E.L. — Structural & Engineering Labs</strong>
              <br />
              Yaoundé, Cameroun
              <br />
              Email : contact@sel-apps.cm
              <br />
              Téléphone : +237 6XX XX XX XX
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              2. Hébergement
            </h2>
            <p className="text-gray-700">
              Le site est hébergé par Vercel Inc.
              <br />
              440 N Barranca Ave #4133, Covina, CA 91723, États-Unis
              <br />
              Site : vercel.com
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              3. Propriété intellectuelle
            </h2>
            <p className="text-gray-700">
              L'ensemble du contenu de ce site (textes, images, logos,
              applications, code source) est la propriété exclusive de S.E.L.
              Toute reproduction, même partielle, est interdite sans
              autorisation écrite préalable.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              4. Responsabilité
            </h2>
            <p className="text-gray-700">
              S.E.L. s'efforce d'assurer l'exactitude des informations
              diffusées sur ce site. Toutefois, elle ne peut garantir
              l'exhaustivité ni l'absence de modification par un tiers. Les
              résultats fournis par les applications sont donnés à titre
              indicatif et doivent être vérifiés par un ingénieur qualifié.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              5. Droit applicable
            </h2>
            <p className="text-gray-700">
              Le présent site est soumis au droit camerounais. Tout litige
              relatif à son utilisation relève de la compétence des tribunaux
              de Yaoundé.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              6. Contact
            </h2>
            <p className="text-gray-700">
              Pour toute question relative aux présentes mentions légales,
              contactez-nous à : contact@sel-apps.cm
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}