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
    slug: "escaliers",
    appSlug: "escaliers",
    title: "Dimensionnement des escaliers — Guide d'utilisation",
    description:
      "Prise en main complète : saisie de la géométrie, matériaux et paramètres de calcul, escaliers béton, acier et bois, quart tournant, lecture des vérifications, optimiseur, plans DXF, note de calcul, métrés et gestion des projets. Illustré de schémas et de captures d'écran.",
    pdfUrl: "/docs/guides/Guide_utilisateur_Escaliers_Eurocodes.pdf",
    sizeLabel: "1,8 Mo",
    pages: 21,
    version: "0.9.0",
    updated: "octobre 2026",
    appUrl: "/apps/escaliers",
    topics: ["EC2", "EC3", "EC5", "Quart tournant", "Optimiseur", "DXF", "Note PDF"],
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
];
