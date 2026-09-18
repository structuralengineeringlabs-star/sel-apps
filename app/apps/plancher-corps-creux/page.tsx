import type { Metadata } from "next";
import PlancherCorpsCreux from "@/components/apps/plancher-corps-creux/PlancherCorpsCreux";

export const metadata: Metadata = {
  title: "Calculette EC2 Plancher Corps Creux",
  description:
    "Dimensionnez vos planchers à corps creux en béton armé selon l'Eurocode 2 (EN 1992-1-1). Poutrelles, dalle de compression, ferraillage, flèches et note de calcul complète.",
};

export default function PlancherCorpsCreuxPage() {
  return <PlancherCorpsCreux />;
}