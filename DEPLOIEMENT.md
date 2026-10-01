# Déploiement de l'application Escaliers (v0.7.1) et de son guide sur sel-apps

Ces fichiers s'ajoutent au dépôt GitHub `structuralengineeringlabs-star/sel-apps`
(projet Vercel `sel-apps`, déployé automatiquement à chaque push sur `main`).

## Contenu

| Chemin | Rôle |
|---|---|
| `public/tools/escaliers/` | Application compilée (Vite, base `/tools/escaliers/`) : aide intégrée, schémas, captures, polices PDF |
| `app/apps/escaliers/page.tsx` | Page `/apps/escaliers` (iframe, même modèle que GranuLab Pro) + lien vers le guide |
| `data/applications.ts` | Fiche « Dimensionnement des escaliers » : `appUrl`, description EC2/EC3/EC5, badge Nouveau |
| `data/guides.ts` | Liste des guides d'utilisation (extensible aux autres applications) |
| `app/documentation/page.tsx` | Section « Guides d'utilisation » (`/documentation#guides`) : télécharger, consulter, ouvrir l'application |
| `public/docs/guides/Guide_utilisateur_Escaliers_Eurocodes.pdf` | Guide PDF (20 pages) |

## Option 1 : appliquer le patch (recommandé)

```bash
cd sel-apps
git checkout main && git pull
git am --3way 0001-feat-application-Escaliers-Eurocodes-EC2-EC3-EC5-et-.patch
git push origin main        # Vercel déploie automatiquement
```

## Option 2 : copier les fichiers

Copier le contenu de ce dossier à la racine du dépôt (en écrasant `data/applications.ts`
et `app/documentation/page.tsx`), puis `git add . && git commit -m "feat: escaliers + guide" && git push`.

## Vérifications après déploiement

- https://sel-apps-six.vercel.app/applications/escaliers : bouton « Ouvrir l'application » actif
- https://sel-apps-six.vercel.app/apps/escaliers : application, bouton « Aide », note PDF, DXF
- https://sel-apps-six.vercel.app/documentation#guides : guide téléchargeable
- https://sel-apps-six.vercel.app/docs/guides/Guide_utilisateur_Escaliers_Eurocodes.pdf

## Mise à jour ultérieure de l'application

Dans le projet escalier : `npx vite build --base /tools/escaliers/ --outDir dist-sel`,
puis remplacer `public/tools/escaliers/` par le contenu de `dist-sel/`.
