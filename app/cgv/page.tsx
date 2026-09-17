export const metadata = {
  title: "Conditions Générales de Vente",
  description: "CGV des applications S.E.L.",
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
              Le paiement s'effectue en ligne par :
            </p>
            <ul className="list-disc pl-6 text-gray-700 space-y-1 mt-2">
              <li>Mobile Money (MTN MoMo, Orange Money)</li>
              <li>Carte bancaire (Visa, Mastercard)</li>
              <li>Virement bancaire (sur demande)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              4. Livraison
            </h2>
            <p className="text-gray-700">
              Les applications sont livrées sous forme de licence d'utilisation
              numérique. L'accès est immédiat après confirmation du paiement.
              Une clé de licence est envoyée par email.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              5. Droit de rétractation
            </h2>
            <p className="text-gray-700">
              Conformément à la réglementation en vigueur, le client dispose
              d'un délai de 14 jours pour demander un remboursement, à condition
              que la licence n'ait pas été utilisée.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              6. Garantie
            </h2>
            <p className="text-gray-700">
              S.E.L. garantit la conformité des applications à leur
              documentation. En cas de bug bloquant, S.E.L. s'engage à corriger
              dans les meilleurs délais.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              7. Responsabilité
            </h2>
            <p className="text-gray-700">
              Les résultats fournis par les applications sont donnés à titre
              indicatif. L'utilisateur reste seul responsable de la
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