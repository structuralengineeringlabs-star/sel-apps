import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dimensionnement Dalle Pleine — Eurocode 2",
  description:
    "Dimensionnez vos dalles pleines en béton armé selon l'Eurocode 2 (EN 1992-1-1) : moments de plaque, ferraillage automatique, vérifications ELU/ELS, fissuration, flèche (L/d), dispositions constructives, note de calcul imprimable et métré.",
};

export default function DallePleinePage() {
  return (
    <div
      className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-200"
      style={{ height: "calc(100vh - 140px)", minHeight: 700 }}
    >
      <h1 className="sr-only">Dimensionnement Dalle Pleine — Eurocode 2</h1>
      <iframe
        src="/tools/dalle-pleine/index.html"
        title="Dimensionnement Dalle Pleine — Eurocode 2"
        className="w-full h-full border-0"
        allow="clipboard-write; fullscreen"
      />
    </div>
  );
}
