/**
 * Prisma Stability — client sync guard
 */

import fs from "node:fs";
import path from "node:path";

const ROOT = path.resolve(__dirname, "../../..");

export function getClientIndexPath(): string {
  return path.join(ROOT, "node_modules", ".prisma", "client", "index.d.ts");
}

export function isClientGenerated(): boolean {
  return fs.existsSync(getClientIndexPath());
}

export function assertClientInSync(schemaMtimeMs: number): { ok: boolean; message?: string } {
  const clientPath = getClientIndexPath();
  if (!fs.existsSync(clientPath)) {
    return { ok: false, message: "Prisma client not generated — run npm run prisma:generate" };
  }
  const clientMtime = fs.statSync(clientPath).mtimeMs;
  if (clientMtime < schemaMtimeMs - 1000) {
    return {
      ok: false,
      message: "Prisma client older than schema.prisma — run npm run prisma:generate",
    };
  }
  return { ok: true };
}
