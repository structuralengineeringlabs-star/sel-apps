import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "GranuLab Pro — Courbe granulométrique",
  description:
    "Trace et analyse la courbe granulométrique des granulats à partir des résultats d'analyse par tamisage et sédimentométrie : comparaison multi-échantillons, calcul de D10/D15/D30/D50/D60/D85, Cu, Cc, classification GTR, critères de filtre de Terzaghi et export PDF.",
};

export default function CourbeGranulometriquePage() {
  return (
    <div
      className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-200"
      style={{ height: "calc(100vh - 180px)", minHeight: 700 }}
    >
      <iframe
        src="/tools/courbe-granulometrique.html"
        title="GranuLab Pro — Courbe granulométrique"
        className="w-full h-full border-0"
      />
    </div>
  );
}
