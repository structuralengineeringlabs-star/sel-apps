"use client";
export default function BoutonImprimer() {
  return <button type="button" onClick={() => window.print()} className="btn-secondary">Imprimer le reçu</button>;
}
