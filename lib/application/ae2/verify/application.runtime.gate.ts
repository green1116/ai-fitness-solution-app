/**
 * AE-2 — Application Runtime verification gate.
 * Nests AE-1 assembly; runtime catalogue / policy only.
 */
import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";

import { AE1_ASSEMBLY_ID } from "../../ae1/application.definition";
import { runApplicationAssemblyGate } from "../../ae1/verify/application.assembly.gate";
import {
  AE2_ASSEMBLY_REF,
  AE2_BASE_FREEZE_REF,
  AE2_MODULE_PATH,
  AE2_NON_GOALS,
  AE2_PACKAGE_ID,
  AE2_RUNTIME_GATE,
  AE2_RUNTIME_ID,
  APPLICATION_RUNTIME_DEFINITION,
  resolveApplicationRuntimePlan,
} from "../application.runtime";
import { resolveApplicationRuntimeContext } from "../runtime.context";
import {
  AE2_ENVIRONMENT_IDS,
  AE2_RUNTIME_ENVIRONMENTS,
} from "../runtime.environment";
import {
  AE2_LIFECYCLE_CHAIN,
  AE2_LIFECYCLE_PHASE_IDS,
  AE2_LIFECYCLE_PHASES,
} from "../runtime.lifecycle";
import {
  AE2_POLICY_ID,
  AE2_POLICY_INVARIANT_IDS,
  APPLICATION_RUNTIME_POLICY,
} from "../runtime.policy";
import {
  AE2_RUNTIME_STATE_IDS,
  AE2_RUNTIME_STATES,
} from "../runtime.state";

export type ApplicationRuntimeCheck = Readonly<{
  id: string;
  source: "AE-1" | "AE-2";
  title: string;
  status: "PASS" | "FAIL";
  evidence: string;
}>;

export type ApplicationRuntimeReport = Readonly<{
  layer: "AE-2";
  runtimeId: typeof AE2_RUNTIME_ID;
  gateId: typeof AE2_RUNTIME_GATE;
  baseFreezeRef: typeof AE2_BASE_FREEZE_REF;
  passed: boolean;
  checks: readonly ApplicationRuntimeCheck[];
  summary: Readonly<{
    states: number;
    phases: number;
    environments: number;
    invariants: number;
    assemblyPassed: boolean;
    tscPassed: boolean;
  }>;
}>;

function check(
  id: string,
  source: ApplicationRuntimeCheck["source"],
  title: string,
  ok: boolean,
  evidence: string,
): ApplicationRuntimeCheck {
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

export function runApplicationRuntimeGate(
  rootDir?: string,
): ApplicationRuntimeReport {
  const root = resolveRoot(rootDir);
  const checks: ApplicationRuntimeCheck[] = [];

  const assembly = runApplicationAssemblyGate(root);
  checks.push(
    check(
      "AE2-AE1",
      "AE-1",
      "AE-1 application assembly intact for runtime",
      assembly.passed &&
        assembly.assemblyId === AE1_ASSEMBLY_ID &&
        AE2_ASSEMBLY_REF === AE1_ASSEMBLY_ID,
      `assembly=${assembly.assemblyId} surfaces=${assembly.summary.surfaces}`,
    ),
  );

  checks.push(
    check(
      "AE2-IDS",
      "AE-2",
      "Application runtime IDs locked to AE-2 / AE-1 base",
      AE2_RUNTIME_ID === "application-runtime-ae2-v1" &&
        AE2_RUNTIME_GATE === "application-runtime-ae2-gate" &&
        AE2_PACKAGE_ID === "AE-2" &&
        AE2_BASE_FREEZE_REF === "ae-1-application-assembly-v1" &&
        APPLICATION_RUNTIME_DEFINITION.baseFreezeRef === AE2_BASE_FREEZE_REF,
      `${AE2_RUNTIME_ID} / base=${AE2_BASE_FREEZE_REF}`,
    ),
  );

  const context = resolveApplicationRuntimeContext();
  const plan = resolveApplicationRuntimePlan("LOCAL", "BOUND");
  checks.push(
    check(
      "AE2-REUSE",
      "AE-2",
      "Runtime reuses AE-1 assembly context",
      context.matchesAssembly &&
        plan.matchesAssembly &&
        plan.context.assemblyId === AE1_ASSEMBLY_ID &&
        plan.runtimeOnly,
      `surfaces=${context.surfaceIds.length} packages=${context.packageIds.length} domains=${context.domainIds.length}`,
    ),
  );

  checks.push(
    check(
      "AE2-CATALOGUE",
      "AE-2",
      "Runtime state / lifecycle / environment catalogues locked",
      AE2_RUNTIME_STATES.length === AE2_RUNTIME_STATE_IDS.length &&
        AE2_RUNTIME_STATE_IDS.length === 6 &&
        AE2_LIFECYCLE_PHASES.length === AE2_LIFECYCLE_PHASE_IDS.length &&
        AE2_LIFECYCLE_CHAIN === "BOOTSTRAP→BIND→ACTIVATE→HOLD→SHUTDOWN" &&
        AE2_RUNTIME_ENVIRONMENTS.length === AE2_ENVIRONMENT_IDS.length &&
        AE2_ENVIRONMENT_IDS.length === 4 &&
        plan.stateId === "BOUND" &&
        plan.environmentId === "LOCAL",
      `states=${AE2_RUNTIME_STATES.length} phases=${AE2_LIFECYCLE_PHASES.length} envs=${AE2_RUNTIME_ENVIRONMENTS.length}`,
    ),
  );

  checks.push(
    check(
      "AE2-POLICY",
      "AE-2",
      "Runtime policy: no business / workflow / integration / deployment",
      APPLICATION_RUNTIME_POLICY.policyId === AE2_POLICY_ID &&
        AE2_POLICY_INVARIANT_IDS.length === 8 &&
        APPLICATION_RUNTIME_POLICY.hasBusinessLogic === false &&
        APPLICATION_RUNTIME_POLICY.hasWorkflow === false &&
        APPLICATION_RUNTIME_POLICY.hasIntegration === false &&
        APPLICATION_RUNTIME_POLICY.hasDeployment === false &&
        AE2_NON_GOALS.includes("workflow") &&
        AE2_NON_GOALS.includes("integration") &&
        AE2_NON_GOALS.includes("deployment") &&
        AE2_NON_GOALS.includes("business-logic"),
      `invariants=${AE2_POLICY_INVARIANT_IDS.length}`,
    ),
  );

  const ae2Root = path.join(root, AE2_MODULE_PATH);
  const forbiddenTrees = [
    "workflow",
    "integration",
    "deployment",
    "business",
    "engines",
    "new-architecture",
  ].filter((name) => fs.existsSync(path.join(ae2Root, name)));
  checks.push(
    check(
      "AE2-NO-ARCH",
      "AE-2",
      "No workflow / integration / deployment / new architecture under AE-2",
      forbiddenTrees.length === 0 &&
        fs.existsSync(path.join(ae2Root, "application.runtime.ts")) &&
        fs.existsSync(path.join(ae2Root, "runtime.context.ts")) &&
        fs.existsSync(path.join(ae2Root, "runtime.state.ts")) &&
        fs.existsSync(path.join(ae2Root, "runtime.lifecycle.ts")) &&
        fs.existsSync(path.join(ae2Root, "runtime.environment.ts")) &&
        fs.existsSync(path.join(ae2Root, "runtime.policy.ts")) &&
        fs.existsSync(path.join(ae2Root, "index.ts")) &&
        fs.existsSync(
          path.join(ae2Root, "verify/application.runtime.gate.ts"),
        ),
      forbiddenTrees.length
        ? forbiddenTrees.join(",")
        : `tree=${AE2_MODULE_PATH}`,
    ),
  );

  const ae2Files = listTsFiles(ae2Root);
  const coupleHits = ae2Files.filter((file) => {
    const text = fs.readFileSync(file, "utf8");
    return /from\s+["']@\/lib\/(frontend|backend|data|integration|delivery|implementation|closure|product)|from\s+["'][^"']*lib\/(frontend|backend|data|integration|delivery|implementation|closure|product)/.test(
      text,
    );
  });
  checks.push(
    check(
      "AE2-NO-COUPLE",
      "AE-2",
      "No cross-layer coupling outside AE-1 reuse",
      coupleHits.length === 0,
      coupleHits.length
        ? coupleHits.map((f) => path.relative(root, f)).join(",")
        : `scanned=${ae2Files.length}`,
    ),
  );

  checks.push(
    check(
      "AE2-NO-REDESIGN",
      "AE-2",
      "No AE-1 / upstream redesign",
      AE2_ASSEMBLY_REF === "application-assembly-ae1-v1" &&
        plan.baseFreezeRef === "ae-1-application-assembly-v1" &&
        !AE2_NON_GOALS.includes("runtime" as never),
      `assemblyRef=${AE2_ASSEMBLY_REF}`,
    ),
  );

  const tscFiles = [
    ...listTsFiles(path.join(root, "lib/application/ae1")),
    ...ae2Files,
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
      "AE2-TSC",
      "AE-2",
      "TypeScript check passes for AE-1 + AE-2 trees",
      tscPassed,
      tscPassed
        ? `files=${tscFiles.length}`
        : (tsc.stdout || tsc.stderr || "tsc failed").slice(0, 500),
    ),
  );

  const passed = checks.every((c) => c.status === "PASS");
  return {
    layer: "AE-2",
    runtimeId: AE2_RUNTIME_ID,
    gateId: AE2_RUNTIME_GATE,
    baseFreezeRef: AE2_BASE_FREEZE_REF,
    passed,
    checks,
    summary: {
      states: AE2_RUNTIME_STATES.length,
      phases: AE2_LIFECYCLE_PHASES.length,
      environments: AE2_RUNTIME_ENVIRONMENTS.length,
      invariants: AE2_POLICY_INVARIANT_IDS.length,
      assemblyPassed: assembly.passed,
      tscPassed,
    },
  };
}

export function assertApplicationRuntimeGate(
  report: ApplicationRuntimeReport = runApplicationRuntimeGate(),
): void {
  if (!report.passed) {
    const failed = report.checks.filter((c) => c.status === "FAIL");
    throw new Error(
      `Application runtime gate FAILED: ${failed.map((f) => f.id).join(", ")}`,
    );
  }
}
