export type Application = {
  id: number;
  slug: string;
  name: string;
  shortDescription: string;
  longDescription: string;
  categorySlug: string;
  priceMonthly?: number;
  priceAnnual?: number;
  isFree: boolean;
  isNew?: boolean;
  isPopular?: boolean;
  isExpertise?: boolean;
  appUrl?: string;
  icon: string;
  tags: string[];
};

export const applications: Application[] = [
  // === BÂTIMENTS ===
  {
    id: 1,
    slug: "calculette-aciers",
    name: "Calculette des aciers",
    shortDescription: "Calcule la section d'acier (As), le diamètre et l'espacement des barres, ainsi que le poids des armatures.",
    longDescription: "Calcule la section d'acier théorique (As), le diamètre et l'espacement des barres, ainsi que le poids linéaire et total des armatures (kg) pour tout élément en béton armé. Génère une fiche de synthèse imprimable des résultats (As, Ø, espacement, poids).",
    categorySlug: "batiments",
    isFree: true,
    isPopular: true,
    appUrl: "/apps/calculette-aciers",
    icon: "Calculator",
    tags: ["Béton armé", "Ferraillage", "As", "Eurocode 2"],
  },
  {
    id: 2,
    slug: "plancher-corps-creux",
    name: "Dimensionnement Plancher à Corps Creux",
    shortDescription: "Dimensionne les planchers à corps creux (poutrelles + entrevous) en béton armé selon l'Eurocode 2.",
    longDescription: "Dimensionne les planchers à corps creux (poutrelles + entrevous) en béton armé selon l'Eurocode 2 (EN 1992-1-1) : détermination des charges (qk), calcul des poutrelles en flexion, vérification à l'ELS/ELU, ferraillage de la dalle de compression et des poutrelles, calcul de la flèche, vérifications d'usage (As,max, espacement étriers, ancrage) et note de calcul complète.",
    categorySlug: "batiments",
    isFree: true,
    isPopular: true,
    appUrl: "/apps/plancher-corps-creux",
    icon: "LayoutGrid",
    tags: ["Plancher", "Corps creux", "Poutrelles", "ELS", "ELU"],
  },
  {
    id: 3,
    slug: "dalle-pleine",
    name: "Dimensionnement Dalle Pleine",
    shortDescription: "Dimensionne les dalles pleines en béton armé selon l'Eurocode 2 (EN 1992).",
    longDescription: "Dimensionne les dalles pleines en béton armé selon l'Eurocode 2 (EN 1992) : modélisation de la portée (L) et des charges (qk), calcul du moment fléchissant et de l'effort tranchant, vérification des sections (fck, fyk, yc, ys), calcul du ferraillage (h, b, d_eff = h - c) et des flèches. Supporte les dalles sur 2 ou 4 côtés, la continuité des appuis, la vérification au poinçonnement, le ferraillage complet et l'export PDF.",
    categorySlug: "batiments",
    isFree: true,
    isPopular: true,
    appUrl: "/apps/dalle-pleine",
    icon: "Square",
    tags: ["Dalle", "Eurocode 2", "Ferraillage", "Flèches"],
  },
  {
    id: 4,
    slug: "calcul-poteaux",
    name: "Calcul des Poteaux",
    shortDescription: "Calcule les poteaux en béton armé (EC2), en acier (EC3) et en bois (EC5) : flambement, flexion composée, feu.",
    longDescription: "Calcule les poteaux isolés aux Eurocodes. Béton armé (EN 1992-1-1) : effort normal, élancement, flambement, diagramme d'interaction N-M, résistance, stabilité et durabilité. Acier (EN 1993-1-1) : profilés IPE, HEA, HEB, HEM, IPN, tubes CHS, SHS, RHS et PRS, classification, flambement par flexion et par torsion, flexion composée (annexe B), déversement, température critique. Bois (EN 1995-1-1) : classes C et GL, flambement, flexion composée, feu par section réduite. Éditeur de section interactif (mm), projet multi-poteaux, note de calcul structurée, plans A3 SVG et DXF, manuel d'utilisation intégré.",
    categorySlug: "batiments",
    isFree: true,
    isPopular: true,
    appUrl: "/apps/calcul-poteaux",
    icon: "Columns",
    tags: ["Poteaux", "Flambement", "EC2", "EC3", "EC5"],
  },
  {
    id: 5,
    slug: "calcul-poutres",
    name: "Calcul des Poutres",
    shortDescription: "Calcule les poutres continues en béton armé (EC2), en acier (EC3) et en bois (EC5).",
    longDescription: "Dimensionne et vérifie les poutres continues de 1 à 5 travées aux Eurocodes. Béton armé (EN 1992-1-1) : sections rectangulaires, en T, en L et en I, consoles, charges réparties, partielles et ponctuelles, flexion, effort tranchant, torsion, liaisons âme-table, fissuration, flèche par intégration des courbures, dispositions constructives et feu. Acier (EN 1993-1-1) : profilés IPE, HEA, HEB, HEM, IPN, tubes CHS, SHS, RHS et PRS, classification, résistances, voilement, déversement, âme sous réactions, flèches, température critique. Bois (EN 1995-1-1) : classes C et GL, flexion, déversement, cisaillement, appuis, flèches avec fluage, feu. Éditeur de section interactif, note de calcul structurée, plans A3 SVG et DXF, nomenclature des armatures et métrés.",
    categorySlug: "batiments",
    isFree: true,
    isNew: true,
    appUrl: "/apps/calcul-poutres",
    icon: "Minus",
    tags: ["Poutres", "Poutres continues", "EC2", "EC3", "EC5", "DXF"],
  },
  {
    id: 6,
    slug: "escaliers",
    name: "Dimensionnement des escaliers",
    shortDescription: "Dimensionne les escaliers en béton armé (EC2), à limons acier (EC3) ou bois (EC5) : volées droites et quart tournant.",
    longDescription: "Dimensionne les escaliers aux Eurocodes. Béton armé (EN 1992-1-1) : paillasse et paliers par bande de 1 m, volées droites avec ou sans paliers et escaliers à quart tournant (report de la volée 2 sur le palier de repos), flexion, effort tranchant, flèche (L/d), enrobage, longueurs d'ancrage et croisement des aciers anti-poussée au vide à l'angle rentrant. Acier (EN 1993-1-1) : limons UPN, IPE, HEA, tubes RHS ou plats, flexion, cisaillement, déversement et flèche. Bois (EN 1995-1-1) : limons et marches en bois massif (C, D) ou lamellé-collé (GL), flexion, cisaillement, flèches avec fluage. Vérification de la marche sous charge ponctuelle et règle de Blondel, optimiseur de ferraillage, de profilé ou de section, note de calcul PDF, plans d'exécution DXF (coupe longitudinale et coupe A-A), nomenclature des armatures avec ratio acier/béton, métrés, gestion des projets, aide intégrée et guide d'utilisation PDF.",
    categorySlug: "batiments",
    isFree: true,
    isNew: true,
    appUrl: "/apps/escaliers",
    icon: "TrendingUp",
    tags: ["Escalier", "Quart tournant", "EC2", "EC3", "EC5", "DXF"],
  },
  {
    id: 7,
    slug: "corbeaux",
    name: "Calcul des corbeaux",
    shortDescription: "Calcule les corbeaux (consoles courtes) en béton armé selon l'EC2.",
    longDescription: "Calcule les corbeaux (consoles courtes) dans les bâtiments et ouvrages d'art en béton armé selon l'Eurocode 2 (EN 1992-1-1) : modèle bielles-tirants, répartition des contraintes de compression (σc) et de traction dans les aciers (σs), calcul de la charge appliquée (P) et de la réaction (R), dimensionnement du ferraillage en fonction de la géométrie (a, h) et de l'effort tranchant (VEd).",
    categorySlug: "batiments",
    isFree: true,
    icon: "CornerDownRight",
    tags: ["Corbeau", "Console", "Bielles-tirants", "EC2"],
  },

  // === PONTS, DALOTS & RÉSERVOIRS ===
  {
    id: 8,
    slug: "reservoirs",
    name: "Calcul des Réservoirs",
    shortDescription: "Calcule les réservoirs enterrés ou surélevés (châteaux d'eau) en béton armé.",
    longDescription: "Calcule les réservoirs enterrés ou surélevés (châteaux d'eau) en béton armé selon l'Eurocode 2 (EN 1992-1-1) : détermination de la pression hydrostatique sur les parois (qk, H), vérification de la résistance, de l'étanchéité, de la durabilité et de la sécurité, ferraillage des voiles.",
    categorySlug: "ponts-dalots-reservoirs",
    priceMonthly: 25000,
    priceAnnual: 200000,
    isFree: false,
    isPopular: true,
    icon: "Droplet",
    tags: ["Réservoir", "Château d'eau", "Étanchéité", "EC2"],
  },
  {
    id: 9,
    slug: "buses",
    name: "Dimensionnement des Buses",
    shortDescription: "Calcule et dimensionne les buses hydrauliques métalliques et en béton armé.",
    longDescription: "Calcule et dimensionne les buses hydrauliques métalliques et en béton armé : analyse structurelle (charges, remblai, interaction sol-structure), analyse hydraulique du débit (formule de Manning-Strickler Q = 1/n · A · R^(2/3) · S^(1/2)), vérification de la capacité d'écoulement et conformité aux normes.",
    categorySlug: "ponts-dalots-reservoirs",
    priceMonthly: 10000,
    priceAnnual: 100000,
    isFree: false,
    icon: "Cylinder",
    tags: ["Buse", "Manning-Strickler", "Hydraulique", "Débit"],
  },
  {
    id: 10,
    slug: "dalots-cadres",
    name: "Dimensionnement des dalots cadres",
    shortDescription: "Dimensionne les dalots cadres simples, doubles et triples (1, 2 ou 3 cellules) en béton armé.",
    longDescription: "Dimensionne les dalots cadres en béton armé selon les Eurocodes, pour 1, 2 ou 3 cellules : conception structurelle (portée B, hauteur H), analyse des charges (surcharges roulantes), analyse hydraulique de la capacité d'écoulement, ferraillage détaillé des parois, radier et dalle supérieure, vérification de la sécurité et de la conformité réglementaire.",
    categorySlug: "ponts-dalots-reservoirs",
    priceMonthly: 50000,
    priceAnnual: 500000,
    isFree: false,
    isPopular: true,
    isExpertise: true,
    icon: "Boxes",
    tags: ["Dalot simple", "Dalot double", "Dalot triple"],
  },
  {
    id: 11,
    slug: "ponts",
    name: "Dimensionnement des Ponts",
    shortDescription: "Calcule les ponts en béton armé, mixtes acier-béton et ponts dalles selon les Eurocodes.",
    longDescription: "Calcule et dimensionne les ponts selon les Eurocodes : ponts en béton armé avec poutres sous chaussée, ponts mixtes acier/béton et ponts dalles. Modélisation du tablier, des appuis, culées, piles et semelles, analyse des charges et actions (qk), analyse structurelle (efforts, déformées), application des combinaisons de charges réglementaires (ELU : 1,35G+1,5Q ; ELS : 1,0G+1,0Q ; accidentel et fatigue), vérification de la connexion acier-béton, ferraillage et génération de rapports.",
    categorySlug: "ponts-dalots-reservoirs",
    priceMonthly: 150000,
    priceAnnual: 1250000,
    isFree: false,
    isPopular: true,
    isExpertise: true,
    icon: "Bridge",
    tags: [
      "Pont en Béton Armé avec poutres sous chaussée",
      "Pont mixte acier/béton",
      "Pont dalle",
    ],
  },

  // === ROUTES & INFRASTRUCTURES ===
  {
    id: 12,
    slug: "road-asset-management",
    name: "Road Asset Management Tools",
    shortDescription: "Outil d'aide à la décision pour la programmation de l'entretien routier.",
    longDescription: "Outil d'aide à la décision pour la programmation de l'entretien routier, conforme aux méthodes AASHTO et au modèle HDM-4 de la Banque Mondiale : gestion du patrimoine routier (chaussée, structure), suivi de l'indice d'état du réseau, priorisation des interventions (bon, moyen, mauvais, hors d'usage), planification de la maintenance et génération de rapports cartographiques.",
    categorySlug: "routes",
    priceMonthly: 25000,
    priceAnnual: 200000,
    isFree: false,
    icon: "Map",
    tags: ["AASHTO", "HDM-4", "Entretien routier", "Patrimoine"],
  },

  // === CHARPENTE BOIS & MÉTALLIQUE ===
  {
    id: 13,
    slug: "fermes-bois-metalliques",
    name: "Calcul des fermes (Bois & Métalliques)",
    shortDescription: "Calcule les fermes de toiture en charpente bois et métallique.",
    longDescription: "Calcule les fermes de toiture en charpente bois et en charpente métallique : détermination des efforts dans les barres (treillis), vérification des sections aux Eurocodes (EC5 pour le bois, EC3 pour le métal) et dimensionnement des assemblages.",
    categorySlug: "charpente",
    priceMonthly: 5000,
    priceAnnual: 50000,
    isFree: false,
    icon: "Triangle",
    tags: ["Ferme", "Charpente", "Treillis", "EC3", "EC5"],
  },

  // === GÉOTECHNIQUE ===
  {
    id: 14,
    slug: "dimensionnement-chaussee",
    name: "Dimensionnement de chaussée",
    shortDescription: "Dimensionne les structures de chaussée à partir du trafic cumulé.",
    longDescription: "Dimensionne les structures de chaussée (couches de roulement, base, fondation) à partir du trafic cumulé, de la portance du sol support et des matériaux disponibles, selon les méthodes de dimensionnement usuelles (catalogue de structures, méthode CBR/AASHTO).",
    categorySlug: "geotechnique",
    isFree: true,
    icon: "Route",
    tags: ["Chaussée", "CBR", "AASHTO", "Trafic"],
  },
  {
    id: 15,
    slug: "formulation-betons",
    name: "Formulation des bétons",
    shortDescription: "Formulation interactive des bétons (méthode Dreux-Gorisse).",
    longDescription: "Réalise la formulation interactive des bétons (méthode de type Dreux-Gorisse) : détermination des dosages en ciment (C), eau (E), sable (S) et gravier (G), calcul du rapport Eau/Ciment, estimation de la résistance caractéristique (fck ≥ 25 MPa) à partir de la loi fck = A/(E/C)^B, et édition de la fiche de formulation pour éprouvettes normalisées (150×150×150 mm).",
    categorySlug: "geotechnique",
    priceMonthly: 5000,
    priceAnnual: 50000,
    isFree: false,
    icon: "FlaskConical",
    tags: ["Béton", "Dreux-Gorisse", "Formulation", "fck"],
  },
  {
    id: 16,
    slug: "courbe-granulometrique",
    name: "Courbe granulométrique",
    shortDescription: "Trace et analyse la courbe granulométrique des granulats.",
    longDescription: "Trace et analyse la courbe granulométrique des granulats à partir des résultats d'analyse par tamisage : calcul des tamisats cumulés, détermination du module de finesse et classification des matériaux selon les normes en vigueur.",
    categorySlug: "geotechnique",
    isFree: true,
    isPopular: true,
    appUrl: "/apps/courbe-granulometrique",
    icon: "LineChart",
    tags: ["Granulométrie", "Tamisage", "Module de finesse"],
  },

  // === AUTRES ===
  {
    id: 17,
    slug: "gestion-tontines",
    name: "Gestion des Tontines",
    shortDescription: "Outil de gestion de tontines et groupes d'épargne.",
    longDescription: "Outil de gestion de tontines et groupes d'épargne : suivi des cotisations et des membres, génération des comptes rendus de réunion, édition des rapports financiers (recettes, dépenses, soldes) et gestion administrative du groupe.",
    categorySlug: "autres",
    priceAnnual: 25000,
    isFree: false,
    icon: "Users",
    tags: ["Tontine", "Épargne", "Cotisations", "Rapports"],
  },
  {
    id: 18,
    slug: "gestion-fermes-avicoles",
    name: "Gestion des Fermes Avicoles",
    shortDescription: "Outil de gestion des fermes avicoles : cycles, stocks, finances.",
    longDescription: "Outil de gestion des fermes avicoles : suivi des cycles de production (mise en place, mortalité, croissance), gestion des stocks (aliments, intrants), suivi financier (charges, recettes) et édition de rapports de performance.",
    categorySlug: "autres",
    priceAnnual: 25000,
    isFree: false,
    icon: "Bird",
    tags: ["Aviculture", "Cycles", "Stocks", "Performance"],
  },
  {
    id: 19,
    slug: "himo-tender-integrator",
    name: "HIMO Tender Integrator",
    shortDescription: "Outil d'intégration et de gestion des appels d'offres HIMO.",
    longDescription: "Outil d'intégration et de gestion des appels d'offres HIMO (Haute Intensité de Main-d'Œuvre) : constitution des dossiers d'appel d'offres, calcul des ratios main-d'œuvre/matériel, suivi administratif des soumissions et édition des pièces du marché.",
    categorySlug: "autres",
    priceMonthly: 25000,
    priceAnnual: 250000,
    isFree: false,
    icon: "FileText",
    tags: ["HIMO", "Appel d'offres", "Main-d'œuvre", "Soumissions"],
  },
];

// ============================================================
// HELPERS
// ============================================================

export const getApplicationsByCategory = (categorySlug: string) =>
  applications.filter((app) => app.categorySlug === categorySlug);

export const getFreeApplications = () =>
  applications.filter((app) => app.isFree);

export const getPaidApplications = () =>
  applications.filter((app) => !app.isFree);

export const getApplicationBySlug = (slug: string) =>
  applications.find((app) => app.slug === slug);

export const getFeaturedApplications = () =>
  applications.filter((app) => app.isPopular || app.isFree).slice(0, 6);

export const getExpertiseApplications = () =>
  applications.filter((app) => app.isExpertise);

export const getExecutableApplications = () =>
  applications.filter((app) => app.appUrl);