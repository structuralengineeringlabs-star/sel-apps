/**
 * Applique db/schema.sql à la base Postgres (idempotent). Usage : DATABASE_URL=… npm run db:migrer
 * (ou `vercel env pull .env.local` puis `node --env-file=.env.local scripts/migrer.mjs`).
 */
import { readFileSync } from "fs";
import pg from "pg";

const url = process.env.DATABASE_URL || process.env.POSTGRES_URL;
if (!url) { console.error("DATABASE_URL absente."); process.exit(1); }
const client = new pg.Client({ connectionString: url });
await client.connect();
await client.query(readFileSync(new URL("../db/schema.sql", import.meta.url), "utf8"));
const { rows } = await client.query("select table_name from information_schema.tables where table_schema = 'public' order by 1");
console.log("Schéma appliqué :", rows.map(r => r.table_name).join(", "));
await client.end();
