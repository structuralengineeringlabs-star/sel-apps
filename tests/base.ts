/** Base Postgres en mémoire (PGlite) avec le schéma réel, branchée à la place de pg. */
import { PGlite, type Transaction } from "@electric-sql/pglite";
import { readFileSync } from "fs";
import { remplacerExecuteur, type Executeur, type Ligne } from "@/lib/serveur/db";

const envelopper = (c: PGlite | Transaction): Executeur => ({
  requete: async <T extends Ligne>(t: string, v?: unknown[]) => (await c.query<T>(t, v as unknown[])).rows,
  transaction: async f => ("transaction" in c && typeof (c as PGlite).transaction === "function" && c instanceof PGlite ? (c as PGlite).transaction(tx => f(envelopper(tx))) : f(envelopper(c))),
});

export async function baseDeTest() {
  const pg = new PGlite();
  await pg.exec(readFileSync("db/schema.sql", "utf8"));
  remplacerExecuteur(envelopper(pg));
  return pg;
}
