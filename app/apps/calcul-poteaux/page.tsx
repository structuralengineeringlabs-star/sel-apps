import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Calcul des Poteaux — Eurocodes 2, 3 et 5",
  description:
    "Dimensionnez les poteaux en béton armé (EC2), en acier (EC3 : IPE, HEA, HEB, HEM, IPN, tubes, PRS) ou en bois (EC5) : flambement, flexion composée, feu, note de calcul, plans SVG et DXF.",
};

export default function CalculPoteauxPage() {
  return (
    <div
      className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-200"
      style={{ height: "calc(100vh - 180px)", minHeight: 700 }}
    >
      <iframe
        src="/tools/poteaux/index.html"
        title="Calcul des Poteaux — Eurocodes"
        className="w-full h-full border-0"
        allow="clipboard-write"
      />
    </div>
  );
}
