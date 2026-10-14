# Audit du passage au domaine sel-apps.com — 14/10/2026

Décisions : adresse principale `sel-apps.com` (D1) ; bascule immédiate de l'ancienne adresse (D2) ; messagerie Zoho Mail
(D3) ; `contact@` public et `no-reply@` pour les envois automatiques (D4) ; identité de l'éditeur à compléter (D5) ;
adresse de recette `preview.sel-apps.com` (D6).

Statut : ✅ fait et vérifié · ⏳ fait, à vérifier après la fusion sur `main` · 🔑 action du titulaire des comptes.

## Lot 1 — Domaine dans Vercel

| Point | Statut | Constat |
|---|---|---|
| `sel-apps.com` relié au projet (production) | ✅ | Le site répond sur `https://sel-apps.com` (certificat émis) |
| `www.sel-apps.com` → `sel-apps.com` (308) | ✅ | Réglage du domaine dans Vercel |
| `preview.sel-apps.com` → branche `reservoirs-v1` | ✅ | Protégé par la connexion Vercel (non indexé) |
| `sel-apps-six.vercel.app` → `sel-apps.com` (308, page par page, paramètres conservés) | ⏳ | `next.config.js` ; vérifié en local ; actif à la fusion |
| Renouvellement automatique du domaine | ✅ | Échéance 14/10/2027 |

## Lot 2 — Code

| Point | Statut |
|---|---|
| Adresse de référence `https://sel-apps.com` (plan du site, robots.txt, adresses canoniques, image de partage, liens des e-mails) | ✅ |
| `contact@sel-apps.com` partout (en-tête, pied de page, contact, reçu, mentions, confidentialité) | ✅ |
| Pied de page des PDF générés | ✅ |
| E-mails automatiques : réponse vers `contact@sel-apps.com` (`reply_to`) | ✅ |
| Notification CinetPay sur `preview.sel-apps.com` malgré la protection Vercel (secret de contournement) | ✅ (🔑 activer le secret) |
| En-tête HSTS explicite | ✅ |
| Test de non-régression : aucune ancienne adresse dans le code (`tests/domaine.test.ts`) | ✅ |

## Lot 3 — Messagerie (DNS Vercel)

| Enregistrement | Statut |
|---|---|
| `_dmarc` en observation (`p=none`, rapports vers `contact@`) | ✅ créé |
| Vérification Zoho (TXT), MX Zoho, SPF, DKIM Zoho | 🔑 valeurs à fournir par Zoho (centre de données .com ou .eu) |
| Domaine d'envoi Resend (`send`, `resend._domainkey`) | 🔑 valeurs à fournir par Resend |
| Test de délivrabilité (mail-tester ≥ 9/10, SPF/DKIM/DMARC « pass » chez Gmail) | 🔑 après les deux lignes précédentes |

## Lot 4 — Connexion et paiement

| Point | Statut |
|---|---|
| Google : domaine autorisé, URI de retour `sel-apps.com` et `preview.sel-apps.com`, liens accueil/confidentialité/CGV | 🔑 |
| CinetPay : site `https://sel-apps.com`, notification et retour | 🔑 |
| Cookie de session limité à l'hôte, contrôle d'origine et redirections relatives au domaine courant | ✅ (aucun nom de domaine écrit en dur) |

## Lot 5 — Projets des utilisateurs

Bascule immédiate : les projets enregistrés dans le navigateur sur l'ancienne adresse ne sont plus visibles sur
`sel-apps.com` (stockage par adresse de site) ; seuls les fichiers `.json` déjà exportés se rouvrent. Choix assumé (D2),
consigné dans `DEPLOIEMENT.md`.

## Lot 6 — Référencement

| Point | Statut |
|---|---|
| Plan du site : 39 adresses, toutes en `https://sel-apps.com`, toutes en 200 | ✅ |
| robots.txt : `/api/`, `/compte`, `/connexion`, `/outils/` exclus ; plan du site déclaré | ✅ |
| Redirection 308 de l'ancienne adresse (transmet le référencement) | ⏳ |
| Google Search Console (propriété « domaine », vérification TXT) et envoi du plan du site ; Bing Webmaster Tools | 🔑 |

## Lot 7 — Audit général (site local, branche `reservoirs-v1`)

**Exploration complète** : 36 pages et 4 guides PDF atteints depuis l'accueil, tous en 200 ; aucune erreur JavaScript ;
aucun débordement horizontal à 375 px ; un seul titre `h1` par page ; aucune image sans texte alternatif ; aucun lien ou
bouton sans nom. Seule erreur : les polices Google de l'application Escaliers, bloquées par le réseau local (chargées
normalement en ligne).

**Lighthouse** (accessibilité, bonnes pratiques, référencement) sur 8 pages : 100 / 100 / 100, sauf :

| Page | Constat | Suite |
|---|---|---|
| `/connexion` | Contraste insuffisant du séparateur « ou » (2,6:1) | ✅ corrigé (4,5:1 au moins) |
| `/confidentialite` | Liens dans le texte distingués par la seule couleur | ✅ soulignés |
| `/connexion` | « Non indexable » | Voulu (page privée) |

**Sécurité** : `frame-ancestors 'self'`, `nosniff`, `Referrer-Policy`, `Permissions-Policy`, HSTS ; édition complète
de Réservoirs refusée sans abonnement (302 vers la démonstration) ; aucun secret dans le dépôt.

**Contenus juridiques** : mentions légales complétées (champs RCCM, NIU, siège, directeur de la publication marqués
« à compléter », D5) ; politique de confidentialité réécrite (données réellement traitées, prestataires, durées,
cookies strictement nécessaires : pas de bandeau de consentement requis).

**Observations sans correction** :
- 9 fiches du catalogue (applications gratuites) ne sont liées que par le plan du site : les cartes ouvrent directement
  l'application. Choix d'ergonomie à conserver ; leur référencement repose sur le plan du site.
- L'application Escaliers charge ses polices chez Google (adresse IP transmise à Google) : à intégrer au paquet lors de
  sa prochaine version.
- Performance (Core Web Vitals) : à mesurer sur `https://sel-apps.com` avec PageSpeed Insights après la fusion,
  l'environnement d'audit ne pouvant joindre le site public.

## Lot 8 — Ordre de mise en service

1. 🔑 Zoho, Resend, Google, Neon, CinetPay (valeurs DNS et clés).
2. Recette complète sur `preview.sel-apps.com`, dont un paiement réel de 100 XAF.
3. Fusion de `reservoirs-v1` sur `main` (accord du titulaire), qui active la redirection de l'ancienne adresse.
4. Contrôles ⏳ ci-dessus en production, Search Console, PageSpeed ; DMARC en `p=quarantine` après un mois sans rejet.
