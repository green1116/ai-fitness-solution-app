/**
 * AE-4 — Application Integration verification gate.
 * Nests AE-3 workflow; integration catalogue / policy only.
 */
import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";

import { AE3_WORKFLOW_ID } from "../../ae3/workflow.definition";
import { runApplicationWorkflowGate } from "../../ae3/verify/application.workflow.gate";
import { resolveApplicationIntegrationPlan } from "../application.integration";
import {
  AE4_BINDING_IDS,
  AE4_INTEGRATION_BINDINGS,
} from "../integration.binding";
import {
  AE4_BASE_FREEZE_REF,
  AE4_INTEGRATION_GATE,
  AE4_INTEGRATION_ID,
  AE4_MODULE_PATH,
  AE4_NON_GOALS,
  AE4_PACKAGE_ID,
  AE4_WORKFLOW_REF,
  APPLICATION_INTEGRATION_DEFINITION,
} from "../integration.definition";
import {
  AE4_ENDPOINT_IDS,
  AE4_INTEGRATION_ENDPOINTS,
} from "../integration.endpoint";
import {
  AE4_POLICY_ID,
  AE4_POLICY_INVARIANT_IDS,
  APPLICATION_INTEGRATION_POLICY,
} from "../integration.policy";
import {
  AE4_INTEGRATION_REGISTRY,
  AE4_SEAM_FAMILY_IDS,
} from "../integration.registry";

export type ApplicationIntegrationCheck = Readonly<{
  id: string;
  source: "AE-3" | "AE-4";
  title: string;
  status: "PASS" | "FAIL";
  evidence: string;
}>;

export type ApplicationIntegrationReport = Readonly<{
  layer: "AE-4";
  integrationId: typeof AE4_INTEGRATION_ID;
  gateId: typeof AE4_INTEGRATION_GATE;
  baseFreezeRef: typeof AE4_BASE_FREEZE_REF;
  passed: boolean;
  checks: readonly ApplicationIntegrationCheck[];
  summary: Readonly<{
    families: number;
    bindings: number;
    endpoints: number;
    invariants: number;
    workflowPassed: boolean;
    tscPassed: boolean;
  }>;
}>;

function check(
  id: string,
  source: ApplicationIntegrationCheck["source"],
  title: string,
  ok: boolean,
  evidence: string,
): ApplicationIntegrationCheck {
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

export function runApplicationIntegrationGate(
  rootDir?: string,
): ApplicationIntegrationReport {
  const root = resolveRoot(rootDir);
  const checks: ApplicationIntegrationCheck[] = [];

  const workflow = runApplicationWorkflowGate(root);
  checks.push(
    check(
      "AE4-AE3",
      "AE-3",
      "AE-3 application workflow intact for integration",
      workflow.passed &&
        workflow.workflowId === AE3_WORKFLOW_ID &&
        AE4_WORKFLOW_REF === AE3_WORKFLOW_ID,
      `workflow=${workflow.workflowId} stages=${workflow.summary.stages}`,
    ),
  );

  checks.push(
    check(
      "AE4-IDS",
      "AE-4",
      "Application integration IDs locked to AE-4 / AE-3 base",
      AE4_INTEGRATION_ID === "application-integration-ae4-v1" &&
        AE4_INTEGRATION_GATE === "application-integration-ae4-gate" &&
        AE4_PACKAGE_ID === "AE-4" &&
        AE4_BASE_FREEZE_REF === "ae-3-application-workflow-v1" &&
        APPLICATION_INTEGRATION_DEFINITION.baseFreezeRef ===
          AE4_BASE_FREEZE_REF,
      `${AE4_INTEGRATION_ID} / base=${AE4_BASE_FREEZE_REF}`,
    ),
  );

  const plan = resolveApplicationIntegrationPlan("B-FE-BE");
  checks.push(
    check(
      "AE4-REUSE",
      "AE-4",
      "Integration reuses AE-3 workflow plan",
      plan.matchesWorkflow &&
        plan.integrationOnly &&
        plan.definition.workflowRef === AE3_WORKFLOW_ID &&
        plan.primaryBinding.bindingId === "B-FE-BE",
      `binding=${plan.primaryBinding.bindingId} endpoints=${plan.primaryEndpoints.length}`,
    ),
  );

  const bindingsAlign = AE4_INTEGRATION_BINDINGS.every((b) =>
    AE4_INTEGRATION_REGISTRY.some((r) => r.familyId === b.familyId),
  );
  const endpointsAlign = AE4_INTEGRATION_ENDPOINTS.every((e) =>
    AE4_INTEGRATION_BINDINGS.some((b) => b.bindingId === e.bindingId),
  );
  const endpointPathsExist = AE4_INTEGRATION_ENDPOINTS.every((e) =>
    fs.existsSync(path.join(root, e.pathRef)),
  );
  checks.push(
    check(
      "AE4-CATALOGUE",
      "AE-4",
      "Integration registry / binding / endpoint catalogues locked",
      AE4_INTEGRATION_REGISTRY.length === AE4_SEAM_FAMILY_IDS.length &&
        AE4_SEAM_FAMILY_IDS.length === 6 &&
        AE4_INTEGRATION_BINDINGS.length === AE4_BINDING_IDS.length &&
        AE4_BINDING_IDS.length === 6 &&
        AE4_INTEGRATION_ENDPOINTS.length === AE4_ENDPOINT_IDS.length &&
        AE4_ENDPOINT_IDS.length === 6 &&
        bindingsAlign &&
        endpointsAlign &&
        endpointPathsExist,
      `families=${AE4_INTEGRATION_REGISTRY.length} bindings=${AE4_INTEGRATION_BINDINGS.length} endpoints=${AE4_INTEGRATION_ENDPOINTS.length}`,
    ),
  );

  checks.push(
    check(
      "AE4-POLICY",
      "AE-4",
      "Integration policy: no business / deployment / monitoring",
      APPLICATION_INTEGRATION_POLICY.policyId === AE4_POLICY_ID &&
        AE4_POLICY_INVARIANT_IDS.length === 8 &&
        APPLICATION_INTEGRATION_POLICY.hasBusinessLogic === false &&
        APPLICATION_INTEGRATION_POLICY.hasDeployment === false &&
        APPLICATION_INTEGRATION_POLICY.hasMonitoring === false &&
        AE4_NON_GOALS.includes("business-logic") &&
        AE4_NON_GOALS.includes("deployment") &&
        AE4_NON_GOALS.includes("monitoring"),
      `invariants=${AE4_POLICY_INVARIANT_IDS.length}`,
    ),
  );

  const ae4Root = path.join(root, AE4_MODULE_PATH);
  const forbiddenTrees = [
    "deployment",
    "monitoring",
    "business",
    "engines",
    "new-architecture",
  ].filter((name) => fs.existsSync(path.join(ae4Root, name)));
  checks.push(
    check(
      "AE4-NO-ARCH",
      "AE-4",
      "No deployment / monitoring / new architecture under AE-4",
      forbiddenTrees.length === 0 &&
        fs.existsSync(path.join(ae4Root, "application.integration.ts")) &&
        fs.existsSync(path.join(ae4Root, "integration.definition.ts")) &&
        fs.existsSync(path.join(ae4Root, "integration.registry.ts")) &&
        fs.existsSync(path.join(ae4Root, "integration.binding.ts")) &&
        fs.existsSync(path.join(ae4Root, "integration.endpoint.ts")) &&
        fs.existsSync(path.join(ae4Root, "integration.policy.ts")) &&
        fs.existsSync(path.join(ae4Root, "index.ts")) &&
        fs.existsSync(
          path.join(ae4Root, "verify/application.integration.gate.ts"),
        ),
      forbiddenTrees.length
        ? forbiddenTrees.join(",")
        : `tree=${AE4_MODULE_PATH}`,
    ),
  );

  const ae4Files = listTsFiles(ae4Root);
  const coupleHits = ae4Files.filter((file) => {
    const text = fs.readFileSync(file, "utf8");
    return /from\s+["']@\/lib\/(frontend|backend|data|integration|delivery|implementation|closure|product)|from\s+["'][^"']*lib\/(frontend|backend|data|integration|delivery|implementation|closure|product)/.test(
      text,
    );
  });
  checks.push(
    check(
      "AE4-NO-COUPLE",
      "AE-4",
      "No cross-layer coupling outside AE-3 reuse",
      coupleHits.length === 0,
      coupleHits.length
        ? coupleHits.map((f) => path.relative(root, f)).join(",")
        : `scanned=${ae4Files.length}`,
    ),
  );

  checks.push(
    check(
      "AE4-NO-REDESIGN",
      "AE-4",
      "No AE-3 / upstream redesign",
      AE4_WORKFLOW_REF === "application-workflow-ae3-v1" &&
        plan.baseFreezeRef === "ae-3-application-workflow-v1",
      `workflowRef=${AE4_WORKFLOW_REF}`,
    ),
  );

  const tscFiles = [
    ...listTsFiles(path.join(root, "lib/application/ae1")),
    ...listTsFiles(path.join(root, "lib/application/ae2")),
    ...listTsFiles(path.join(root, "lib/application/ae3")),
    ...ae4Files,
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
      "AE4-TSC",
      "AE-4",
      "TypeScript check passes for AE-1…AE-4 trees",
      tscPassed,
      tscPassed
        ? `files=${tscFiles.length}`
        : (tsc.stdout || tsc.stderr || "tsc failed").slice(0, 500),
    ),
  );

  const passed = checks.every((c) => c.status === "PASS");
  return {
    layer: "AE-4",
    integrationId: AE4_INTEGRATION_ID,
    gateId: AE4_INTEGRATION_GATE,
    baseFreezeRef: AE4_BASE_FREEZE_REF,
    passed,
    checks,
    summary: {
      families: AE4_INTEGRATION_REGISTRY.length,
      bindings: AE4_INTEGRATION_BINDINGS.length,
      endpoints: AE4_INTEGRATION_ENDPOINTS.length,
      invariants: AE4_POLICY_INVARIANT_IDS.length,
      workflowPassed: workflow.passed,
      tscPassed,
    },
  };
}

export function assertApplicationIntegrationGate(
  report: ApplicationIntegrationReport = runApplicationIntegrationGate(),
): void {
  if (!report.passed) {
    const failed = report.checks.filter((c) => c.status === "FAIL");
    throw new Error(
      `Application integration gate FAILED: ${failed.map((f) => f.id).join(", ")}`,
    );
  }
}
