import Link from "next/link";

type LogoProps = {
  variant?: "dark" | "light";
  size?: "sm" | "md" | "lg";
  showText?: boolean;
  href?: string;
};

export default function Logo({
  variant = "dark",
  size = "md",
  showText = true,
  href = "/",
}: LogoProps) {
  // Dimensions selon la taille
  const sizes = {
    sm: {
      hex: "w-9 h-9",
      hexText: "text-[9px]",
      title: "text-base",
      subtitle: "text-[9px]",
      subtitleTracking: "tracking-[0.3em]",
    },
    md: {
      hex: "w-12 h-12",
      hexText: "text-[11px]",
      title: "text-xl",
      subtitle: "text-[11px]",
      subtitleTracking: "tracking-[0.35em]",
    },
    lg: {
      hex: "w-16 h-16",
      hexText: "text-sm",
      title: "text-2xl",
      subtitle: "text-xs",
      subtitleTracking: "tracking-[0.4em]",
    },
  };

  const s = sizes[size];

  // Couleurs selon la variante
  const titleColor = variant === "dark" ? "text-gray-900" : "text-white";
  const subtitleColor = variant === "dark" ? "text-gray-500" : "text-white/60";
  const ampersandColor = "text-sel";

  // Couleur du SVG selon la variante
  const svgStroke = variant === "dark" ? "#3a9bd5" : "#ffffff";
  const svgFill = variant === "dark" ? "#3a9bd5" : "#ffffff";

  return (
    <Link href={href} className="flex items-center gap-3 group">
      {/* Logo hexagonal */}
      <div
        className={`relative ${s.hex} flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform duration-200`}
      >
        <svg
          viewBox="0 0 48 48"
          className="absolute inset-0 w-full h-full drop-shadow-lg"
        >
          {/* Fond hexagonal */}
          <path
            d="M24 4 L44 14 L44 34 L24 44 L4 34 L4 14 Z"
            fill={svgStroke}
            fillOpacity="0.05"
          />
          {/* Bordure hexagonale */}
          <path
            d="M24 4 L44 14 L44 34 L24 44 L4 34 L4 14 Z"
            fill="none"
            stroke={svgStroke}
            strokeWidth="2.5"
          />
          {/* Lignes intérieures */}
          <path
            d="M4 14 L44 34 M4 34 L44 14 M24 4 L24 44"
            stroke={svgStroke}
            strokeWidth="0.5"
            strokeOpacity="0.4"
          />
          {/* Rectangle intérieur */}
          <rect
            x="16"
            y="18"
            width="16"
            height="12"
            rx="2"
            fill={svgFill}
          />
        </svg>
        {/* Texte S.E.L. */}
        <span
          className={`relative font-sans font-black ${s.hexText} tracking-tighter mt-0.5 ${
            variant === "dark" ? "text-white" : "text-sel-dark"
          }`}
        >
          S.E.L.
        </span>
      </div>

      {/* Texte à droite */}
      {showText && (
        <div className="hidden sm:flex flex-col -space-y-1.5 text-left">
          <div className="flex items-baseline gap-1">
            <span
              className={`font-sans font-black ${s.title} tracking-tighter ${titleColor}`}
            >
              STRUCTURAL
            </span>
            <span
              className={`font-sans font-bold ${s.title} ${ampersandColor}`}
            >
              &
            </span>
          </div>
          <span
            className={`font-sans font-bold ${s.subtitle} ${s.subtitleTracking} uppercase ${subtitleColor}`}
          >
            ENGINEERING LABS
          </span>
        </div>
      )}
    </Link>
  );
}