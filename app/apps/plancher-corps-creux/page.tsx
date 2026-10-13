import type { Metadata } from "next";
import Link from "next/link";
import { BookOpen } from "lucide-react";

export const metadata: Metadata = {
  title: "Calculette EC2 Plancher Corps Creux",
  description:
    "Dimensionnez vos planchers à corps creux en béton armé selon l'Eurocode 2 (EN 1992-1-1) : poutrelle isostatique ou continue, section en T, flexion, effort tranchant, ELS, flèche calculée, résistance au feu, nomenclature, note de calcul, plans A3 et DXF.",
};

export default function PlancherCorpsCreuxPage() {
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
