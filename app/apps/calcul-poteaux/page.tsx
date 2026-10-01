import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Calcul des Poteaux EC2",
  description: "Dimensionnement de poteaux isolés en béton armé selon la NF EN 1992-1-1.",
};

export default function CalculPoteauxPage() {
  return (
    <div className="w-full" style={{ height: "calc(100vh - 4rem)" }}>
      <iframe
        src="https://poteaux-app.vercel.app"
        className="w-full h-full border-0"
        title="Calcul des Poteaux EC2"
        allow="clipboard-write"
        loading="lazy"
      />
    </div>
  );
}