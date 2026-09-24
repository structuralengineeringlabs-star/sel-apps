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
    sizeLabel: "1,9 Mo",
    pages: 21,
    version: "0.8.0",
    updated: "septembre 2026",
    appUrl: "/apps/escaliers",
    topics: ["EC2", "EC3", "EC5", "Quart tournant", "Optimiseur", "DXF", "Note PDF"],
  },
];
