# Déploiement

Le projet Vercel `sel-apps` est relié à ce dépôt : chaque push sur `main` déclenche un déploiement de production ;
une autre branche produit un déploiement de prévisualisation (URL propre, production inchangée).

## Domaine

| Adresse | Rôle |
|---|---|
| `https://sel-apps.com` | production (branche `main`) — adresse de référence (`lib/site.ts`) |
| `www.sel-apps.com` | redirection permanente (308) vers `sel-apps.com` (réglage du domaine dans Vercel) |
| `preview.sel-apps.com` | recette stable de la branche `reservoirs-v1` (protégée par la connexion Vercel) |
| `sel-apps-six.vercel.app` | ancienne adresse : redirection permanente page par page (`next.config.js`) |

Domaine acheté chez Vercel (renouvellement automatique, DNS Vercel). Enregistrements DNS à tenir à jour :

| Nom | Type | Valeur | Rôle |
|---|---|---|---|
| `@` | MX | `mx.zoho.com` (10), `mx2.zoho.com` (20), `mx3.zoho.com` (50) — `zoho.eu` si le compte Zoho est européen | réception `contact@` |
| `@` | TXT | `v=spf1 include:zoho.com ~all` | expéditeurs autorisés du domaine |
| `@` | TXT | code `zoho-verification=…` fourni par Zoho | propriété du domaine chez Zoho |
| `zmail._domainkey` | TXT | clé DKIM fournie par Zoho | signature des messages de `contact@` |
| `send`, `resend._domainkey` | MX / TXT | valeurs fournies par Resend (domaine `sel-apps.com`) | envoi des e-mails automatiques |
| `_dmarc` | TXT | `v=DMARC1; p=none; rua=mailto:contact@sel-apps.com; adkim=r; aspf=r` | politique d'authentification (passer à `p=quarantine` une fois Zoho et Resend vérifiés) |

## Mettre à jour une application compilée (`public/tools/…`)

Les applications Vite sont construites avec la base de leur dossier, puis copiées telles quelles :

| Application | Dans son projet | Dossier à remplacer ici |
|---|---|---|
| Poteaux (béton armé, acier, bois) | `npx vite build --base /tools/poteaux/ --outDir dist-sel` | `public/tools/poteaux/` |
| Poutres (béton armé, acier, bois) | `npx vite build --base /tools/poutres/ --outDir dist-sel` | `public/tools/poutres/` |
| Dalle pleine (béton armé) | `npx vite build --base /tools/dalle-pleine/ --outDir dist-sel` | `public/tools/dalle-pleine/` |
| Escaliers (béton armé, acier, bois) | `npx vite build --base /tools/escaliers/ --outDir dist-sel` | `public/tools/escaliers/` |
| Château d'eau (cuve BA, acier, PEHD) | `npx vite build --base /tools/chateau-eau/ --outDir dist-sel` | `public/tools/chateau-eau/` |
| Plancher à corps creux (béton armé) | `npx vite build --base /tools/plancher-corps-creux/ --outDir dist-sel` | `public/tools/plancher-corps-creux/` |
| Corbeaux (béton armé) | `npx vite build --base /tools/corbeaux/ --outDir dist-sel` | `public/tools/corbeaux/` |
| Réservoirs — démonstration (voir « Applications payantes ») | `npm run site:demo` → `dist-sel-demo/` | `public/tools/reservoirs/` |
| Réservoirs — édition complète (abonnés) | `npm run site:complet` → `dist-sel-complet/` | `prive/outils/reservoirs/` |
| Buses — démonstration | `npm run site:demo` (projet Calcul-Buses) → `dist-sel-demo/` | `public/tools/buses/` |
| Buses — édition complète (abonnés) | `npm run site:complet` → `dist-sel-complet/` | `prive/outils/buses/` |

Remplacer **tout** le dossier cible par le contenu de `dist-sel/` (supprimer d'abord l'ancien : les noms des fichiers
`assets/*` changent à chaque construction), mettre à jour si besoin la fiche dans `data/applications.ts`, puis :

```bash
npm run build          # contrôle local
git add -A && git commit -m "feat(<application>): vX.Y.Z" && git push origin main
```

Ne déposer aucun fichier de construction à la racine du dépôt : seul `public/` est servi tel quel.

## Vérifications après déploiement

- page de l'application (`/apps/…`) : chargement, numéro de version affiché, pas d'erreur dans la console ;
- fiche du catalogue (`/applications/…`) ;
- guides (`/documentation#guides`) le cas échéant.

Guide PDF des poutres : `npm run guide` dans le projet poutres, puis copier
`docs/manuel/Guide_utilisateur_Poutres_Eurocodes.pdf` dans `public/docs/guides/` et mettre à jour `data/guides.ts`
(version, taille, pages).

Guide PDF des buses : `npm run manuel && npm run guide` dans le projet Calcul-Buses, puis copier
`docs/manuel/Guide_utilisateur_Buses_Fascicule70.pdf` dans `public/docs/guides/` et mettre à jour `data/guides.ts`
(version, taille, pages).

Guide PDF des corbeaux : `npm run guide` dans le projet Calcul-Corbeaux, puis copier
`docs/manuel/Guide_utilisateur_Corbeaux_Eurocodes.pdf` dans `public/docs/guides/` et mettre à jour `data/guides.ts`
(version, taille, pages).

Guide PDF du plancher à corps creux : `npm run guide` dans le projet Plancher-corps-creux, puis copier
`docs/guide/Guide_utilisateur_Plancher_Corps_Creux_EC2.pdf` dans `public/docs/guides/` et mettre à jour `data/guides.ts`
(version, taille, pages).

Guide PDF des escaliers : `npm run guide` dans le projet escaliers, puis copier
`public/help/Guide_utilisateur_Escalier_Eurocodes.pdf` dans `public/docs/guides/` **en le renommant**
`Guide_utilisateur_Escaliers_Eurocodes.pdf` (pluriel, nom attendu par `data/guides.ts`) et mettre à jour
`data/guides.ts` (version, taille, pages).

En cas de problème : Vercel → projet `sel-apps` → Deployments → déploiement précédent → « Promote to Production ».

## Applications payantes (abonnement Notch Pay ou CinetPay)

Une application est vendue en ligne quand sa fiche de `data/applications.ts` porte `paiementEnLigne: true`, `isFree: false`
et ses prix TTC (`priceMonthly`, `priceAnnual`, en XAF, multiples de 5). Aujourd'hui : **Réservoirs** et **Buses**.

- `public/tools/<app>/` reçoit l'édition de **démonstration** (publique) ;
- `prive/outils/<app>/` reçoit l'édition **complète** ; elle n'est servie que par `/outils/<app>/…` après contrôle de
  la session et de l'abonnement (jamais depuis `public/`) ;
- `/apps/<app>` affiche l'une ou l'autre selon l'abonnement ; l'abonnement dure 30 ou 365 jours, sans reconduction.

### Variables d'environnement (Vercel → Settings → Environment Variables)

| Variable | Rôle |
|---|---|
| `DATABASE_URL` (ou `POSTGRES_URL`) | base Postgres (intégration Neon de Vercel) |
| `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` | connexion Google ; URI de redirection autorisées : `https://sel-apps.com/api/auth/google/rappel` et `https://preview.sel-apps.com/api/auth/google/rappel` |
| `RESEND_API_KEY`, `EMAIL_EXPEDITEUR` | liens de connexion, confirmations et rappels ; expéditeur `S.E.L. Applications <no-reply@sel-apps.com>`, réponses vers `contact@sel-apps.com` |
| `NOTCHPAY_PUBLIC_KEY` | paiement Notch Pay (Business suite → Settings → API Keys : clé publique `pk_test_…` en Preview, clé réelle en Production) ; sa présence fait de Notch Pay le prestataire actif |
| `NOTCHPAY_HASH` | clé « Hash » du point de notification Notch Pay (signature `x-notch-signature`) |
| `PAIEMENT_PRESTATAIRE` (facultatif) | `notchpay` ou `cinetpay` pour forcer le choix |
| `ADMIN_EMAILS` | adresses autorisées sur `/admin`, séparées par des virgules |
| `TARIF_ESSAI` (temporaire) | prix unique en F CFA pour un test réel ; à supprimer ensuite |
| `CINETPAY_API_KEY`, `CINETPAY_SITE_ID`, `CINETPAY_SECRET_KEY` | paiement CinetPay (tableau de bord CinetPay → Intégrations), si utilisé |
| `CRON_SECRET` | protège `/api/cron/rappels` (rappels J-7 et J-1, tous les jours à 7 h UTC, `vercel.json`) |
| `CINETPAY_URL_BASE`, `NOTCHPAY_URL_BASE` (facultatifs) | autre adresse d'API, pour les essais |
| `NEXT_PUBLIC_SITE_URL` (facultatif) | remplace l'adresse de référence `https://sel-apps.com` |
| `VERCEL_AUTOMATION_BYPASS_SECRET` (créée par Vercel) | Settings → Deployment Protection → *Protection Bypass for Automation* : laisse passer la notification CinetPay sur `preview.sel-apps.com` |

Aucune clé ne doit figurer dans le dépôt.

### Mise en service

1. Base Neon reliée au projet (intégration Vercel, mêmes variables en production et en prévisualisation) ; le schéma
   (`db/schema.sql`, idempotent) est appliqué automatiquement avant chaque construction (`vercel-build`).
2. Dans Notch Pay (Settings → Webhooks), adresse de notification `https://sel-apps.com/api/paiement/notchpay`
   (prévisualisation : `https://preview.sel-apps.com/api/paiement/notchpay?x-vercel-protection-bypass=<secret de
   Deployment Protection>`), événements `payment.*` ; sans notification, le paiement est tout de même confirmé au retour
   du client (lecture de la transaction par l'API).
   Dans CinetPay, le cas échéant : site `https://sel-apps.com`, URL de notification : `https://sel-apps.com/api/paiement/notification`
   (elle est aussi transmise à chaque paiement) ; URL de retour : `https://sel-apps.com/api/paiement/retour`.
3. Faire un paiement réel de faible montant sur `preview.sel-apps.com`, vérifier le reçu (`/compte`),
   l'accès à l'édition complète et la ligne de la table `paiements`.

Exploitation courante : `docs/EXPLOITATION.md`. Audit de lancement : `docs/AUDIT_LANCEMENT.md`.

Contrôles locaux : `npm test` (paiement, signatures, sessions, accès aux fichiers protégés, sur PGlite).

## Données des utilisateurs

Les applications enregistrent les projets dans le navigateur, par adresse de site : depuis le passage à
`sel-apps.com` (bascule immédiate), les projets créés sur `sel-apps-six.vercel.app` ne sont plus visibles. Comme
l'ancienne adresse est redirigée, ils ne sont plus récupérables par l'interface ; d'où l'importance d'« Enregistrer »
(fichier `.json`) les projets importants, puis de les rouvrir par « Ouvrir… » sur `sel-apps.com`.

## Sources

| Application | Dépôt des sources |
|---|---|
| Poteaux | `structuralengineeringlabs-star/Calcul-Poteaux` |
| Poutres | `structuralengineeringlabs-star/Calculs-Poutres` (privé) |
| Château d'eau | `structuralengineeringlabs-star/Chateau-Eau` (privé) |
| Plancher à corps creux | `structuralengineeringlabs-star/Plancher-corps-creux` (privé) |
| Corbeaux | `structuralengineeringlabs-star/Calcul-Corbeaux` (privé) |
| Réservoirs | `structuralengineeringlabs-star/Reservoirs` |
