import Link from "next/link";
import { BookOpen, FileText, HelpCircle, Video, Download, ExternalLink, Play } from "lucide-react";
import { guides } from "@/data/guides";

export const metadata = {
  title: "Documentation",
  description: "Guides, tutoriels et FAQ des applications S.E.L.",
};

export default function DocumentationPage() {
  const sections: { icon: typeof BookOpen; title: string; description: string; color: string; href?: string }[] = [
    {
      icon: BookOpen,
      title: "Guides d'utilisation",
      description: "Apprenez à utiliser chaque application pas à pas.",
      color: "#1B6FB5",
      href: "#guides",
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
            const body = (
              <>
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
                {section.href && (
                  <p className="text-sm font-semibold text-sel mt-3">
                    {guides.length} guide{guides.length > 1 ? "s" : ""} disponible{guides.length > 1 ? "s" : ""} →
                  </p>
                )}
              </>
            );
            return section.href ? (
              <a key={section.title} href={section.href} className="card block">
                {body}
              </a>
            ) : (
              <div key={section.title} className="card">
                {body}
              </div>
            );
          })}
        </div>

        <section id="guides" className="mt-16 scroll-mt-24">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Guides d&apos;utilisation
          </h2>
          <p className="text-gray-600 mb-6">
            Guides illustrés à consulter en ligne ou à télécharger. Chaque
            application dispose aussi d&apos;une aide intégrée (bouton « Aide »
            ou touche F1).
          </p>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {guides.map((guide) => (
              <article key={guide.slug} className="card flex flex-col">
                <div className="flex items-start gap-4">
                  <div
                    className="w-12 h-12 shrink-0 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: "#1B6FB515" }}
                  >
                    <BookOpen className="w-6 h-6" style={{ color: "#1B6FB5" }} />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">
                      {guide.title}
                    </h3>
                    <p className="text-xs text-gray-500 mt-0.5">
                      PDF · {guide.pages} pages · {guide.sizeLabel} · version{" "}
                      {guide.version} · {guide.updated}
                    </p>
                  </div>
                </div>
                <p className="text-sm text-gray-600 mt-4">{guide.description}</p>
                <div className="flex flex-wrap gap-1.5 mt-3">
                  {guide.topics.map((t) => (
                    <span
                      key={t}
                      className="text-xs px-2 py-0.5 rounded-full bg-sel-light text-sel-dark"
                    >
                      {t}
                    </span>
                  ))}
                </div>
                <div className="flex flex-wrap gap-3 mt-6">
                  <a href={guide.pdfUrl} download className="btn-primary">
                    <Download className="w-4 h-4 mr-2" />
                    Télécharger le PDF
                  </a>
                  <a
                    href={guide.pdfUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-secondary"
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Consulter en ligne
                  </a>
                  {guide.appUrl && (
                    <Link href={guide.appUrl} className="btn-secondary">
                      <Play className="w-4 h-4 mr-2" />
                      Ouvrir l&apos;application
                    </Link>
                  )}
                </div>
              </article>
            ))}
          </div>
        </section>

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