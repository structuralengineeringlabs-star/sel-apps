export type Category = {
  id: string;
  name: string;
  slug: string;
  color: string;
  icon: string;
  order: number;
};

export const categories: Category[] = [
  {
    id: "1",
    name: "Bâtiments",
    slug: "batiments",
    color: "#C0392B",
    icon: "🏗️",
    order: 1,
  },
  {
    id: "2",
    name: "Ponts, Dalots & Réservoirs",
    slug: "ponts-dalots-reservoirs",
    color: "#2471A3",
    icon: "🌉",
    order: 2,
  },
  {
    id: "3",
    name: "Routes & Infrastructures",
    slug: "routes",
    color: "#1E8449",
    icon: "🛣️",
    order: 3,
  },
  {
    id: "4",
    name: "Charpente bois & Métallique",
    slug: "charpente",
    color: "#7D3C98",
    icon: "🔩",
    order: 4,
  },
  {
    id: "5",
    name: "Géotechnique",
    slug: "geotechnique",
    color: "#B9770E",
    icon: "⛰️",
    order: 5,
  },
  {
    id: "6",
    name: "Autres",
    slug: "autres",
    color: "#5D6D7E",
    icon: "📦",
    order: 6,
  },
];