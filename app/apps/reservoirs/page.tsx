import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Réservoirs en béton armé — Eurocodes",
  description:
    "Pré-dimensionnez un réservoir en béton armé cylindrique ou rectangulaire, enterré, semi-enterré, posé ou surélevé, aux Eurocodes : coques et plaques par éléments finis, étanchéité EN 1992-3, déformations gênées, radier, couverture, soulèvement, séisme et vent, note de calcul, plans A3 DXF et métrés.",
};

export default function ReservoirsPage() {
  return (
    <div
      className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-200"
      style={{ height: "calc(100vh - 180px)", minHeight: 700 }}
    >
      <h1 className="sr-only">Réservoirs en béton armé — Eurocodes</h1>
      <iframe
        src="/tools/reservoirs/index.html"
        title="Réservoirs en béton armé — Eurocodes"
        className="w-full h-full border-0"
        allow="clipboard-write; fullscreen"
      />
    </div>
  );
}
