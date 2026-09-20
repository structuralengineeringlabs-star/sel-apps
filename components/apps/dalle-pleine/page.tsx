import type { Metadata } from "next";
import DallePleine from "@/components/apps/dalle-pleine/DallePleine";

export const metadata: Metadata = {
  title: "Dimensionnement Dalle Pleine — Eurocode 2",
  description:
    "Dimensionnez vos dalles pleines en béton armé selon l'Eurocode 2 (EN 1992-1-1). Calcul des moments, ferraillage, vérifications ELU/ELS, poinçonnement, flèches et note de calcul complète.",
};

export default function DallePleinePage() {
  return <DallePleine />;
}