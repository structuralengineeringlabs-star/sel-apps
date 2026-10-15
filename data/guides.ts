export type Guide = {
  slug: string;
  appSlug: string;
  title: string;
  description: string;
  pdfUrl: string;
  sizeLabel: string;
  pages: number;
  version: string;
  updated: string;
  appUrl?: string;
  topics: string[];
};

export const guides: Guide[] = [
  {
    slug: "buses",
    appSlug: "buses",
    title: "Buses enterrées, fascicule 70 et Eurocodes — Guide d'utilisation",
    description:
      "Prise en main du parcours en 5 étapes : tuyau, pose et sol, charges Bc ou LM1, capacité hydraulique, armatures et tête de buse, lecture des vérifications (fascicule 70, EC2, EC7, hydraulique), note de calcul, plans A3 et DXF, nomenclature, métré, éditions démonstration et complète. Illustré de captures d'écran.",
    pdfUrl: "/docs/guides/Guide_utilisateur_Buses_Fascicule70.pdf",
    sizeLabel: "2,4 Mo",
    pages: 21,
    version: "3.1.0",
    updated: "octobre 2026",
    appUrl: "/apps/buses",
    topics: ["Fascicule 70", "LM1", "EC2", "EC7", "Manning-Strickler", "DXF"],
  },
  {
    slug: "corbeaux",
    appSlug: "corbeaux",
    title: "Corbeaux aux Eurocodes — Guide d'utilisation",
    description:
      "Prise en main complète : géométrie et charges, éditeur coté, corbeau simple ou double, matériaux et choix de l'ancrage (barre soudée ou boucles), lecture du modèle bielles-tirants, du ferraillage, des ELS et des vérifications (dont compression localisée et appui d'un élément préfabriqué), note de calcul, plan A3 et DXF, nomenclature. Illustré de captures d'écran.",
    pdfUrl: "/docs/guides/Guide_utilisateur_Corbeaux_Eurocodes.pdf",
    sizeLabel: "1,2 Mo",
    pages: 16,
    version: "1.4.0",
    updated: "octobre 2026",
    appUrl: "/apps/corbeaux",
    topics: ["EC2 annexe J.3", "Bielles-tirants", "Corbeau double", "Ancrages", "DXF", "Note PDF"],
  },
  {
    slug: "escaliers",
    appSlug: "escaliers",
    title: "Dimensionnement des escaliers — Guide d'utilisation",
    description:
      "Prise en main complète du parcours en 4 étapes : géométrie et charges, matériaux et armatures, résultats et documents. Escaliers béton, acier et bois, quart tournant, projets à plusieurs escaliers, lecture des vérifications et du verdict, optimiseur, aperçu et export des plans DXF/SVG, note de calcul, métrés et gestion des projets. Illustré de schémas et de captures d'écran.",
    pdfUrl: "/docs/guides/Guide_utilisateur_Escaliers_Eurocodes.pdf",
    sizeLabel: "1,8 Mo",
    pages: 20,
    version: "1.0.2",
    updated: "octobre 2026",
    appUrl: "/apps/escaliers",
    topics: ["EC2", "EC3", "EC5", "Quart tournant", "Multi-escaliers", "Optimiseur", "DXF", "Note PDF"],
  },
  {
    slug: "calcul-poutres",
    appSlug: "calcul-poutres",
    title: "Poutres continues aux Eurocodes — Guide d'utilisation",
    description:
      "Prise en main complète : géométrie et charges, éditeur de section, sections en T et en I, béton armé, profilés acier (catalogue IPE, HEA, HEB, IPN, tubes, PRS) et déversement, bois (classes C et GL, fluage, feu), lecture des vérifications, note de calcul, plans DXF, nomenclature et métrés. Illustré de captures d'écran.",
    pdfUrl: "/docs/guides/Guide_utilisateur_Poutres_Eurocodes.pdf",
    sizeLabel: "2,6 Mo",
    pages: 23,
    version: "6.7.1",
    updated: "octobre 2026",
    appUrl: "/apps/calcul-poutres",
    topics: ["EC2", "EC3", "EC5", "Sections en T et en I", "Déversement", "DXF", "Note PDF"],
  },
  {
    slug: "plancher-corps-creux",
    appSlug: "plancher-corps-creux",
    title: "Calculette EC2 Plancher Corps Creux — Guide d'utilisation",
    description:
      "Prise en main du parcours en 4 étapes : géométrie et charges, matériaux et armatures, résultats et documents. Poutrelle isostatique ou continue, flèche calculée, option résistance au feu (EN 1992-1-2), note de calcul, plans A3 en SVG et DXF, nomenclature et métré, limites du périmètre.",
    pdfUrl: "/docs/guides/Guide_utilisateur_Plancher_Corps_Creux_EC2.pdf",
    sizeLabel: "1,4 Mo",
    pages: 15,
    version: "1.1.3",
    updated: "octobre 2026",
    appUrl: "/apps/plancher-corps-creux",
    topics: ["EC2", "Poutrelle", "Flèche calculée", "Feu", "DXF", "Note PDF"],
  },
];
