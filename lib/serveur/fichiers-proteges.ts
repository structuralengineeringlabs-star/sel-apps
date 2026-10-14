/** Résolution sûre d'un fichier de l'édition complète (dossier prive/outils/<application>/, hors de public/). */
import "server-only";
import path from "path";

export const RACINE = path.join(process.cwd(), "prive", "outils");
const TYPES: Record<string, string> = {
  ".html": "text/html; charset=utf-8", ".js": "text/javascript; charset=utf-8", ".css": "text/css; charset=utf-8", ".svg": "image/svg+xml",
  ".woff2": "font/woff2", ".woff": "font/woff", ".png": "image/png", ".json": "application/json", ".ico": "image/x-icon",
};
export const typeDe = (f: string) => TYPES[path.extname(f).toLowerCase()] ?? "application/octet-stream";

/** Chemin absolu du fichier demandé, ou null s'il sort du dossier de l'application (« .. », chemins absolus, octets nuls). */
export function resoudre(application: string, segments: string[] | undefined, racine = RACINE): string | null {
  if (!/^[a-z0-9-]+$/.test(application)) return null;
  const rel = (segments ?? []).join("/") || "index.html";
  if (rel.includes("\0") || rel.includes("\\")) return null;
  const dossier = path.join(racine, application);
  const absolu = path.resolve(dossier, rel);
  return absolu.startsWith(dossier + path.sep) ? absolu : null;
}
