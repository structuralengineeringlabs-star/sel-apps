/** @type {import('next').NextConfig} */
const nextConfig = {
  // Autorise les accès depuis ces origines en développement
  allowedDevOrigins: [
    '10.55.33.83',   // Votre IP actuelle
    'localhost',
    '127.0.0.1',
  ],

  // Autres options utiles pour le projet S.E.L.
  reactStrictMode: true,
  images: {
    remotePatterns: [
      // À compléter quand vous ajouterez des images distantes
      // { protocol: 'https', hostname: 'votre-cdn.com' },
    ],
  },
};

module.exports = nextConfig;