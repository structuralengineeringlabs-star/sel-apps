export const metadata = {
  title: "Politique de confidentialité",
  description: "Politique de confidentialité du site S.E.L.",
};

export default function PrivacyPage() {
  return (
    <div className="py-16">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">
          Politique de confidentialité
        </h1>

        <div className="prose prose-slate max-w-none space-y-8">
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              1. Données collectées
            </h2>
            <p className="text-gray-700">
              S.E.L. collecte les données suivantes :
            </p>
            <ul className="list-disc pl-6 text-gray-700 space-y-1 mt-2">
              <li>Nom, prénom</li>
              <li>Email</li>
              <li>Téléphone</li>
              <li>Entreprise (optionnel)</li>
              <li>Données de paiement (traitées par nos partenaires)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              2. Utilisation des données
            </h2>
            <p className="text-gray-700">
              Vos données sont utilisées pour :
            </p>
            <ul className="list-disc pl-6 text-gray-700 space-y-1 mt-2">
              <li>Traiter vos commandes</li>
              <li>Vous envoyer vos licences</li>
              <li>Vous informer de nos nouveautés (avec votre accord)</li>
              <li>Améliorer nos services</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              3. Partage des données
            </h2>
            <p className="text-gray-700">
              Vos données ne sont jamais vendues à des tiers. Elles peuvent
              être partagées avec nos prestataires de paiement (CinetPay,
              Stripe) pour traiter vos transactions.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              4. Conservation
            </h2>
            <p className="text-gray-700">
              Vos données sont conservées pendant la durée de votre relation
              commerciale avec S.E.L., puis archivées conformément aux
              obligations légales.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              5. Vos droits
            </h2>
            <p className="text-gray-700">
              Vous disposez d'un droit d'accès, de rectification et de
              suppression de vos données. Pour exercer ces droits, contactez
              contact@sel-apps.cm.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              6. Cookies
            </h2>
            <p className="text-gray-700">
              Le site utilise des cookies pour améliorer l'expérience
              utilisateur. Vous pouvez les désactiver dans les paramètres de
              votre navigateur.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}