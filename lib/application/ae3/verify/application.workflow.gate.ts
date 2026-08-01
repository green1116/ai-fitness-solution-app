/**
 * AE-3 — Application Workflow verification gate.
 * Nests AE-2 runtime; workflow catalogue / policy only.
 */
import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";

import { AE2_RUNTIME_ID } from "../../ae2/application.runtime";
import { runApplicationRuntimeGate } from "../../ae2/verify/application.runtime.gate";
import {
  resolveApplicationWorkflowPlan,
} from "../application.workflow";
import {
  AE3_BASE_FREEZE_REF,
  AE3_MODULE_PATH,
  AE3_NON_GOALS,
  AE3_PACKAGE_ID,
  AE3_RUNTIME_REF,
  AE3_WORKFLOW_GATE,
  AE3_WORKFLOW_ID,
  APPLICATION_WORKFLOW_DEFINITION,
} from "../workflow.definition";
import {
  AE3_POLICY_ID,
  AE3_POLICY_INVARIANT_IDS,
  APPLICATION_WORKFLOW_POLICY,
} from "../workflow.policy";
import {
  AE3_WORKFLOW_FAMILY_IDS,
  AE3_WORKFLOW_REGISTRY,
} from "../workflow.registry";
import {
  AE3_STAGE_CHAIN,
  AE3_WORKFLOW_STAGE_IDS,
  AE3_WORKFLOW_STAGES,
} from "../workflow.stage";
import {
  AE3_TRANSITION_IDS,
  AE3_WORKFLOW_TRANSITIONS,
} from "../workflow.transition";

export type ApplicationWorkflowCheck = Readonly<{
  id: string;
  source: "AE-2" | "AE-3";
  title: string;
  status: "PASS" | "FAIL";
  evidence: string;
}>;

export type ApplicationWorkflowReport = Readonly<{
  layer: "AE-3";
  workflowId: typeof AE3_WORKFLOW_ID;
  gateId: typeof AE3_WORKFLOW_GATE;
  baseFreezeRef: typeof AE3_BASE_FREEZE_REF;
  passed: boolean;
  checks: readonly ApplicationWorkflowCheck[];
  summary: Readonly<{
    families: number;
    stages: number;
    transitions: number;
    invariants: number;
    runtimePassed: boolean;
    tscPassed: boolean;
  }>;
}>;

function check(
  id: string,
  source: ApplicationWorkflowCheck["source"],
  title: string,
  ok: boolean,
  evidence: string,
): ApplicationWorkflowCheck {
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

export function runApplicationWorkflowGate(
  rootDir?: string,
): ApplicationWorkflowReport {
  const root = resolveRoot(rootDir);
  const checks: ApplicationWorkflowCheck[] = [];

  const runtime = runApplicationRuntimeGate(root);
  checks.push(
    check(
      "AE3-AE2",
      "AE-2",
      "AE-2 application runtime intact for workflow",
      runtime.passed &&
        runtime.runtimeId === AE2_RUNTIME_ID &&
        AE3_RUNTIME_REF === AE2_RUNTIME_ID,
      `runtime=${runtime.runtimeId} states=${runtime.summary.states}`,
    ),
  );

  checks.push(
    check(
      "AE3-IDS",
      "AE-3",
      "Application workflow IDs locked to AE-3 / AE-2 base",
      AE3_WORKFLOW_ID === "application-workflow-ae3-v1" &&
        AE3_WORKFLOW_GATE === "application-workflow-ae3-gate" &&
        AE3_PACKAGE_ID === "AE-3" &&
        AE3_BASE_FREEZE_REF === "ae-2-application-runtime-v1" &&
        APPLICATION_WORKFLOW_DEFINITION.baseFreezeRef === AE3_BASE_FREEZE_REF,
      `${AE3_WORKFLOW_ID} / base=${AE3_BASE_FREEZE_REF}`,
    ),
  );

  const plan = resolveApplicationWorkflowPlan("BIND");
  checks.push(
    check(
      "AE3-REUSE",
      "AE-3",
      "Workflow reuses AE-2 runtime plan",
      plan.matchesRuntime &&
        plan.workflowOnly &&
        plan.definition.runtimeRef === AE2_RUNTIME_ID,
      `stage=${plan.stageId} families=${plan.registry.length}`,
    ),
  );

  const transitionsValid = AE3_WORKFLOW_TRANSITIONS.every(
    (t) =>
      (AE3_WORKFLOW_STAGE_IDS as readonly string[]).includes(t.from) &&
      (AE3_WORKFLOW_STAGE_IDS as readonly string[]).includes(t.to),
  );
  checks.push(
    check(
      "AE3-CATALOGUE",
      "AE-3",
      "Workflow registry / stage / transition catalogues locked",
      AE3_WORKFLOW_REGISTRY.length === AE3_WORKFLOW_FAMILY_IDS.length &&
        AE3_WORKFLOW_FAMILY_IDS.length === 3 &&
        AE3_WORKFLOW_STAGES.length === AE3_WORKFLOW_STAGE_IDS.length &&
        AE3_WORKFLOW_STAGE_IDS.length === 7 &&
        AE3_WORKFLOW_TRANSITIONS.length === AE3_TRANSITION_IDS.length &&
        AE3_TRANSITION_IDS.length === 7 &&
        transitionsValid &&
        AE3_STAGE_CHAIN ===
          "REGISTER→COMPOSE→BIND→ACTIVATE→IDLE→HOLD→CLOSE" &&
        plan.stageId === "BIND",
      `families=${AE3_WORKFLOW_REGISTRY.length} stages=${AE3_WORKFLOW_STAGES.length} transitions=${AE3_WORKFLOW_TRANSITIONS.length}`,
    ),
  );

  checks.push(
    check(
      "AE3-POLICY",
      "AE-3",
      "Workflow policy: no business / integration / deployment / UI",
      APPLICATION_WORKFLOW_POLICY.policyId === AE3_POLICY_ID &&
        AE3_POLICY_INVARIANT_IDS.length === 8 &&
        APPLICATION_WORKFLOW_POLICY.hasBusinessLogic === false &&
        APPLICATION_WORKFLOW_POLICY.hasIntegration === false &&
        APPLICATION_WORKFLOW_POLICY.hasDeployment === false &&
        APPLICATION_WORKFLOW_POLICY.hasUi === false &&
        AE3_NON_GOALS.includes("business-logic") &&
        AE3_NON_GOALS.includes("integration") &&
        AE3_NON_GOALS.includes("deployment") &&
        AE3_NON_GOALS.includes("ui"),
      `invariants=${AE3_POLICY_INVARIANT_IDS.length}`,
    ),
  );

  const ae3Root = path.join(root, AE3_MODULE_PATH);
  const forbiddenTrees = [
    "integration",
    "deployment",
    "business",
    "ui",
    "engines",
    "new-architecture",
  ].filter((name) => fs.existsSync(path.join(ae3Root, name)));
  checks.push(
    check(
      "AE3-NO-ARCH",
      "AE-3",
      "No integration / deployment / UI / new architecture under AE-3",
      forbiddenTrees.length === 0 &&
        fs.existsSync(path.join(ae3Root, "application.workflow.ts")) &&
        fs.existsSync(path.join(ae3Root, "workflow.definition.ts")) &&
        fs.existsSync(path.join(ae3Root, "workflow.registry.ts")) &&
        fs.existsSync(path.join(ae3Root, "workflow.stage.ts")) &&
        fs.existsSync(path.join(ae3Root, "workflow.transition.ts")) &&
        fs.existsSync(path.join(ae3Root, "workflow.policy.ts")) &&
        fs.existsSync(path.join(ae3Root, "index.ts")) &&
        fs.existsSync(
          path.join(ae3Root, "verify/application.workflow.gate.ts"),
        ),
      forbiddenTrees.length
        ? forbiddenTrees.join(",")
        : `tree=${AE3_MODULE_PATH}`,
    ),
  );

  const ae3Files = listTsFiles(ae3Root);
  const coupleHits = ae3Files.filter((file) => {
    const text = fs.readFileSync(file, "utf8");
    return /from\s+["']@\/lib\/(frontend|backend|data|integration|delivery|implementation|closure|product)|from\s+["'][^"']*lib\/(frontend|backend|data|integration|delivery|implementation|closure|product)/.test(
      text,
    );
  });
  checks.push(
    check(
      "AE3-NO-COUPLE",
      "AE-3",
      "No cross-layer coupling outside AE-2 reuse",
      coupleHits.length === 0,
      coupleHits.length
        ? coupleHits.map((f) => path.relative(root, f)).join(",")
        : `scanned=${ae3Files.length}`,
    ),
  );

  checks.push(
    check(
      "AE3-NO-REDESIGN",
      "AE-3",
      "No AE-2 / upstream redesign",
      AE3_RUNTIME_REF === "application-runtime-ae2-v1" &&
        plan.baseFreezeRef === "ae-2-application-runtime-v1",
      `runtimeRef=${AE3_RUNTIME_REF}`,
    ),
  );

  const tscFiles = [
    ...listTsFiles(path.join(root, "lib/application/ae1")),
    ...listTsFiles(path.join(root, "lib/application/ae2")),
    ...ae3Files,
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
      "AE3-TSC",
      "AE-3",
      "TypeScript check passes for AE-1…AE-3 trees",
      tscPassed,
      tscPassed
        ? `files=${tscFiles.length}`
        : (tsc.stdout || tsc.stderr || "tsc failed").slice(0, 500),
    ),
  );

  const passed = checks.every((c) => c.status === "PASS");
  return {
    layer: "AE-3",
    workflowId: AE3_WORKFLOW_ID,
    gateId: AE3_WORKFLOW_GATE,
    baseFreezeRef: AE3_BASE_FREEZE_REF,
    passed,
    checks,
    summary: {
      families: AE3_WORKFLOW_REGISTRY.length,
      stages: AE3_WORKFLOW_STAGES.length,
      transitions: AE3_WORKFLOW_TRANSITIONS.length,
      invariants: AE3_POLICY_INVARIANT_IDS.length,
      runtimePassed: runtime.passed,
      tscPassed,
    },
  };
}

export function assertApplicationWorkflowGate(
  report: ApplicationWorkflowReport = runApplicationWorkflowGate(),
): void {
  if (!report.passed) {
    const failed = report.checks.filter((c) => c.status === "FAIL");
    throw new Error(
      `Application workflow gate FAILED: ${failed.map((f) => f.id).join(", ")}`,
    );
  }
}
