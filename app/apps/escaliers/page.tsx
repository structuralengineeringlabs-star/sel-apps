import type { Metadata } from "next";
import Link from "next/link";
import { BookOpen } from "lucide-react";

export const metadata: Metadata = {
  title: "Dimensionnement des escaliers — Eurocodes 2, 3 et 5",
  description:
    "Dimensionnez les escaliers en béton armé (EC2), à limons acier (EC3) ou bois (EC5) : volées droites et quart tournant, flexion, effort tranchant, flèche, ancrages, optimiseur, note de calcul PDF, plans DXF et métrés.",
};

export default function EscaliersPage() {
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
          src="/tools/escaliers/index.html"
          title="Dimensionnement des escaliers — Eurocodes"
          className="w-full h-full border-0"
        />
      </div>
    </div>
  );
}
