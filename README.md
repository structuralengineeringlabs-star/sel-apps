# sel-apps — Structural & Engineering Labs

Site des applications de calcul de Structural & Engineering Labs (Next.js, déployé sur Vercel : projet `sel-apps`,
déploiement automatique à chaque push sur `main`).

## Structure

| Dossier | Contenu |
|---|---|
| `app/` | Pages du site (App Router) : accueil, catalogue `/applications`, pages des applications `/apps/…`, documentation, tarifs, contact, pages légales ; `app/api/contact` |
| `components/` | Composants du site et applications intégrées en React (`components/apps/…`) |
| `data/` | Catalogue des applications (`applications.ts`) et guides d'utilisation (`guides.ts`) |
| `lib/` | Utilitaires partagés |
| `public/tools/` | Applications compilées hébergées telles quelles et affichées en iframe |
| `public/docs/guides/` | Guides d'utilisation en PDF |

## Applications en ligne

| Page | Mise en œuvre |
|---|---|
| `/apps/calculette-aciers` | Composant React (`components/apps/CalculetteAciers.tsx`) |
| `/apps/plancher-corps-creux` | Composant React (`components/apps/plancher-corps-creux/`) |
| `/apps/dalle-pleine` | Composant React (`components/apps/dalle-pleine/`) |
| `/apps/calcul-poteaux` | Application compilée `public/tools/poteaux/` (béton armé, acier, bois) |
| `/apps/calcul-poutres` | Application compilée `public/tools/poutres/` (béton armé, acier, bois) |
| `/apps/escaliers` | Application compilée `public/tools/escaliers/` |
| `/apps/courbe-granulometrique` | Page autonome `public/tools/courbe-granulometrique.html` |

Les autres fiches du catalogue (`data/applications.ts`) sans `appUrl` sont annoncées sans application en ligne.

## Développement

```bash
npm ci
npm run dev      # http://localhost:3000
npm run build    # vérification avant push
```

Procédure de mise à jour des applications compilées : voir `DEPLOIEMENT.md`.
