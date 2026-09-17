import type { Metadata } from "next";
import CalculetteAciers from "@/components/apps/CalculetteAciers";

export const metadata: Metadata = {
  title: "Calculette des aciers",
  description:
    "Calculez la section d'acier (As), le diamètre et l'espacement des barres pour vos éléments en béton armé. Conforme à l'Eurocode 2.",
};

export default function CalculetteAciersPage() {
  return <CalculetteAciers />;
}