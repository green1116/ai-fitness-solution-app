/**
 * AE-6 — Application Freeze verification gate.
 * Nests AE-5 verification; freeze catalogue only.
 */
import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";

import { AE5_VERIFICATION_ID } from "../../ae5/verification.definition";
import { runApplicationVerificationGate } from "../../ae5/verify/application.verification.gate";
import { resolveApplicationFreezePlan } from "../application.freeze";
import {
  AE6_APPLICATION_BASELINE_ID,
  AE6_APPLICATION_COMPLETE_ID,
  AE6_BASELINE_CATALOGUE,
  AE6_TAG_REF,
} from "../freeze.baseline";
import {
  AE6_BASE_FREEZE_REF,
  AE6_FREEZE_GATE,
  AE6_FREEZE_ID,
  AE6_MODULE_PATH,
  AE6_NON_GOALS,
  AE6_PACKAGE_ID,
  AE6_VERIFICATION_REF,
  APPLICATION_FREEZE_DEFINITION,
} from "../freeze.definition";
import { AE6_FREEZE_LOCKS, AE6_LOCK_IDS } from "../freeze.lock";
import {
  AE6_MANIFEST_PACKAGES,
  AE6_PACKAGE_CHAIN,
  resolveApplicationFreezeManifest,
} from "../freeze.manifest";
import {
  AE6_ROLLBACK_CATALOGUE,
  AE6_ROLLBACK_IDS,
} from "../freeze.rollback";

export type ApplicationFreezeCheck = Readonly<{
  id: string;
  source: "AE-5" | "AE-6";
  title: string;
  status: "PASS" | "FAIL";
  evidence: string;
}>;

export type ApplicationFreezeReport = Readonly<{
  layer: "AE-6";
  freezeId: typeof AE6_FREEZE_ID;
  gateId: typeof AE6_FREEZE_GATE;
  baseFreezeRef: typeof AE6_BASE_FREEZE_REF;
  passed: boolean;
  checks: readonly ApplicationFreezeCheck[];
  summary: Readonly<{
    packages: number;
    locks: number;
    rollbacks: number;
    baselines: number;
    verificationPassed: boolean;
    tscPassed: boolean;
  }>;
}>;

function check(
  id: string,
  source: ApplicationFreezeCheck["source"],
  title: string,
  ok: boolean,
  evidence: string,
): ApplicationFreezeCheck {
  return {
    id,
    source,
    title,
    status: ok ? "PASS" : "FAIL",
    evidence,
  };
}

function resolveRoot(rootDir?: string): string {
  return rootDir
    ? path.resolve(rootDir)
    : path.resolve(__dirname, "../../../..");
}

function listTsFiles(dir: string): string[] {
  if (!fs.existsSync(dir)) return [];
  const out: string[] = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...listTsFiles(full));
    else if (full.endsWith(".ts") || full.endsWith(".tsx")) out.push(full);
  }
  return out;
}

export function runApplicationFreezeGate(
  rootDir?: string,
): ApplicationFreezeReport {
  const root = resolveRoot(rootDir);
  const checks: ApplicationFreezeCheck[] = [];

  const verification = runApplicationVerificationGate(root);
  checks.push(
    check(
      "AE6-AE5",
      "AE-5",
      "AE-5 application verification intact for freeze",
      verification.passed &&
        verification.verificationId === AE5_VERIFICATION_ID &&
        AE6_VERIFICATION_REF === AE5_VERIFICATION_ID,
      `verification=${verification.verificationId} checks=${verification.summary.checkCatalogue}`,
    ),
  );

  checks.push(
    check(
      "AE6-IDS",
      "AE-6",
      "Application freeze IDs locked to AE-6 / AE-5 base",
      AE6_FREEZE_ID === "application-freeze-ae6-v1" &&
        AE6_FREEZE_GATE === "application-freeze-ae6-gate" &&
        AE6_PACKAGE_ID === "AE-6" &&
        AE6_BASE_FREEZE_REF === "ae-5-application-verification-v1" &&
        APPLICATION_FREEZE_DEFINITION.baseFreezeRef === AE6_BASE_FREEZE_REF &&
        AE6_TAG_REF === "ae-6-application-freeze-v1" &&
        AE6_APPLICATION_BASELINE_ID === "application-assembly-baseline-v1" &&
        AE6_APPLICATION_COMPLETE_ID === "application-assembly-complete-v1",
      `${AE6_FREEZE_ID} / base=${AE6_BASE_FREEZE_REF} / tag=${AE6_TAG_REF}`,
    ),
  );

  const plan = resolveApplicationFreezePlan();
  const manifest = resolveApplicationFreezeManifest();
  checks.push(
    check(
      "AE6-REUSE",
      "AE-6",
      "Freeze reuses AE-5 verification plan",
      plan.matchesVerification &&
        plan.freezeOnly &&
        plan.definition.verificationRef === AE5_VERIFICATION_ID &&
        manifest.chain === "AE-1→AE-2→AE-3→AE-4→AE-5→AE-6",
      `chain=${manifest.chain} packages=${manifest.packages.length}`,
    ),
  );

  const missingScripts = AE6_MANIFEST_PACKAGES.filter(
    (p) => !fs.existsSync(path.join(root, p.evidenceScript)),
  ).map((p) => p.evidenceScript);
  const missingModules = AE6_MANIFEST_PACKAGES.filter(
    (p) => !fs.existsSync(path.join(root, p.modulePath)),
  ).map((p) => p.modulePath);
  checks.push(
    check(
      "AE6-CATALOGUE",
      "AE-6",
      "Freeze manifest / lock / rollback / baseline catalogues locked",
      AE6_MANIFEST_PACKAGES.length === AE6_PACKAGE_CHAIN.length &&
        AE6_PACKAGE_CHAIN.length === 6 &&
        AE6_FREEZE_LOCKS.length === AE6_LOCK_IDS.length &&
        AE6_LOCK_IDS.length === 6 &&
        AE6_ROLLBACK_CATALOGUE.length === AE6_ROLLBACK_IDS.length &&
        AE6_ROLLBACK_IDS.length === 5 &&
        AE6_BASELINE_CATALOGUE.length === 7 &&
        missingScripts.length === 0 &&
        missingModules.length === 0,
      missingScripts.length || missingModules.length
        ? `missingScripts=${missingScripts.join(",")} missingModules=${missingModules.join(",")}`
        : `packages=${AE6_MANIFEST_PACKAGES.length} locks=${AE6_FREEZE_LOCKS.length} rollbacks=${AE6_ROLLBACK_CATALOGUE.length}`,
    ),
  );

  checks.push(
    check(
      "AE6-POLICY",
      "AE-6",
      "Freeze only: no business / runtime / workflow / integration / deployment",
      AE6_NON_GOALS.includes("business-logic") &&
        AE6_NON_GOALS.includes("runtime") &&
        AE6_NON_GOALS.includes("workflow") &&
        AE6_NON_GOALS.includes("integration") &&
        AE6_NON_GOALS.includes("deployment") &&
        plan.freezeOnly,
      `nonGoals=${AE6_NON_GOALS.length}`,
    ),
  );

  const ae6Root = path.join(root, AE6_MODULE_PATH);
  const forbiddenTrees = [
    "runtime",
    "workflow",
    "integration",
    "deployment",
    "business",
    "engines",
    "new-architecture",
  ].filter((name) => fs.existsSync(path.join(ae6Root, name)));
  checks.push(
    check(
      "AE6-NO-ARCH",
      "AE-6",
      "No runtime / workflow / integration / deployment / new architecture under AE-6",
      forbiddenTrees.length === 0 &&
        fs.existsSync(path.join(ae6Root, "application.freeze.ts")) &&
        fs.existsSync(path.join(ae6Root, "freeze.definition.ts")) &&
        fs.existsSync(path.join(ae6Root, "freeze.manifest.ts")) &&
        fs.existsSync(path.join(ae6Root, "freeze.lock.ts")) &&
        fs.existsSync(path.join(ae6Root, "freeze.rollback.ts")) &&
        fs.existsSync(path.join(ae6Root, "freeze.baseline.ts")) &&
        fs.existsSync(path.join(ae6Root, "index.ts")) &&
        fs.existsSync(path.join(ae6Root, "verify/application.freeze.gate.ts")),
      forbiddenTrees.length
        ? forbiddenTrees.join(",")
        : `tree=${AE6_MODULE_PATH}`,
    ),
  );

  const ae6Files = listTsFiles(ae6Root);
  const coupleHits = ae6Files.filter((file) => {
    const text = fs.readFileSync(file, "utf8");
    return /from\s+["']@\/lib\/(frontend|backend|data|integration|delivery|implementation|closure|product)|from\s+["'][^"']*lib\/(frontend|backend|data|integration|delivery|implementation|closure|product)/.test(
      text,
    );
  });
  checks.push(
    check(
      "AE6-NO-COUPLE",
      "AE-6",
      "No cross-layer coupling outside AE-5 reuse",
      coupleHits.length === 0,
      coupleHits.length
        ? coupleHits.map((f) => path.relative(root, f)).join(",")
        : `scanned=${ae6Files.length}`,
    ),
  );

  checks.push(
    check(
      "AE6-NO-REDESIGN",
      "AE-6",
      "No AE-5 / upstream redesign",
      AE6_VERIFICATION_REF === "application-verification-ae5-v1" &&
        plan.baseFreezeRef === "ae-5-application-verification-v1",
      `verificationRef=${AE6_VERIFICATION_REF}`,
    ),
  );

  const tscFiles = [
    ...listTsFiles(path.join(root, "lib/application/ae1")),
    ...listTsFiles(path.join(root, "lib/application/ae2")),
    ...listTsFiles(path.join(root, "lib/application/ae3")),
    ...listTsFiles(path.join(root, "lib/application/ae4")),
    ...listTsFiles(path.join(root, "lib/application/ae5")),
    ...ae6Files,
  ];
  const tscBin = path.join(root, "node_modules", "typescript", "bin", "tsc");
  const tsc = fs.existsSync(tscBin)
    ? spawnSync(
        process.execPath,
        [
          tscBin,
          "--noEmit",
          "--pretty",
          "false",
          "--strict",
          "--module",
          "esnext",
          "--moduleResolution",
          "bundler",
          "--target",
          "ES2017",
          "--esModuleInterop",
          "--skipLibCheck",
          ...tscFiles.map((f) => path.relative(root, f)),
        ],
        { cwd: root, encoding: "utf8" },
      )
    : spawnSync(
        "npx",
        [
          "tsc",
          "--noEmit",
          "--pretty",
          "false",
          "--strict",
          "--module",
          "esnext",
          "--moduleResolution",
          "bundler",
          "--target",
          "ES2017",
          "--esModuleInterop",
          "--skipLibCheck",
          ...tscFiles.map((f) => path.relative(root, f)),
        ],
        { cwd: root, encoding: "utf8", shell: true },
      );
  const tscPassed = tsc.status === 0;
  checks.push(
    check(
      "AE6-TSC",
      "AE-6",
      "TypeScript check passes for AE-1…AE-6 trees",
      tscPassed,
      tscPassed
        ? `files=${tscFiles.length}`
        : (tsc.stdout || tsc.stderr || "tsc failed").slice(0, 500),
    ),
  );

  const passed = checks.every((c) => c.status === "PASS");
  return {
    layer: "AE-6",
    freezeId: AE6_FREEZE_ID,
    gateId: AE6_FREEZE_GATE,
    baseFreezeRef: AE6_BASE_FREEZE_REF,
    passed,
    checks,
    summary: {
      packages: AE6_MANIFEST_PACKAGES.length,
      locks: AE6_FREEZE_LOCKS.length,
      rollbacks: AE6_ROLLBACK_CATALOGUE.length,
      baselines: AE6_BASELINE_CATALOGUE.length,
      verificationPassed: verification.passed,
      tscPassed,
    },
  };
}

export function assertApplicationFreezeGate(
  report: ApplicationFreezeReport = runApplicationFreezeGate(),
): void {
  if (!report.passed) {
    const failed = report.checks.filter((c) => c.status === "FAIL");
    throw new Error(
      `Application freeze gate FAILED: ${failed.map((f) => f.id).join(", ")}`,
    );
  }
}
