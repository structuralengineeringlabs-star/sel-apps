/**
 * Accès à Postgres (Neon, intégration Vercel) : une requête paramétrée, une transaction.
 * L'exécuteur est remplaçable pour les tests (PGlite en mémoire).
 */
import "server-only";
import { Pool, type PoolClient } from "pg";

export type Ligne = Record<string, unknown>;
export interface Executeur {
  requete<T extends Ligne = Ligne>(texte: string, valeurs?: unknown[]): Promise<T[]>;
  transaction<R>(f: (ex: Executeur) => Promise<R>): Promise<R>;
}

let pool: Pool | null = null;
let remplacant: Executeur | null = null;

function urlBase(): string {
  const url = process.env.DATABASE_URL || process.env.POSTGRES_URL;
  if (!url) throw new Error("DATABASE_URL absente : connecter la base Postgres au projet Vercel.");
  return sslStrict(url);
}

/** Vérification complète du certificat demandée explicitement (comportement actuel de pg, sans l'avertissement associé). */
export const sslStrict = (url: string) => url.replace(/([?&]sslmode=)(prefer|require|verify-ca)\b/, "$1verify-full");

const surClient = (c: PoolClient): Executeur => ({
  requete: async <T extends Ligne>(t: string, v?: unknown[]) => (await c.query(t, v)).rows as T[],
  transaction: async (f) => f(surClient(c)), // déjà dans une transaction
});

const executeurPg: Executeur = {
  async requete<T extends Ligne>(texte: string, valeurs?: unknown[]) {
    pool ??= new Pool({ connectionString: urlBase(), max: 3 });
    return (await pool.query(texte, valeurs)).rows as T[];
  },
  async transaction(f) {
    pool ??= new Pool({ connectionString: urlBase(), max: 3 });
    const c = await pool.connect();
    try {
      await c.query("begin");
      const r = await f(surClient(c));
      await c.query("commit");
      return r;
    } catch (e) {
      await c.query("rollback");
      throw e;
    } finally {
      c.release();
    }
  },
};

export const db = (): Executeur => remplacant ?? executeurPg;
/** Tests uniquement : remplace l'exécuteur. */
export function remplacerExecuteur(ex: Executeur | null) { remplacant = ex; }
