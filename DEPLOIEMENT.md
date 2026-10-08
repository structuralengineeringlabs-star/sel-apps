# Déploiement

Le projet Vercel `sel-apps` est relié à ce dépôt : chaque push sur `main` déclenche un déploiement de production ;
une autre branche produit un déploiement de prévisualisation (URL propre, production inchangée).

## Mettre à jour une application compilée (`public/tools/…`)

Les applications Vite sont construites avec la base de leur dossier, puis copiées telles quelles :

| Application | Dans son projet | Dossier à remplacer ici |
|---|---|---|
| Poteaux (béton armé, acier, bois) | `npx vite build --base /tools/poteaux/ --outDir dist-sel` | `public/tools/poteaux/` |
| Poutres (béton armé, acier, bois) | `npx vite build --base /tools/poutres/ --outDir dist-sel` | `public/tools/poutres/` |
| Escaliers (béton armé, acier, bois) | `npx vite build --base /tools/escaliers/ --outDir dist-sel` | `public/tools/escaliers/` |

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

Guide PDF des escaliers : `npm run guide` dans le projet escaliers, puis copier
`public/help/Guide_utilisateur_Escalier_Eurocodes.pdf` dans `public/docs/guides/` **en le renommant**
`Guide_utilisateur_Escaliers_Eurocodes.pdf` (pluriel, nom attendu par `data/guides.ts`) et mettre à jour
`data/guides.ts` (version, taille, pages).

En cas de problème : Vercel → projet `sel-apps` → Deployments → déploiement précédent → « Promote to Production ».

## Données des utilisateurs

Les applications enregistrent les projets dans le navigateur, par adresse de site. Les projets créés avec l'ancienne
application poteaux (`poteaux-app.vercel.app`) se récupèrent par « Enregistrer » (fichier `.json`) dans l'ancienne
application puis « Ouvrir… » dans la nouvelle.
