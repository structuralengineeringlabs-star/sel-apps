import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Château d'eau — Eurocodes",
  description:
    "Pré-dimensionnez un château d'eau sur 4 poteaux (cuve en béton armé, acier ou PEHD) aux Eurocodes : vent, poteaux au second ordre, ceintures, dalle de plateforme, semelles et longrines, cuve BA (fissuration EN 1992-3), note de calcul PDF et Word, plans A3 DXF et métrés.",
};

export default function ChateauEauPage() {
  return (
    <div
      className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-200"
      style={{ height: "calc(100vh - 180px)", minHeight: 700 }}
    >
      <h1 className="sr-only">Château d&apos;eau — Eurocodes</h1>
      <iframe
        src="/tools/chateau-eau/index.html"
        title="Château d'eau — Eurocodes"
        className="w-full h-full border-0"
        allow="clipboard-write; fullscreen"
      />
    </div>
  );
}
