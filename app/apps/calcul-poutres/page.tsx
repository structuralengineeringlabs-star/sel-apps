import type { Metadata } from "next";
import Link from "next/link";
import { BookOpen } from "lucide-react";

export const metadata: Metadata = {
  title: "Calcul des Poutres — Eurocodes 2, 3 et 5",
  description:
    "Dimensionnez les poutres continues en béton armé (EC2 : sections rectangulaires, en T, en L, en I), en acier (EC3 : IPE, HEA, HEB, HEM, IPN, tubes, PRS) ou en bois (EC5) : flexion, effort tranchant, déversement, flèches, feu, note de calcul, plans DXF et métrés.",
};

export default function CalculPoutresPage() {
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
        <iframe
          src="/tools/poutres/index.html"
          title="Calcul des Poutres — Eurocodes"
          className="w-full h-full border-0"
          allow="clipboard-write"
        />
      </div>
    </div>
  );
}
