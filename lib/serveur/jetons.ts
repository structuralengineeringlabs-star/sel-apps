/** Jetons aléatoires et empreintes (sessions, liens de connexion, PKCE). */
import "server-only";
import { createHash, randomBytes, timingSafeEqual } from "crypto";

export const jetonAleatoire = (octets = 32) => randomBytes(octets).toString("base64url");
export const empreinte = (jeton: string) => createHash("sha256").update(jeton).digest("hex");
export const defiPkce = (verificateur: string) => createHash("sha256").update(verificateur).digest("base64url");
export function egaliteSure(a: string, b: string): boolean {
  const x = Buffer.from(a), y = Buffer.from(b);
  return x.length === y.length && timingSafeEqual(x, y);
}
