"use client";

import { useState, useEffect, useCallback } from "react";
import { evaluate } from "mathjs";
import {
  Calculator,
  Plus,
  Trash2,
  FileDown,
  RotateCcw,
  History,
  CheckCircle,
} from "lucide-react";
import { generatePdf } from "@/lib/pdf-generator";

// ============================================================
// DONNÉES DE RÉFÉRENCE
// ============================================================

const DIAMETERS = [6, 8, 10, 12, 14, 16, 20, 25, 32, 40];

const AREA_MAP: Record<number, number> = {};
DIAMETERS.forEach((d) => {
  const areaCm2 = (Math.PI * d * d) / 4 / 100; // mm² → cm²
  AREA_MAP[d] = Math.round(areaCm2 * 1000) / 1000;
});

// ============================================================
// TYPES
// ============================================================

type HistoryEntry = {
  expression: string;
  result: string;
  isError: boolean;
};

type ComboLine = {
  id: number;
  nb: number;
  diam: number;
};

type EvaluationResult =
  | { type: "bars"; value: number; diam: number }
  | { type: "area"; value: number };

// ============================================================
// MOTEUR DE CALCUL (avec mathjs au lieu de eval)
// ============================================================

function evaluateExpression(expr: string): EvaluationResult {
  let clean = expr.replace(/\s+/g, "").replace(/×/g, "*");

  // Cas spécial : "6/HA12" → nombre de barres nécessaires
  const invMatch = clean.match(/^(\d+(?:\.\d+)?)\/HA(\d+)$/);
  if (invMatch) {
    const numerator = parseFloat(invMatch[1]);
    const diam = parseInt(invMatch[2]);
    if (!AREA_MAP[diam]) throw new Error(`Diamètre HA${diam} inconnu`);
    const nb = numerator / AREA_MAP[diam];
    return { type: "bars", value: Math.ceil(nb), diam };
  }

  // Remplacement des notations HA : "3HA16" → "(3 * 2.011)"
  clean = clean.replace(/(\d+(?:\.\d+)?)HA(\d+)/g, (_, qty, d) => {
    const diam = parseInt(d);
    if (!AREA_MAP[diam]) throw new Error(`Diamètre HA${d} inconnu`);
    return `(${qty} * ${AREA_MAP[diam]})`;
  });

  // Remplacement des HA seuls : "HA16" → "2.011"
  clean = clean.replace(/HA(\d+)/g, (_, d) => {
    const diam = parseInt(d);
    if (!AREA_MAP[diam]) throw new Error(`Diamètre HA${d} inconnu`);
    return AREA_MAP[diam].toString();
  });

  // Évaluation sécurisée avec mathjs
  try {
    const total = evaluate(clean);
    if (typeof total !== "number" || isNaN(total)) {
      throw new Error("Calcul invalide");
    }
    return { type: "area", value: total };
  } catch {
    throw new Error("Expression incorrecte");
  }
}

// ============================================================
// COMPOSANT PRINCIPAL
// ============================================================

export default function CalculetteAciers() {
  // État de la calculatrice
  const [inputExpr, setInputExpr] = useState("");
  const [history, setHistory] = useState<HistoryEntry[]>([]);

  // État du constructeur de combinaisons
  const [comboLines, setComboLines] = useState<ComboLine[]>([
    { id: 1, nb: 1, diam: 12 },
    { id: 2, nb: 1, diam: 14 },
  ]);

  // Somme totale
  const [total, setTotal] = useState(0);
  const [expression, setExpression] = useState("");

  // ============================================================
  // CALCUL DE LA SOMME
  // ============================================================

  useEffect(() => {
    let sum = 0;
    const parts: string[] = [];

    comboLines.forEach((line) => {
      const nb = line.nb || 0;
      const area = AREA_MAP[line.diam] || 0;
      sum += nb * area;
      if (nb > 0 && area > 0) {
        parts.push(`${nb}×HA${line.diam}`);
      }
    });

    setTotal(sum);
    setExpression(parts.join(" + ") || "aucune barre");
  }, [comboLines]);

  // ============================================================
  // CALCUL DE L'EXPRESSION
  // ============================================================

  const calculate = useCallback(() => {
    const expr = inputExpr.trim();
    if (!expr) return;

    try {
      const res = evaluateExpression(expr);
      let resultText = "";
      if (res.type === "bars") {
        resultText = `${res.value} barres HA${res.diam}`;
      } else {
        const val = res.value;
        const rounded = Number.isInteger(val) ? val : Math.round(val * 100) / 100;
        resultText = `${rounded} cm²`;
      }

      const entry: HistoryEntry = {
        expression: expr,
        result: resultText,
        isError: false,
      };

      setHistory((prev) => [entry, ...prev].slice(0, 5));
    } catch (err) {
      const entry: HistoryEntry = {
        expression: expr,
        result: err instanceof Error ? err.message : "Erreur",
        isError: true,
      };
      setHistory((prev) => [entry, ...prev].slice(0, 5));
    }
  }, [inputExpr]);

  // ============================================================
  // GESTION DU CLAVIER
  // ============================================================

  const handleKey = (key: string) => {
    if (key === "CE") {
      setInputExpr("");
    } else if (key === "=") {
      calculate();
    } else {
      setInputExpr((prev) => prev + key);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      calculate();
    }
  };

  // ============================================================
  // GESTION DES LIGNES DE COMBINAISON
  // ============================================================

  const addComboLine = () => {
    if (comboLines.length >= 10) {
      alert("Maximum 10 lignes atteint");
      return;
    }
    const newId = Math.max(...comboLines.map((l) => l.id), 0) + 1;
    setComboLines([...comboLines, { id: newId, nb: 1, diam: 12 }]);
  };

  const removeComboLine = (id: number) => {
    setComboLines(comboLines.filter((l) => l.id !== id));
  };

  const updateComboLine = (id: number, field: "nb" | "diam", value: number) => {
    setComboLines(
      comboLines.map((l) => (l.id === id ? { ...l, [field]: value } : l))
    );
  };

  // ============================================================
  // GÉNÉRATION PDF
  // ============================================================

  const handleDownloadPdf = () => {
    const details: string[] = [];

    comboLines.forEach((line) => {
      const nb = line.nb || 0;
      const area = AREA_MAP[line.diam] || 0;
      if (nb > 0 && area > 0) {
        details.push(
          `${nb} × HA${line.diam} = ${nb} × ${area.toFixed(3)} = ${(nb * area).toFixed(3)} cm²`
        );
      }
    });

    generatePdf({
      appName: "Calculette des aciers",
      appDescription: "Calcul de la section d'acier (As)",
      calculations: [
        {
          expression: expression || "Aucune barre définie",
          details:
            details.length > 0
              ? details
              : ["Aucune barre à calculer"],
          result: `${total.toFixed(3)} cm²`,
          resultLabel: "Section totale :",
        },
        ...history
          .filter((h) => !h.isError)
          .slice(0, 3)
          .map((h) => ({
            expression: h.expression,
            details: [],
            result: h.result,
            resultLabel: "Résultat :",
          })),
      ],
    });
  };

  // ============================================================
  // RESET
  // ============================================================

  const handleReset = () => {
    setInputExpr("");
    setHistory([]);
    setComboLines([
      { id: 1, nb: 1, diam: 12 },
      { id: 2, nb: 1, diam: 14 },
    ]);
  };

  // ============================================================
  // RENDU
  // ============================================================

  const keypadButtons = [
    { label: "7", value: "7" },
    { label: "8", value: "8" },
    { label: "9", value: "9" },
    { label: "/HA", value: "/HA" },
    { label: "CE", value: "CE", variant: "action" },
    { label: "4", value: "4" },
    { label: "5", value: "5" },
    { label: "6", value: "6" },
    { label: "×HA", value: "×HA" },
    { label: "-", value: "-" },
    { label: "1", value: "1" },
    { label: "2", value: "2" },
    { label: "3", value: "3" },
    { label: "%", value: "%" },
    { label: ".", value: "." },
    { label: "0", value: "0" },
    { label: "+", value: "+" },
  ];

  return (
    <div className="w-full">
      {/* Titre */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center justify-center gap-3">
          <Calculator className="w-8 h-8 text-sel" />
          Calculette des aciers
        </h1>
        <p className="text-gray-600">
          Calcul de la section d'acier (As) pour éléments en béton armé
        </p>
      </div>

      {/* Contenu principal */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-5xl mx-auto">
        {/* ============================================
            COLONNE 1 — CALCULATRICE
        ============================================ */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-sel-dark flex items-center gap-2">
              <Calculator className="w-5 h-5" />
              Calculatrice
            </h2>
            <button
              onClick={handleReset}
              className="text-xs text-gray-500 hover:text-sel flex items-center gap-1"
              title="Réinitialiser"
            >
              <RotateCcw className="w-3 h-3" />
              Réinitialiser
            </button>
          </div>

          {/* Écran */}
          <div className="bg-gray-50 rounded-lg p-3 mb-4 border border-gray-200">
            <input
              type="text"
              value={inputExpr}
              onChange={(e) => setInputExpr(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ex : 3HA16 + 2HA12"
              className="w-full border-none outline-none text-right text-lg font-semibold bg-transparent text-gray-900"
            />
          </div>

          {/* Clavier */}
          <div className="grid grid-cols-4 gap-2">
            {keypadButtons.map((btn, i) => (
              <button
                key={i}
                onClick={() => handleKey(btn.value)}
                className={`py-3 rounded-lg font-semibold text-sm transition-colors ${
                  btn.variant === "action"
                    ? "bg-red-100 text-red-700 hover:bg-red-200"
                    : "bg-gray-100 text-gray-900 hover:bg-gray-200"
                }`}
              >
                {btn.label}
              </button>
            ))}
            <button
              onClick={() => handleKey("=")}
              className="col-span-4 py-3 rounded-lg bg-sel text-white font-bold text-lg hover:bg-sel-dark transition-colors"
            >
              =
            </button>
          </div>

          {/* Historique */}
          {history.length > 0 && (
            <div className="mt-4">
              <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
                <History className="w-3 h-3" />
                Historique
              </div>
              <div className="bg-gray-50 rounded-lg p-3 space-y-1 max-h-32 overflow-y-auto">
                {history.map((h, i) => (
                  <div
                    key={i}
                    className={`text-sm font-mono ${
                      h.isError ? "text-red-600" : "text-gray-700"
                    }`}
                  >
                    {h.expression} = {h.result}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Aide */}
          <div className="mt-4 text-xs text-gray-500 space-y-1">
            <p>💡 <strong>Notation :</strong></p>
            <p>• <code>3HA16</code> = 3 barres de Ø16</p>
            <p>• <code>6/HA12</code> = nombre de barres nécessaires pour 6 cm²</p>
            <p>• <code>3HA16 + 2HA12</code> = combinaison</p>
          </div>
        </div>

        {/* ============================================
            COLONNE 2 — CONSTRUCTEUR DE COMBINAISONS
        ============================================ */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-5">
          <h2 className="text-lg font-bold text-sel-dark mb-4 flex items-center gap-2">
            <Plus className="w-5 h-5" />
            Combinaisons de barres
          </h2>

          {/* Lignes de combinaison */}
          <div className="space-y-2 mb-4">
            {comboLines.map((line) => (
              <div
                key={line.id}
                className="flex items-center gap-2 bg-gray-50 rounded-lg p-2"
              >
                <input
                  type="number"
                  min="0"
                  step="1"
                  value={line.nb}
                  onChange={(e) =>
                    updateComboLine(line.id, "nb", parseInt(e.target.value) || 0)
                  }
                  className="w-16 px-2 py-1 rounded border border-gray-300 text-center text-sm"
                />
                <span className="text-gray-500 text-sm">×</span>
                <select
                  value={line.diam}
                  onChange={(e) =>
                    updateComboLine(line.id, "diam", parseInt(e.target.value))
                  }
                  className="flex-1 px-2 py-1 rounded border border-gray-300 text-sm bg-white"
                >
                  {DIAMETERS.map((d) => (
                    <option key={d} value={d}>
                      HA{d}
                    </option>
                  ))}
                </select>
                <span className="text-xs text-gray-500 w-20 text-right">
                  {((line.nb || 0) * (AREA_MAP[line.diam] || 0)).toFixed(2)} cm²
                </span>
                <button
                  onClick={() => removeComboLine(line.id)}
                  className="p-1 text-red-500 hover:text-red-700"
                  title="Supprimer"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>

          {/* Bouton ajouter */}
          <button
            onClick={addComboLine}
            disabled={comboLines.length >= 10}
            className="w-full py-2 rounded-lg border-2 border-dashed border-sel text-sel font-semibold hover:bg-sel-light transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Ajouter une ligne
          </button>

          {/* Résultat */}
          <div className="mt-5 p-4 bg-sel-light rounded-lg">
            <div className="text-xs text-sel-dark uppercase tracking-wide mb-1">
              Somme totale
            </div>
            <div className="text-2xl font-bold text-sel-dark mb-2">
              {total.toFixed(3)} cm²
            </div>
            <div className="text-xs text-gray-600 font-mono break-all">
              {expression}
            </div>
          </div>

          {/* Bouton PDF */}
          <button
            onClick={handleDownloadPdf}
            className="mt-4 w-full py-3 rounded-lg bg-sel text-white font-semibold hover:bg-sel-dark transition-colors flex items-center justify-center gap-2"
          >
            <FileDown className="w-5 h-5" />
            Télécharger la fiche PDF
          </button>
        </div>
      </div>

      {/* Note de bas de page */}
      <div className="mt-8 text-center text-xs text-gray-500 max-w-3xl mx-auto">
        <p className="flex items-center justify-center gap-1">
          <CheckCircle className="w-3 h-3 text-green-500" />
          Calculs conformes à l'Eurocode 2 (EN 1992-1-1)
        </p>
      </div>
    </div>
  );
}