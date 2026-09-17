import Link from "next/link";
import { BookOpen, FileText, HelpCircle, Video, Download } from "lucide-react";

export const metadata = {
  title: "Documentation",
  description: "Guides, tutoriels et FAQ des applications S.E.L.",
};

export default function DocumentationPage() {
  const sections = [
    {
      icon: BookOpen,
      title: "Guides d'utilisation",
      description: "Apprenez à utiliser chaque application pas à pas.",
      color: "#1B6FB5",
    },
    {
      icon: FileText,
      title: "Notes techniques",
      description: "Références aux Eurocodes et méthodologies de calcul.",
      color: "#2471A3",
    },
    {
      icon: Video,
      title: "Tutoriels vidéo",
      description: "Démonstrations en vidéo de chaque application.",
      color: "#C0392B",
    },
    {
      icon: HelpCircle,
      title: "FAQ",
      description: "Réponses aux questions les plus fréquentes.",
      color: "#D68910",
    },
    {
      icon: Download,
      title: "Prérequis techniques",
      description: "Configuration requise pour installer les applications.",
      color: "#7D3C98",
    },
  ];

  return (
    <div className="py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Documentation
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Toutes les ressources pour maîtriser nos applications : guides,
            tutoriels, notes techniques et FAQ.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sections.map((section) => {
            const IconComponent = section.icon;
            return (
              <div key={section.title} className="card">
                <div
                  className="w-12 h-12 rounded-lg flex items-center justify-center mb-4"
                  style={{ backgroundColor: `${section.color}15` }}
                >
                  <IconComponent
                    className="w-6 h-6"
                    style={{ color: section.color }}
                  />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">
                  {section.title}
                </h3>
                <p className="text-sm text-gray-600">{section.description}</p>
              </div>
            );
          })}
        </div>

        <div className="mt-16 text-center card bg-sel-light">
          <h2 className="text-xl font-bold text-sel-dark mb-2">
            Besoin d'aide supplémentaire ?
          </h2>
          <p className="text-gray-700 mb-6">
            Notre équipe support est disponible pour vous accompagner.
          </p>
          <Link href="/contact" className="btn-primary">
            Contacter le support
          </Link>
        </div>
      </div>
    </div>
  );
}