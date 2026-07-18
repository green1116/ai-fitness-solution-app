/**
 * E07-P5 — Human-AI Collaboration verification
 * Human + AI workforce collaboration above orchestration
 */
import fs from "node:fs";
import path from "node:path";
import { createHash } from "node:crypto";

import {
  buildWorkforceFoundation,
  E07_WORKFORCE_PLATFORM_ID,
} from "../lib/workforce/e07";
import { buildEmployeeRegistryManifest } from "../lib/workforce/e07/employee/employee.registry";
import { buildRoleRegistryManifest } from "../lib/workforce/e07/marketplace/role.registry";
import { buildOrchestrationRegistryManifest } from "../lib/workforce/e07/orchestration/orchestration.registry";
import { E07_ORCHESTRATION_BASE } from "../lib/workforce/e07/orchestration/orchestration.constants";
import {
  COLLABORATION_MODES,
  COLLABORATION_SESSION_PHASES,
  COLLABORATION_TRACE_EVENT_KINDS,
  E07_COLLABORATION_BASE,
  E07_COLLABORATION_ID,
  E07_COLLABORATION_VERSION,
  HUMAN_DECISIONS,
  HUMAN_REQUEST_STATUSES,
} from "../lib/workforce/e07/collaboration/collaboration.constants";
import {
  buildCollaborationRegistryManifest,
  COLLABORATION_CATALOG,
  getCollaborationById,
  getCollaborationByMode,
} from "../lib/workforce/e07/collaboration/collaboration.registry";
import {
  createHumanCollaborationRequest,
  decideHumanCollaborationRequest,
  isHumanDecisionAllowingRun,
} from "../lib/workforce/e07/collaboration/collaboration.request";
import {
  executeCollaboration,
  executeCollaborationOrThrow,
} from "../lib/workforce/e07/collaboration/collaboration.executor";

const ROOT = path.resolve(__dirname, "..");

const FROZEN_E07_P1_P4 = [
  "lib/workforce/e07/core/workforce.registry.ts",
  "lib/workforce/e07/runtime/workforce.executor.ts",
  "lib/workforce/e07/skill/skill.registry.ts",
  "lib/workforce/e07/index.ts",
  "lib/workforce/e07/employee/employee.registry.ts",
  "lib/workforce/e07/employee/employee.executor.ts",
  "lib/workforce/e07/marketplace/role.registry.ts",
  "lib/workforce/e07/marketplace/role.deployer.ts",
  "lib/workforce/e07/orchestration/orchestration.types.ts",
  "lib/workforce/e07/orchestration/orchestration.constants.ts",
  "lib/workforce/e07/orchestration/orchestration.registry.ts",
  "lib/workforce/e07/orchestration/orchestration.planner.ts",
  "lib/workforce/e07/orchestration/orchestration.executor.ts",
  "lib/workforce/e07/orchestration/orchestration.trace.ts",
] as const;

const FROZEN_UPSTREAM = [
  "lib/autonomous/e06/core/operation.registry.ts",
  "lib/autonomous/e06/runtime/operation.executor.ts",
  "lib/autonomous/e06/index.ts",
  "lib/intelligence/e05/core/intelligence.registry.ts",
  "lib/intelligence/e05/runtime/intelligence.executor.ts",
  "lib/business-agent/e04/core/business-agent.registry.ts",
  "lib/agent-platform/e03/core/agent.registry.ts",
] as const;

function check(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function sha1(rel: string): string {
  return createHash("sha1")
    .update(fs.readFileSync(path.join(ROOT, rel)))
    .digest("hex");
}

function checkModules() {
  const required = [
    "lib/workforce/e07/collaboration/collaboration.types.ts",
    "lib/workforce/e07/collaboration/collaboration.constants.ts",
    "lib/workforce/e07/collaboration/collaboration.registry.ts",
    "lib/workforce/e07/collaboration/collaboration.request.ts",
    "lib/workforce/e07/collaboration/collaboration.executor.ts",
    "lib/workforce/e07/collaboration/collaboration.trace.ts",
  ];
  for (const rel of required) {
    check(fs.existsSync(path.join(ROOT, rel)), `missing: ${rel}`);
  }
  console.log("✓ module structure");
}

function checkFrozen(
  label: string,
  files: readonly string[],
  baseline: Record<string, string>,
) {
  for (const rel of files) {
    check(sha1(rel) === baseline[rel], `${label} modified: ${rel}`);
  }
}

function checkBasesIntact() {
  const foundation = buildWorkforceFoundation();
  check(foundation.ready === true, "E07-P1 foundation still ready");
  check(
    foundation.platformId === E07_WORKFORCE_PLATFORM_ID,
    "E07-P1 platform id intact",
  );
  check(
    buildEmployeeRegistryManifest().catalogComplete === true,
    "E07-P2 employees still complete",
  );
  check(
    buildRoleRegistryManifest().catalogComplete === true,
    "E07-P3 roles still complete",
  );
  check(
    buildOrchestrationRegistryManifest().catalogComplete === true,
    "E07-P4 orchestrations still complete",
  );
  check(
    E07_ORCHESTRATION_BASE === "enterprise-e07-p3-role-agent-marketplace-v1",
    "E07-P4 base constant",
  );
  check(
    E07_COLLABORATION_BASE === "enterprise-e07-p4-workforce-orchestration-v1",
    "E07-P5 base constant",
  );
  console.log("✓ upstream + E07-P1..P4 unmodified / bases intact");
}

function testRegistryAndRequest() {
  check(COLLABORATION_MODES.length === 3, "collaboration modes");
  check(HUMAN_DECISIONS.length === 3, "human decisions");
  check(HUMAN_REQUEST_STATUSES.length === 3, "request statuses");
  check(COLLABORATION_SESSION_PHASES.length === 4, "session phases");
  check(COLLABORATION_TRACE_EVENT_KINDS.length === 6, "trace event kinds");
  check(COLLABORATION_CATALOG.length === 3, "collaborations");

  const manifest = buildCollaborationRegistryManifest();
  check(manifest.catalogComplete === true, "collaboration catalog complete");
  check(manifest.collaborationId === E07_COLLABORATION_ID, "collaboration id");
  check(manifest.version === E07_COLLABORATION_VERSION, "version");
  check(manifest.base === E07_COLLABORATION_BASE, "base e07-p4");
  check(manifest.modes.length === 3, "modes covered");

  check(
    getCollaborationByMode("review")?.id === "e07.collab.campaign-review",
    "by mode",
  );
  check(
    getCollaborationById("e07.collab.guardrail-approve")?.orchestrationId ===
      "e07.orch.risk-guardrail",
    "by id",
  );

  const review = getCollaborationById("e07.collab.campaign-review")!;
  const pending = createHumanCollaborationRequest(review);
  check(pending.status === "pending", "request pending");
  check(pending.humanRole === "commercial-lead", "human role");
  check(!pending.decision, "no decision yet");

  const decided = decideHumanCollaborationRequest(pending, "approve", "ok");
  check(decided.status === "decided", "request decided");
  check(decided.decision === "approve", "decision approve");
  check(isHumanDecisionAllowingRun(decided.decision), "allowing run");
  check(!isHumanDecisionAllowingRun("reject"), "reject not allowing");

  let threw = false;
  try {
    decideHumanCollaborationRequest(decided, "reject");
  } catch (error) {
    threw = error instanceof Error && error.message.includes("not pending");
  }
  check(threw, "re-decide rejected");

  console.log("✓ collaboration registry + request");
}

function testExecutor() {
  const review = getCollaborationById("e07.collab.campaign-review")!;

  const run = executeCollaborationOrThrow(review, {
    humanDecision: "approve",
    humanNote: "approved for verify",
    input: {
      goal: "星河科技园健身中心人机协作",
      projectHint: "星河科技园企业健身中心",
      ready: true,
      riskScore: 10,
    },
    metadata: { source: "verify-e07-p5" },
  });

  check(run.result.success === true, "execute success");
  check(run.result.status === "result", "status result");
  check(run.result.request.decision === "approve", "request approved");
  check(run.result.orchestration?.success === true, "orchestration success");
  check(run.result.orchestration?.completedSteps === 2, "orch steps");
  check(run.result.output.humanRole === "commercial-lead", "output role");

  check(run.trace.eventCount >= 5, "trace events recorded");
  for (const kind of ["request", "decision", "orchestrate", "result"]) {
    check(
      run.trace.events.some((e) => e.kind === kind),
      `${kind} trace event`,
    );
  }
  check(Boolean(run.trace.finishedAt), "trace finished");

  for (const collaboration of COLLABORATION_CATALOG) {
    const bundle = executeCollaborationOrThrow(collaboration, {
      humanDecision: "approve",
      input: {
        goal: `probe:${collaboration.mode}`,
        ready: true,
        riskScore: 10,
      },
    });
    check(bundle.result.success === true, `${collaboration.id} success`);
  }

  const rejected = executeCollaboration(review, {
    humanDecision: "reject",
    input: { goal: "reject probe", ready: true },
  });
  check(rejected.result.success === false, "reject not success");
  check(rejected.result.status === "blocked", "reject blocked");
  check(rejected.result.request.decision === "reject", "reject decision");

  const deferred = executeCollaboration(review, {
    humanDecision: "defer",
    input: { goal: "defer probe", ready: true },
  });
  check(deferred.result.success === false, "defer not success");
  check(deferred.result.status === "deferred", "defer status");

  // Default without decision on requiresApproval → defer
  const autoDefer = executeCollaboration(review, {
    input: { goal: "auto defer", ready: true },
  });
  check(autoDefer.result.status === "deferred", "default defer");

  // Approved but unsafe → orchestration blocked
  const blocked = executeCollaboration(review, {
    humanDecision: "approve",
    input: { goal: "blocked probe", unsafe: true },
  });
  check(blocked.result.success === false, "unsafe not success");
  check(blocked.result.status === "blocked", "unsafe blocked");

  // Missing orchestration rejected at assert
  let threw = false;
  try {
    executeCollaboration({
      ...review,
      orchestrationId: "e07.orch.missing",
    });
  } catch (error) {
    threw =
      error instanceof Error &&
      error.message.includes("missing E07 orchestration");
  }
  check(threw, "broken collaboration rejected");

  console.log("✓ collaboration executor (request → decide → orchestrate)");
}

function main() {
  console.log("E07-P5 — Human-AI Collaboration Verification\n");

  const frozen = [...FROZEN_E07_P1_P4, ...FROZEN_UPSTREAM];
  const baseline: Record<string, string> = {};
  for (const rel of frozen) {
    baseline[rel] = sha1(rel);
  }

  checkModules();
  checkFrozen("E07-P1..P4", FROZEN_E07_P1_P4, baseline);
  checkFrozen("upstream", FROZEN_UPSTREAM, baseline);
  checkBasesIntact();
  testRegistryAndRequest();
  testExecutor();
  checkFrozen("E07-P1..P4", FROZEN_E07_P1_P4, baseline);
  checkFrozen("upstream", FROZEN_UPSTREAM, baseline);
  checkBasesIntact();

  console.log("\nPASS — E07 P5 human-AI collaboration");
}

main();
