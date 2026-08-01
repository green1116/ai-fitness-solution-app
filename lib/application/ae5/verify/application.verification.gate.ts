/**
 * AE-5 — Application Verification gate.
 * Nests AE-4 integration; verification catalogue / policy only.
 */
import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";

import { AE4_INTEGRATION_ID } from "../../ae4/integration.definition";
import { runApplicationIntegrationGate } from "../../ae4/verify/application.integration.gate";
import { resolveApplicationVerificationPlan } from "../application.verification";
import {
  AE5_CHECK_IDS,
  AE5_VERIFICATION_CHECKS,
} from "../verification.check";
import {
  AE5_BASE_FREEZE_REF,
  AE5_INTEGRATION_REF,
  AE5_MODULE_PATH,
  AE5_NON_GOALS,
  AE5_PACKAGE_ID,
  AE5_VERIFICATION_GATE,
  AE5_VERIFICATION_ID,
  APPLICATION_VERIFICATION_DEFINITION,
} from "../verification.definition";
import {
  AE5_POLICY_ID,
  AE5_POLICY_INVARIANT_IDS,
  APPLICATION_VERIFICATION_POLICY,
} from "../verification.policy";
import {
  AE5_PACKAGE_SCOPE_IDS,
  AE5_VERIFICATION_REGISTRY,
} from "../verification.registry";
import { buildApplicationVerificationReportModel } from "../verification.report";

export type ApplicationVerificationCheckRow = Readonly<{
  id: string;
  source: "AE-4" | "AE-5";
  title: string;
  status: "PASS" | "FAIL";
  evidence: string;
}>;

export type ApplicationVerificationReport = Readonly<{
  layer: "AE-5";
  verificationId: typeof AE5_VERIFICATION_ID;
  gateId: typeof AE5_VERIFICATION_GATE;
  baseFreezeRef: typeof AE5_BASE_FREEZE_REF;
  passed: boolean;
  checks: readonly ApplicationVerificationCheckRow[];
  summary: Readonly<{
    packages: number;
    checkCatalogue: number;
    invariants: number;
    integrationPassed: boolean;
    tscPassed: boolean;
  }>;
}>;

function check(
  id: string,
  source: ApplicationVerificationCheckRow["source"],
  title: string,
  ok: boolean,
  evidence: string,
): ApplicationVerificationCheckRow {
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

export function runApplicationVerificationGate(
  rootDir?: string,
): ApplicationVerificationReport {
  const root = resolveRoot(rootDir);
  const checks: ApplicationVerificationCheckRow[] = [];

  const integration = runApplicationIntegrationGate(root);
  checks.push(
    check(
      "AE5-AE4",
      "AE-4",
      "AE-4 application integration intact for verification",
      integration.passed &&
        integration.integrationId === AE4_INTEGRATION_ID &&
        AE5_INTEGRATION_REF === AE4_INTEGRATION_ID,
      `integration=${integration.integrationId} bindings=${integration.summary.bindings}`,
    ),
  );

  checks.push(
    check(
      "AE5-IDS",
      "AE-5",
      "Application verification IDs locked to AE-5 / AE-4 base",
      AE5_VERIFICATION_ID === "application-verification-ae5-v1" &&
        AE5_VERIFICATION_GATE === "application-verification-ae5-gate" &&
        AE5_PACKAGE_ID === "AE-5" &&
        AE5_BASE_FREEZE_REF === "ae-4-application-integration-v1" &&
        APPLICATION_VERIFICATION_DEFINITION.baseFreezeRef ===
          AE5_BASE_FREEZE_REF,
      `${AE5_VERIFICATION_ID} / base=${AE5_BASE_FREEZE_REF}`,
    ),
  );

  const plan = resolveApplicationVerificationPlan();
  const reportModel = buildApplicationVerificationReportModel();
  checks.push(
    check(
      "AE5-REUSE",
      "AE-5",
      "Verification reuses AE-4 integration plan",
      plan.matchesIntegration &&
        plan.verificationOnly &&
        plan.definition.integrationRef === AE4_INTEGRATION_ID &&
        reportModel.chain === "AE-1→AE-2→AE-3→AE-4",
      `packages=${plan.registry.length} checks=${plan.checks.length}`,
    ),
  );

  const missingScripts = AE5_VERIFICATION_REGISTRY.filter(
    (e) => !fs.existsSync(path.join(root, e.evidenceScript)),
  ).map((e) => e.evidenceScript);
  const missingModules = AE5_VERIFICATION_REGISTRY.filter(
    (e) => !fs.existsSync(path.join(root, e.modulePath)),
  ).map((e) => e.modulePath);
  checks.push(
    check(
      "AE5-CATALOGUE",
      "AE-5",
      "Verification registry / check catalogues locked",
      AE5_VERIFICATION_REGISTRY.length === AE5_PACKAGE_SCOPE_IDS.length &&
        AE5_PACKAGE_SCOPE_IDS.length === 4 &&
        AE5_VERIFICATION_CHECKS.length === AE5_CHECK_IDS.length &&
        AE5_CHECK_IDS.length === 8 &&
        missingScripts.length === 0 &&
        missingModules.length === 0 &&
        reportModel.packageCount === 4 &&
        reportModel.checkCount === 8,
      missingScripts.length || missingModules.length
        ? `missingScripts=${missingScripts.join(",")} missingModules=${missingModules.join(",")}`
        : `packages=${AE5_VERIFICATION_REGISTRY.length} checks=${AE5_VERIFICATION_CHECKS.length}`,
    ),
  );

  checks.push(
    check(
      "AE5-POLICY",
      "AE-5",
      "Verification policy: no business / workflow / integration changes / deployment",
      APPLICATION_VERIFICATION_POLICY.policyId === AE5_POLICY_ID &&
        AE5_POLICY_INVARIANT_IDS.length === 8 &&
        APPLICATION_VERIFICATION_POLICY.hasBusinessLogic === false &&
        APPLICATION_VERIFICATION_POLICY.hasWorkflow === false &&
        APPLICATION_VERIFICATION_POLICY.hasIntegrationChanges === false &&
        APPLICATION_VERIFICATION_POLICY.hasDeployment === false &&
        AE5_NON_GOALS.includes("business-logic") &&
        AE5_NON_GOALS.includes("workflow") &&
        AE5_NON_GOALS.includes("integration-changes") &&
        AE5_NON_GOALS.includes("deployment"),
      `invariants=${AE5_POLICY_INVARIANT_IDS.length}`,
    ),
  );

  const ae5Root = path.join(root, AE5_MODULE_PATH);
  const forbiddenTrees = [
    "workflow",
    "deployment",
    "business",
    "engines",
    "new-architecture",
  ].filter((name) => fs.existsSync(path.join(ae5Root, name)));
  checks.push(
    check(
      "AE5-NO-ARCH",
      "AE-5",
      "No workflow / deployment / new architecture under AE-5",
      forbiddenTrees.length === 0 &&
        fs.existsSync(path.join(ae5Root, "application.verification.ts")) &&
        fs.existsSync(path.join(ae5Root, "verification.definition.ts")) &&
        fs.existsSync(path.join(ae5Root, "verification.registry.ts")) &&
        fs.existsSync(path.join(ae5Root, "verification.check.ts")) &&
        fs.existsSync(path.join(ae5Root, "verification.report.ts")) &&
        fs.existsSync(path.join(ae5Root, "verification.policy.ts")) &&
        fs.existsSync(path.join(ae5Root, "index.ts")) &&
        fs.existsSync(
          path.join(ae5Root, "verify/application.verification.gate.ts"),
        ),
      forbiddenTrees.length
        ? forbiddenTrees.join(",")
        : `tree=${AE5_MODULE_PATH}`,
    ),
  );

  const ae5Files = listTsFiles(ae5Root);
  const coupleHits = ae5Files.filter((file) => {
    const text = fs.readFileSync(file, "utf8");
    return /from\s+["']@\/lib\/(frontend|backend|data|integration|delivery|implementation|closure|product)|from\s+["'][^"']*lib\/(frontend|backend|data|integration|delivery|implementation|closure|product)/.test(
      text,
    );
  });
  checks.push(
    check(
      "AE5-NO-COUPLE",
      "AE-5",
      "No cross-layer coupling outside AE-4 reuse",
      coupleHits.length === 0,
      coupleHits.length
        ? coupleHits.map((f) => path.relative(root, f)).join(",")
        : `scanned=${ae5Files.length}`,
    ),
  );

  checks.push(
    check(
      "AE5-NO-REDESIGN",
      "AE-5",
      "No AE-4 / upstream redesign; no integration changes",
      AE5_INTEGRATION_REF === "application-integration-ae4-v1" &&
        plan.baseFreezeRef === "ae-4-application-integration-v1" &&
        APPLICATION_VERIFICATION_POLICY.hasIntegrationChanges === false,
      `integrationRef=${AE5_INTEGRATION_REF}`,
    ),
  );

  const tscFiles = [
    ...listTsFiles(path.join(root, "lib/application/ae1")),
    ...listTsFiles(path.join(root, "lib/application/ae2")),
    ...listTsFiles(path.join(root, "lib/application/ae3")),
    ...listTsFiles(path.join(root, "lib/application/ae4")),
    ...ae5Files,
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
      "AE5-TSC",
      "AE-5",
      "TypeScript check passes for AE-1…AE-5 trees",
      tscPassed,
      tscPassed
        ? `files=${tscFiles.length}`
        : (tsc.stdout || tsc.stderr || "tsc failed").slice(0, 500),
    ),
  );

  const passed = checks.every((c) => c.status === "PASS");
  return {
    layer: "AE-5",
    verificationId: AE5_VERIFICATION_ID,
    gateId: AE5_VERIFICATION_GATE,
    baseFreezeRef: AE5_BASE_FREEZE_REF,
    passed,
    checks,
    summary: {
      packages: AE5_VERIFICATION_REGISTRY.length,
      checkCatalogue: AE5_VERIFICATION_CHECKS.length,
      invariants: AE5_POLICY_INVARIANT_IDS.length,
      integrationPassed: integration.passed,
      tscPassed,
    },
  };
}

export function assertApplicationVerificationGate(
  report: ApplicationVerificationReport = runApplicationVerificationGate(),
): void {
  if (!report.passed) {
    const failed = report.checks.filter((c) => c.status === "FAIL");
    throw new Error(
      `Application verification gate FAILED: ${failed.map((f) => f.id).join(", ")}`,
    );
  }
}
