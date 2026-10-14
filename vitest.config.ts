import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  resolve: { alias: { "@": path.resolve(__dirname, "."), "server-only": path.resolve(__dirname, "tests/vide.ts") } },
  test: { include: ["tests/**/*.test.ts"], testTimeout: 30000 },
});
