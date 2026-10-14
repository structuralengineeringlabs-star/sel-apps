import type { Metadata } from "next";
import Link from "next/link";
import { BookOpen } from "lucide-react";

export const metadata: Metadata = {
  title: "Calcul des corbeaux — Eurocode 2",
  description:
    "Dimensionnez les corbeaux en béton armé selon l'EC2 (annexe J.3) : corbeau simple ou double, modèle bielles-tirants, nœuds, tirant, cadres, ancrages, ELS, note de calcul, plan A3 et DXF, nomenclature.",
};

export default function CorbeauxPage() {
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-end gap-3 text-sm">
        <Link
          href="/documentation#guides"
          className="inline-flex items-center gap-1.5 text-sel hover:text-sel-dark font-semibold"
        >
          <BookOpen className="w-4 h-4" />
          Guide d&apos;utilisation (PDF)
        </Link>
      </div>
      <div
        className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-200"
        style={{ height: "calc(100vh - 180px)", minHeight: 700 }}
      >
        <h1 className="sr-only">Calcul des corbeaux — Eurocode 2</h1>
        <iframe
          src="/tools/corbeaux/index.html"
          title="Calcul des corbeaux — Eurocode 2"
          className="w-full h-full border-0"
          allow="clipboard-write; fullscreen"
        />
      </div>
    </div>
  );
}
