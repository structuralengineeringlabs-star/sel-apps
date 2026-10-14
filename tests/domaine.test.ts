import { describe, expect, it } from "vitest";
import { readdirSync, readFileSync, statSync } from "fs";
import { join } from "path";
import { SITE_URL } from "@/lib/site";
import { CONTACT } from "@/lib/contact";

/** Fichiers source du site (hors dépendances, constructions et applications compilées). */
function sources(dir: string, out: string[] = []): string[] {
  for (const n of readdirSync(dir)) {
    if (["node_modules", ".next", ".git", "public", "prive", "tests"].includes(n)) continue;
    const p = join(dir, n);
    if (statSync(p).isDirectory()) sources(p, out);
    else if (/\.(tsx?|jsx?|mjs|json|md)$/.test(n) && n !== "package-lock.json") out.push(p);
  }
  return out;
}

describe("domaine sel-apps.com", () => {
  it("adresse du site et e-mail de contact", () => {
    expect(SITE_URL).toBe("https://sel-apps.com");
    expect(CONTACT.email).toBe("contact@sel-apps.com");
  });
  it("aucune ancienne adresse dans le code (hors redirection de next.config.js)", () => {
    const fautifs = sources(".").filter(f => f !== "next.config.js" && f !== "DEPLOIEMENT.md" && /sel-apps\.cm\b|sel-apps-six\.vercel\.app/.test(readFileSync(f, "utf8")));
    expect(fautifs).toEqual([]);
  });
});
