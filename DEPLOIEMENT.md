# Déploiement

Le projet Vercel `sel-apps` est relié à ce dépôt : chaque push sur `main` déclenche un déploiement de production ;
une autre branche produit un déploiement de prévisualisation (URL propre, production inchangée).

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

## Applications payantes (abonnement CinetPay)

Une application est vendue en ligne quand sa fiche de `data/applications.ts` porte `paiementEnLigne: true`, `isFree: false`
et ses prix TTC (`priceMonthly`, `priceAnnual`, en XAF, multiples de 5). Aujourd'hui : **Réservoirs** seulement.

- `public/tools/<app>/` reçoit l'édition de **démonstration** (publique) ;
- `prive/outils/<app>/` reçoit l'édition **complète** ; elle n'est servie que par `/outils/<app>/…` après contrôle de
  la session et de l'abonnement (jamais depuis `public/`) ;
- `/apps/<app>` affiche l'une ou l'autre selon l'abonnement ; l'abonnement dure 30 ou 365 jours, sans reconduction.

### Variables d'environnement (Vercel → Settings → Environment Variables)

| Variable | Rôle |
|---|---|
| `DATABASE_URL` (ou `POSTGRES_URL`) | base Postgres (intégration Neon de Vercel) |
| `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` | connexion Google ; URI de redirection autorisée : `https://<domaine>/api/auth/google/rappel` |
| `RESEND_API_KEY`, `EMAIL_EXPEDITEUR` | liens de connexion, confirmations et rappels (domaine expéditeur vérifié chez Resend) |
| `CINETPAY_API_KEY`, `CINETPAY_SITE_ID`, `CINETPAY_SECRET_KEY` | paiement (tableau de bord CinetPay → Intégrations) |
| `CRON_SECRET` | protège `/api/cron/rappels` (rappels J-7 et J-1, tous les jours à 7 h UTC, `vercel.json`) |
| `CINETPAY_URL_BASE` (facultatif) | autre adresse de l'API, pour les essais |

Aucune clé ne doit figurer dans le dépôt.

### Mise en service

1. Créer la base, puis `DATABASE_URL=… npm run db:migrer` (script idempotent, `db/schema.sql`).
2. Dans CinetPay, URL de notification : `https://<domaine>/api/paiement/notification` (elle est aussi transmise à
   chaque paiement) ; URL de retour : `https://<domaine>/api/paiement/retour`.
3. Faire un paiement réel de faible montant sur un déploiement de prévisualisation, vérifier le reçu (`/compte`),
   l'accès à l'édition complète et la ligne de la table `paiements`.

Contrôles locaux : `npm test` (paiement, signatures, sessions, accès aux fichiers protégés, sur PGlite).

## Données des utilisateurs

Les applications enregistrent les projets dans le navigateur, par adresse de site : un changement de domaine les
rend invisibles. Pour les transférer, « Enregistrer » (fichier `.json`) sur l'ancienne adresse puis « Ouvrir… » sur
la nouvelle.

## Sources

| Application | Dépôt des sources |
|---|---|
| Poteaux | `structuralengineeringlabs-star/Calcul-Poteaux` |
| Poutres | `structuralengineeringlabs-star/Calculs-Poutres` (privé) |
| Château d'eau | `structuralengineeringlabs-star/Chateau-Eau` (privé) |
| Plancher à corps creux | `structuralengineeringlabs-star/Plancher-corps-creux` (privé) |
| Corbeaux | `structuralengineeringlabs-star/Calcul-Corbeaux` (privé) |
| Réservoirs | `structuralengineeringlabs-star/Reservoirs` |
