import { CONTACT } from "@/lib/contact";
import { SITE_URL } from "@/lib/site";

export const metadata = {
  title: "Politique de confidentialité",
  description: "Politique de confidentialité de S.E.L. Applications : données traitées, finalités, conservation, partage et exercice de vos droits d'accès et de suppression.",
};

export default function PrivacyPage() {
  return (
    <div className="py-16">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">
          Politique de confidentialité
        </h1>

        <div className="prose prose-slate max-w-none space-y-8">
          <p className="text-gray-700">
            Le responsable du traitement est S.E.L. — Structural &amp; Engineering Labs, Yaoundé (Cameroun), joignable à 
            <a href={`mailto:${CONTACT.email}`} className="text-sel underline">{CONTACT.email}</a>. Cette politique
            s&apos;applique au site {SITE_URL.replace("https://", "")} et aux applications de calcul qu&apos;il propose.
          </p>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Données traitées</h2>
            <ul className="list-disc pl-6 text-gray-700 space-y-1 mt-2">
              <li><strong>Compte</strong> : adresse e-mail ; nom et identifiant Google si vous vous connectez avec Google.</li>
              <li><strong>Abonnements et paiements</strong> : application, formule, montant, date, référence de transaction et moyen de
                paiement (Mobile Money ou carte). Les numéros de carte et codes Mobile Money sont saisis chez CinetPay : S.E.L. n&apos;y a
                jamais accès.</li>
              <li><strong>Connexion</strong> : sessions (empreinte du jeton, dates) et liens de connexion à usage unique.</li>
              <li><strong>Messages</strong> que vous nous adressez par e-mail ou WhatsApp.</li>
              <li><strong>Projets de calcul</strong> : enregistrés uniquement dans votre navigateur (ou dans les fichiers que vous
                exportez) ; ils ne sont pas transmis à S.E.L.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Finalités</h2>
            <ul className="list-disc pl-6 text-gray-700 space-y-1 mt-2">
              <li>Créer et sécuriser votre compte, vous donner accès aux applications souscrites ;</li>
              <li>Encaisser les paiements, émettre les reçus et tenir la comptabilité ;</li>
              <li>Vous envoyer les messages liés au service (lien de connexion, confirmation de paiement, rappel avant l&apos;échéance) ;</li>
              <li>Répondre à vos demandes d&apos;assistance.</li>
            </ul>
            <p className="text-gray-700 mt-2">Aucune publicité, aucun profilage, aucune revente de données.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">3. Prestataires</h2>
            <p className="text-gray-700">Les données ne sont communiquées qu&apos;aux prestataires nécessaires au service :</p>
            <ul className="list-disc pl-6 text-gray-700 space-y-1 mt-2">
              <li>Vercel Inc. (hébergement du site, États-Unis) ;</li>
              <li>Neon Inc. (base de données des comptes et paiements) ;</li>
              <li>CinetPay (paiement, Côte d&apos;Ivoire) ;</li>
              <li>Google (connexion avec un compte Google, si vous la choisissez) ;</li>
              <li>Resend (envoi des e-mails automatiques) et Zoho (messagerie de contact).</li>
            </ul>
            <p className="text-gray-700 mt-2">Certains de ces prestataires traitent les données hors du Cameroun, dans le cadre de leurs engagements contractuels de sécurité.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Durées de conservation</h2>
            <ul className="list-disc pl-6 text-gray-700 space-y-1 mt-2">
              <li>Compte : tant qu&apos;il est utilisé, ou jusqu&apos;à votre demande de suppression ;</li>
              <li>Paiements et reçus : 10 ans (obligation comptable, Acte uniforme OHADA) ;</li>
              <li>Sessions : 30 jours ; liens de connexion : 15 minutes.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Vos droits</h2>
            <p className="text-gray-700">
              Vous pouvez demander l&apos;accès à vos données, leur rectification ou leur suppression (sous réserve des obligations
              comptables) en écrivant à <a href={`mailto:${CONTACT.email}`} className="text-sel underline">{CONTACT.email}</a>.
              Réponse sous 30 jours.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Cookies</h2>
            <p className="text-gray-700">
              Le site n&apos;utilise ni cookie publicitaire ni outil de mesure d&apos;audience. Seuls des cookies strictement nécessaires
              sont déposés : <code>sel_session</code> (maintien de la connexion, 30 jours) et <code>sel_oauth</code> (sécurisation de la
              connexion Google, 10 minutes). Ils ne requièrent pas de consentement ; les bloquer empêche seulement la connexion.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Sécurité</h2>
            <p className="text-gray-700">
              Échanges chiffrés (HTTPS), jetons de session conservés sous forme d&apos;empreinte, notifications de paiement vérifiées
              par signature, accès aux données limité à S.E.L.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}