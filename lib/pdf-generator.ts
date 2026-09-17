import jsPDF from "jspdf";

export type PdfCalculation = {
  expression: string;
  details: string[];
  result: string;
  resultLabel?: string;
};

export type PdfConfig = {
  appName: string;
  appDescription?: string;
  calculations: PdfCalculation[];
  userName?: string;
};

/**
 * Génère et télécharge une fiche PDF S.E.L.
 */
export function generatePdf(config: PdfConfig) {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 15;
  let y = margin;

  // ============================================================
  // EN-TÊTE — Logo S.E.L. + Titre
  // ============================================================

  // Fond bleu pour l'en-tête
  doc.setFillColor(27, 111, 181); // #1B6FB5
  doc.rect(0, 0, pageWidth, 30, "F");

  // Texte S.E.L. (simulé, car on ne peut pas dessiner le SVG)
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  doc.text("S.E.L.", margin, 15);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.text("STRUCTURAL & ENGINEERING LABS", margin, 21);
  doc.setFontSize(8);
  doc.text("Yaoundé, Cameroun  ·  +237 651 135 605", margin, 26);

  y = 40;

  // ============================================================
  // TITRE DE LA FICHE
  // ============================================================

  doc.setTextColor(30, 30, 30);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.text("FICHE DE CALCUL", pageWidth / 2, y, { align: "center" });
  y += 8;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  doc.setTextColor(80, 80, 80);
  doc.text(config.appName, pageWidth / 2, y, { align: "center" });
  y += 10;

  // Ligne de séparation
  doc.setDrawColor(200, 200, 200);
  doc.line(margin, y, pageWidth - margin, y);
  y += 8;

  // ============================================================
  // INFORMATIONS GÉNÉRALES
  // ============================================================

  doc.setFontSize(9);
  doc.setTextColor(100, 100, 100);

  const dateStr = new Date().toLocaleString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  doc.text(`Date : ${dateStr}`, margin, y);
  if (config.userName) {
    doc.text(`Utilisateur : ${config.userName}`, pageWidth - margin, y, {
      align: "right",
    });
  }
  y += 8;

  // ============================================================
  // CALCULS
  // ============================================================

  config.calculations.forEach((calc, index) => {
    // Vérifier si on doit ajouter une nouvelle page
    if (y > pageHeight - 60) {
      doc.addPage();
      y = margin;
    }

    // Titre du calcul
    doc.setFillColor(240, 242, 245);
    doc.rect(margin, y - 4, pageWidth - 2 * margin, 8, "F");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(30, 30, 30);
    doc.text(`Calcul ${index + 1}`, margin + 2, y + 1);
    y += 10;

    // Données d'entrée
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(60, 60, 60);
    doc.text("Données d'entrée :", margin, y);
    y += 5;

    doc.setFont("courier", "normal");
    doc.setFontSize(10);
    doc.setTextColor(30, 30, 30);
    doc.text(calc.expression, margin + 4, y);
    y += 7;

    // Détails du calcul
    if (calc.details && calc.details.length > 0) {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.setTextColor(60, 60, 60);
      doc.text("Détail du calcul :", margin, y);
      y += 5;

      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.setTextColor(80, 80, 80);

      calc.details.forEach((detail) => {
        if (y > pageHeight - 40) {
          doc.addPage();
          y = margin;
        }
        doc.text(`•  ${detail}`, margin + 4, y);
        y += 5;
      });
      y += 2;
    }

    // Résultat
    doc.setFillColor(232, 241, 249); // Bleu très clair
    doc.rect(margin, y - 4, pageWidth - 2 * margin, 10, "F");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(14, 76, 130);
    doc.text(calc.resultLabel || "Résultat :", margin + 2, y + 2);

    doc.setFontSize(13);
    doc.text(calc.result, pageWidth - margin - 2, y + 2, { align: "right" });
    y += 14;
  });

  // ============================================================
  // PIED DE PAGE
  // ============================================================

  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);

    // Ligne de séparation
    doc.setDrawColor(200, 200, 200);
    doc.line(margin, pageHeight - 25, pageWidth - margin, pageHeight - 25);

    // Texte du pied
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(120, 120, 120);

    doc.text(
      "© Structural & Engineering Labs  ·  Yaoundé, Cameroun  ·  +237 651 135 605",
      pageWidth / 2,
      pageHeight - 18,
      { align: "center" }
    );

    doc.text(
      "Document généré par S.E.L. Applications  ·  https://sel-apps-six.vercel.app",
      pageWidth / 2,
      pageHeight - 13,
      { align: "center" }
    );

    // Numéro de page
    doc.setFontSize(8);
    doc.text(
      `Page ${i} / ${totalPages}`,
      pageWidth - margin,
      pageHeight - 8,
      { align: "right" }
    );
  }

  // ============================================================
  // TÉLÉCHARGEMENT
  // ============================================================

  const fileName = `SEL-${config.appName.replace(/\s+/g, "-")}-${Date.now()}.pdf`;
  doc.save(fileName);
}