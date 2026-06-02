/**
 * V3.7 Runtime Verification Freeze — unified smoke pipeline
 */
import { execSync } from "node:child_process";
import path from "node:path";

import {
  VERIFY_GROUP_LABELS,
  VERIFY_REGISTRY,
  type VerifyGroup,
  type VerifyScriptEntry,
} from "./verify-registry";

type RunResult = {
  entry: VerifyScriptEntry;
  ok: boolean;
  durationMs: number;
  error?: string;
};

function runNpmScript(npmScript: string): { ok: boolean; durationMs: number; error?: string } {
  const started = Date.now();
  try {
    execSync(`npm run ${npmScript}`, {
      cwd: path.resolve(__dirname, ".."),
      stdio: "pipe",
      encoding: "utf8",
      env: process.env,
    });
    return { ok: true, durationMs: Date.now() - started };
  } catch (err) {
    const message =
      err instanceof Error
        ? err.message
        : typeof err === "string"
          ? err
          : "unknown error";
    return { ok: false, durationMs: Date.now() - started, error: message.slice(0, 500) };
  }
}

function parseArgs() {
  const groups = new Set<VerifyGroup>();
  let requiredOnly = false;

  for (const arg of process.argv.slice(2)) {
    if (arg === "--required-only") requiredOnly = true;
    else if (arg.startsWith("--group=")) {
      groups.add(arg.slice("--group=".length) as VerifyGroup);
    }
  }

  return { groups, requiredOnly };
}

async function main() {
  const { groups, requiredOnly } = parseArgs();
  let entries = VERIFY_REGISTRY;

  if (groups.size > 0) {
    entries = entries.filter((entry) => groups.has(entry.group));
  }
  if (requiredOnly) {
    entries = entries.filter((entry) => entry.required);
  }

  console.log("=== V3.7 Runtime Verification Freeze — Smoke Pipeline ===");
  console.log(`scripts=${entries.length} requiredOnly=${requiredOnly}`);
  console.log("");

  const pipelineStarted = Date.now();
  const results: RunResult[] = [];

  for (const entry of entries) {
    const label = VERIFY_GROUP_LABELS[entry.group];
    process.stdout.write(`[RUN] ${entry.npmScript} (${label}) ... `);
    const outcome = runNpmScript(entry.npmScript);
    results.push({ entry, ...outcome });

    if (outcome.ok) {
      console.log(`PASS (${outcome.durationMs}ms)`);
    } else {
      console.log(`FAIL (${outcome.durationMs}ms)`);
      if (outcome.error) {
        console.log(`      ${outcome.error.split("\n")[0]}`);
      }
    }
  }

  const passed = results.filter((r) => r.ok).length;
  const failed = results.filter((r) => !r.ok);
  const durationMs = Date.now() - pipelineStarted;

  console.log("");
  console.log("=== Summary ===");
  console.log(`PASS: ${passed}`);
  console.log(`FAIL: ${failed.length}`);
  console.log(`DURATION: ${durationMs}ms`);

  if (failed.length > 0) {
    console.log("");
    console.log("Failed scripts:");
    for (const result of failed) {
      console.log(`  - ${result.entry.npmScript} (${result.entry.id})`);
    }
    process.exit(1);
  }

  console.log("");
  console.log("All verifications PASSED.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
