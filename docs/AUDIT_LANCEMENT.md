# Audit de lancement des abonnements — 14/10/2026

Décisions : XOF intégré (P1) ; CinetPay conservé en secours (P2) ; administration livrée (P3) ; base de
prévisualisation séparée (P4) ; tarif d'essai de 100 F CFA pour le test réel (P5) ; aucun remboursement (P6).

Statut : ✅ fait et vérifié · 🔑 action du titulaire des comptes · ⏳ à faire au lancement.

## Constats de départ

| N° | Constat | Suite |
|---|---|---|
| C1 | `CRON_SECRET` absent : rappels J-7 / J-1 jamais envoyés | ✅ variable créée (Production et Preview) ; erreur explicite dans les journaux si elle venait à manquer |
| C2 | Bouton Google affiché sans configuration | ✅ masqué tant que `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` manquent |
| C3 | Paiement d'essai dans la base de production | ✅ marqué « essai » ; ⏳ purge depuis `/admin` avant le lancement |
| C4 | Réservoirs absent de `/tarifs` | Infirmé : la table est tirée du catalogue. Mais la page promettait carte bancaire, virement, résiliation et changement de formule : ✅ textes corrigés |
| C5 | Notification Notch Pay jamais reçue | 🔑 webhook et `NOTCHPAY_HASH` ; la confirmation au retour du client fonctionne déjà |
| C6 | Remboursements non gérés | ✅ sans objet (P6) : CGV « aucun remboursement » et acceptation obligatoire |
| C7 | Pas d'administration | ✅ `/admin` |

## Réalisations

| Lot | Contenu | Vérification |
|---|---|---|
| Paiement | Pays de paiement (Cameroun XAF, Côte d'Ivoire et Sénégal XOF) ; devise enregistrée et exigée à la confirmation ; pays transmis au prestataire | tests « devise » ; recette locale |
| Paiement | Au plus 5 commandes par compte et par 10 minutes | test « limite » |
| Paiement | Paiements faits avec une clé de test marqués « essai » ; reçu « PAIEMENT D'ESSAI — SANS VALEUR » | test « purge » |
| Vente | Formulaire unique : formule, pays, acceptation obligatoire des CGV (contrôlée aussi côté serveur) | recette locale |
| Vente | `TARIF_ESSAI` : remplace tous les prix et l'annonce sur la fiche et dans l'administration | test « tarif d'essai » |
| CGV | Article 5 « Absence de remboursement » ; moyens de paiement réels par pays ; démonstration avant achat | relecture |
| Admin | `/admin` (adresses de `ADMIN_EMAILS`) : totaux du mois par devise, paiements, revérification d'un paiement en attente, export comptable CSV (Excel), activation manuelle avec reçu et e-mail, purge des essais avec confirmation « PURGER » | tests ; recette locale (37/37) |
| Sécurité | Routes d'administration : session administrateur + contrôle d'origine ; export CSV protégé contre l'injection de formules ; `/admin` exclu des moteurs | recette locale |

Recette locale de bout en bout : 37 contrôles sur 37 (démonstration bridée, accès protégé, CGV obligatoires,
paiement, notification falsifiée refusée, notification répétée sans double prolongation, reçu, édition complète,
administration, export, activation manuelle, purge protégée, déconnexion). Tests automatiques : 38 sur 38 (dont la route de notification Notch Pay : signature absente, fausse, valide).

## Reste à faire

| Action | Qui |
|---|---|
| `CRON_SECRET` (valeur aléatoire) en Production et Preview | ✅ |
| Neon : activer la création d'une branche de base par déploiement de prévisualisation (P4) | 🔑 |
| Webhook Notch Pay (test puis réel) et `NOTCHPAY_HASH` | 🔑 |
| Connexion Google (facultative) | 🔑 |
| Compte Notch Pay validé : clé réelle `NOTCHPAY_PUBLIC_KEY` en Production | 🔑 |
| Fusion sur `main` (accord), purge des essais depuis `/admin`, paiement réel de 100 F CFA, puis suppression de `TARIF_ESSAI` et redéploiement | ⏳ |
| Mentions légales : RCCM, NIU, siège, directeur de la publication | 🔑 |
