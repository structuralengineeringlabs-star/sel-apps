import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Calculette EC2 Plancher Corps Creux",
  description:
    "Dimensionnez vos planchers à corps creux en béton armé selon l'Eurocode 2 (EN 1992-1-1) : poutrelle isostatique ou continue, section en T, flexion, effort tranchant, ELS, flèche calculée, nomenclature et note de calcul.",
};

export default function PlancherCorpsCreuxPage() {
  return (
    <div className="space-y-3">
      <div
        className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-200"
        style={{ height: "calc(100vh - 180px)", minHeight: 700 }}
      >
        <h1 className="sr-only">Calculette EC2 Plancher Corps Creux</h1>
        <iframe
          src="/tools/plancher-corps-creux/index.html"
          title="Calculette EC2 Plancher Corps Creux"
          className="w-full h-full border-0"
          allow="clipboard-write; fullscreen"
        />
      </div>
    </div>
  );
}
