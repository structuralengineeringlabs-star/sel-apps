export const metadata = {
  title: "Conditions Générales de Vente",
  description: "Conditions générales de vente des applications de calcul S.E.L. : prix en francs CFA, modalités d'accès, garanties, responsabilité et règlement des litiges.",
};

export default function CGVPage() {
  return (
    <div className="py-16">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">
          Conditions Générales de Vente
        </h1>

        <div className="prose prose-slate max-w-none space-y-8">
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              1. Objet
            </h2>
            <p className="text-gray-700">
              Les présentes CGV régissent la vente des applications logicielles
              éditées par S.E.L. à destination des professionnels et
              particuliers.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              2. Prix
            </h2>
            <p className="text-gray-700">
              Les prix sont indiqués en francs CFA (XAF), toutes taxes
              comprises. S.E.L. se réserve le droit de modifier ses prix à tout
              moment, étant entendu que le prix applicable est celui en vigueur
              au moment de la commande.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              3. Paiement
            </h2>
            <p className="text-gray-700">
              Le paiement s&apos;effectue en ligne par :
            </p>
            <ul className="list-disc pl-6 text-gray-700 space-y-1 mt-2">
              <li>Mobile Money (MTN MoMo, Orange Money)</li>
              <li>Carte bancaire (Visa, Mastercard)</li>
              <li>Virement bancaire (sur demande)</li>
            </ul>
            <p className="text-gray-700 mt-2">
              Les paiements en ligne sont traités par CinetPay ; S.E.L. ne reçoit ni ne conserve
              aucune donnée de carte ou de compte Mobile Money. Un abonnement mensuel donne accès à
              l&apos;application pendant 30 jours, un abonnement annuel pendant 365 jours, à compter
              du paiement ou de la fin de l&apos;abonnement en cours. Il n&apos;y a pas de reconduction
              automatique : chaque période fait l&apos;objet d&apos;un nouveau paiement. Un reçu est
              disponible dans l&apos;espace « Mon compte ».
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              4. Livraison
            </h2>
            <p className="text-gray-700">
              Les applications sont livrées sous forme de licence d&apos;utilisation
              numérique. L&apos;accès est immédiat après confirmation du paiement par
              l&apos;opérateur ; il est rattaché au compte utilisé pour le paiement (connexion par
              Google ou par lien envoyé par e-mail) et une confirmation est envoyée par e-mail.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              5. Droit de rétractation
            </h2>
            <p className="text-gray-700">
              Conformément à la réglementation en vigueur, le client dispose
              d&apos;un délai de 14 jours pour demander un remboursement, à condition
              que la licence n&apos;ait pas été utilisée.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              6. Garantie
            </h2>
            <p className="text-gray-700">
              S.E.L. garantit la conformité des applications à leur
              documentation. En cas de bug bloquant, S.E.L. s&apos;engage à corriger
              dans les meilleurs délais.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              7. Responsabilité
            </h2>
            <p className="text-gray-700">
              Les résultats fournis par les applications sont donnés à titre
              indicatif. L&apos;utilisateur reste seul responsable de la
              vérification des calculs et de leur application à ses projets.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              8. Litiges
            </h2>
            <p className="text-gray-700">
              Tout litige sera soumis aux tribunaux compétents de Yaoundé,
              Cameroun.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}