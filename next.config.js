/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,

  // Éditions complètes des applications payantes (hors de public/), servies par app/outils/[application]/[[...chemin]]
  outputFileTracingIncludes: {
    "/outils/**": ["./prive/outils/**/*"],
  },

  // Ancienne adresse : redirection permanente, page par page, vers le domaine définitif
  async redirects() {
    return [
      {
        source: "/:path*",
        has: [{ type: "host", value: "sel-apps-six.vercel.app" }],
        destination: "https://sel-apps.com/:path*",
        permanent: true,
      },
    ];
  },

  async headers() {
    return [
      {
        // Toutes les réponses
        source: "/:path*",
        headers: [
          // Le site peut afficher ses propres applications en iframe ; les autres sites ne peuvent pas l'afficher
          { key: "Content-Security-Policy", value: "frame-ancestors 'self'" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
          { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
        ],
      },
      {
        // Applications compilées : noms de fichiers à empreinte, changés à chaque version
        source: "/tools/:app/assets/:file*",
        headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }],
      },
    ];
  },
};

module.exports = nextConfig;
