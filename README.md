# sel-apps — Structural & Engineering Labs

Site des applications de calcul de Structural & Engineering Labs (Next.js, déployé sur Vercel : projet `sel-apps`,
déploiement automatique à chaque push sur `main`).

## Structure

| Dossier | Contenu |
|---|---|
| `app/` | Pages du site (App Router) : accueil, catalogue `/applications` (avec recherche `?q=`), pages des applications `/apps/…`, documentation, tarifs, contact, pages légales, `sitemap.ts`, `robots.ts` |
| `components/` | Composants du site et applications intégrées en React (`components/apps/…`) |
| `data/` | Catalogue des applications (`applications.ts`) et guides d'utilisation (`guides.ts`) |
| `lib/` | Utilitaires partagés |
| `public/tools/` | Applications compilées hébergées telles quelles et affichées en iframe |
| `public/docs/guides/` | Guides d'utilisation en PDF |

## Applications en ligne

| Page | Mise en œuvre |
|---|---|
| `/apps/calculette-aciers` | Composant React (`components/apps/CalculetteAciers.tsx`) |
| `/apps/plancher-corps-creux` | Application compilée `public/tools/plancher-corps-creux/` (poutrelle de plancher à corps creux, béton armé) |
| `/apps/dalle-pleine` | Application compilée (`public/tools/dalle-pleine/`), affichée en iframe |
| `/apps/calcul-poteaux` | Application compilée `public/tools/poteaux/` (béton armé, acier, bois) |
| `/apps/calcul-poutres` | Application compilée `public/tools/poutres/` (béton armé, acier, bois) |
| `/apps/escaliers` | Application compilée `public/tools/escaliers/` (béton armé, acier, bois) |
| `/apps/corbeaux` | Application compilée `public/tools/corbeaux/` (béton armé, annexe J.3) |
| `/apps/chateau-eau` | Application compilée `public/tools/chateau-eau/` (château d'eau : cuve béton armé, acier ou PEHD) |
| `/apps/courbe-granulometrique` | Page autonome `public/tools/courbe-granulometrique.html` |
| `/apps/reservoirs` | Payante : démonstration `public/tools/reservoirs/`, édition complète `prive/outils/reservoirs/` servie par `/outils/reservoirs/` aux abonnés |
| `/apps/buses` | Payante : démonstration `public/tools/buses/`, édition complète `prive/outils/buses/` servie par `/outils/buses/` aux abonnés (fascicule 70, EC2, EC7, hydraulique) |

Les autres fiches du catalogue (`data/applications.ts`) sans `appUrl` sont annoncées sans application en ligne.

## Développement

```bash
npm ci
npm run dev      # http://localhost:3000
npm run lint     # ESLint
npm run build    # vérification avant push
```

Chaque push sur `main` est aussi vérifié par GitHub Actions (`.github/workflows/ci.yml` : lint, types, construction).

Coordonnées affichées (téléphone, WhatsApp, e-mail) : `lib/contact.ts`. Adresse publique du site (plan du site,
image de partage) : `lib/site.ts`, ou la variable `NEXT_PUBLIC_SITE_URL` sur Vercel.

Procédure de mise à jour des applications compilées : voir `DEPLOIEMENT.md`.
