/**
 * Prisma Stability — client generator wrapper
 */

import { execSync } from "node:child_process";

export function runPrismaGenerate(cwd?: string): { ok: boolean; output: string } {
  try {
    const output = execSync("npx prisma generate", {
      cwd,
      encoding: "utf8",
      stdio: ["pipe", "pipe", "pipe"],
      env: { ...process.env, NODE_OPTIONS: process.env.NODE_OPTIONS ?? "--dns-result-order=ipv4first" },
    });
    return { ok: true, output };
  } catch (err) {
    const e = err as { stdout?: string; stderr?: string };
    return {
      ok: false,
      output: `${e.stdout ?? ""}${e.stderr ?? ""}`,
    };
  }
}
