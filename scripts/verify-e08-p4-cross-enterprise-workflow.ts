/**
 * E08-P4 — Cross Enterprise Workflow verification
 * Workflow layer above E08 AI Partner Exchange
 */
import fs from "node:fs";
import path from "node:path";
import { createHash } from "node:crypto";

import {
  buildEcosystemFoundation,
  E08_ECOSYSTEM_PLATFORM_ID,
} from "../lib/ecosystem/e08";
import { buildNetworkRegistryManifest } from "../lib/ecosystem/e08/network/network.registry";
import { buildExchangeRegistryManifest } from "../lib/ecosystem/e08/exchange/exchange.registry";
import { E08_EXCHANGE_BASE } from "../lib/ecosystem/e08/exchange/exchange.constants";
import {
  E08_WORKFLOW_BASE,
  E08_WORKFLOW_ID,
  E08_WORKFLOW_VERSION,
  WORKFLOW_INSTANCE_PHASES,
  WORKFLOW_KINDS,
  WORKFLOW_TRACE_EVENT_KINDS,
} from "../lib/ecosystem/e08/workflow/workflow.constants";
import {
  buildWorkflowRegistryManifest,
  getWorkflowById,
  getWorkflowByKind,
  listWorkflowsForListing,
  WORKFLOW_CATALOG,
} from "../lib/ecosystem/e08/workflow/workflow.registry";
import { planWorkflow } from "../lib/ecosystem/e08/workflow/workflow.planner";
import {
  executeWorkflow,
  executeWorkflowOrThrow,
} from "../lib/ecosystem/e08/workflow/workflow.executor";

const ROOT = path.resolve(__dirname, "..");

const FROZEN_E08_P1_P3 = [
  "lib/ecosystem/e08/core/ecosystem.types.ts",
  "lib/ecosystem/e08/core/ecosystem.constants.ts",
  "lib/ecosystem/e08/core/ecosystem.lifecycle.ts",
  "lib/ecosystem/e08/core/ecosystem.registry.ts",
  "lib/ecosystem/e08/runtime/ecosystem.context.ts",
  "lib/ecosystem/e08/runtime/ecosystem.executor.ts",
  "lib/ecosystem/e08/relationship/relationship.types.ts",
  "lib/ecosystem/e08/relationship/relationship.registry.ts",
  "lib/ecosystem/e08/index.ts",
  "lib/ecosystem/e08/network/network.types.ts",
  "lib/ecosystem/e08/network/network.constants.ts",
  "lib/ecosystem/e08/network/network.registry.ts",
  "lib/ecosystem/e08/network/network.graph.ts",
  "lib/ecosystem/e08/network/network.executor.ts",
  "lib/ecosystem/e08/network/network.trace.ts",
  "lib/ecosystem/e08/exchange/exchange.types.ts",
  "lib/ecosystem/e08/exchange/exchange.constants.ts",
  "lib/ecosystem/e08/exchange/exchange.registry.ts",
  "lib/ecosystem/e08/exchange/exchange.catalog.ts",
  "lib/ecosystem/e08/exchange/exchange.matcher.ts",
  "lib/ecosystem/e08/exchange/exchange.trace.ts",
] as const;

const FROZEN_UPSTREAM = [
  "lib/workforce/e07/core/workforce.registry.ts",
  "lib/workforce/e07/runtime/workforce.executor.ts",
  "lib/workforce/e07/index.ts",
  "lib/autonomous/e06/core/operation.registry.ts",
  "lib/autonomous/e06/runtime/operation.executor.ts",
  "lib/intelligence/e05/core/intelligence.registry.ts",
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
    "lib/ecosystem/e08/workflow/workflow.types.ts",
    "lib/ecosystem/e08/workflow/workflow.constants.ts",
    "lib/ecosystem/e08/workflow/workflow.registry.ts",
    "lib/ecosystem/e08/workflow/workflow.planner.ts",
    "lib/ecosystem/e08/workflow/workflow.executor.ts",
    "lib/ecosystem/e08/workflow/workflow.trace.ts",
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
  const foundation = buildEcosystemFoundation();
  check(foundation.ready === true, "E08-P1 foundation still ready");
  check(
    foundation.platformId === E08_ECOSYSTEM_PLATFORM_ID,
    "E08-P1 platform id intact",
  );
  check(
    buildNetworkRegistryManifest().catalogComplete === true,
    "E08-P2 networks still complete",
  );
  check(
    buildExchangeRegistryManifest().catalogComplete === true,
    "E08-P3 exchange still complete",
  );
  check(
    E08_EXCHANGE_BASE === "enterprise-e08-p2-multi-organization-network-v1",
    "E08-P3 base constant",
  );
  check(
    E08_WORKFLOW_BASE === "enterprise-e08-p3-ai-partner-exchange-v1",
    "E08-P4 base constant",
  );
  console.log("✓ upstream + E08-P1/P2/P3 unmodified / bases intact");
}

function testRegistryAndPlanner() {
  check(WORKFLOW_KINDS.length === 3, "workflow kinds");
  check(WORKFLOW_INSTANCE_PHASES.length === 4, "instance phases");
  check(WORKFLOW_TRACE_EVENT_KINDS.length === 6, "trace event kinds");
  check(WORKFLOW_CATALOG.length === 3, "workflows");

  const manifest = buildWorkflowRegistryManifest();
  check(manifest.catalogComplete === true, "workflow catalog complete");
  check(manifest.workflowId === E08_WORKFLOW_ID, "workflow id");
  check(manifest.version === E08_WORKFLOW_VERSION, "version");
  check(manifest.base === E08_WORKFLOW_BASE, "base e08-p3");
  check(manifest.kinds.length === 3, "kinds covered");

  check(
    getWorkflowByKind("fulfill")?.id === "e08.workflow.supply-fulfill",
    "by kind",
  );
  check(
    listWorkflowsForListing("e08.exchange.supply-capability").length === 3,
    "workflows for listing",
  );

  const handoff = getWorkflowById("e08.workflow.enterprise-handoff")!;
  const plan = planWorkflow(handoff);
  check(plan.stepCount === 3, "handoff plan steps");
  check(plan.steps[0].exchangeCategory === "supply", "first supply");
  check(plan.steps[1].exchangeCategory === "distribution", "second distribution");
  check(plan.steps[2].exchangeCategory === "governance", "third governance");
  check(
    plan.steps.every((s, i) => s.order === i + 1),
    "step order",
  );
  check(plan.narrative.includes("3 partner exchanges"), "narrative");
  console.log("✓ workflow registry + planner");
  console.log(plan.narrative);
}

function testExecutor() {
  const fulfill = getWorkflowById("e08.workflow.supply-fulfill")!;

  const run = executeWorkflowOrThrow(fulfill, {
    input: {
      goal: "星河科技园健身中心跨企业供应履约工作流",
      projectHint: "星河科技园企业健身中心",
      ready: true,
      riskScore: 10,
    },
    metadata: { source: "verify-e08-p4" },
  });

  check(run.result.success === true, "execute success");
  check(run.result.status === "result", "status result");
  check(run.result.completedSteps === 1, "all steps completed");
  check(
    run.result.stepResults.every((s) => s.success && s.status === "result"),
    "step results",
  );
  check(run.result.output.kind === "fulfill", "output kind");
  check(
    run.result.exchangedListings[0] === "e08.exchange.supply-capability",
    "exchanged listing",
  );

  check(run.trace.eventCount >= 5, "trace events recorded");
  for (const kind of ["plan", "step", "exchange", "result"]) {
    check(
      run.trace.events.some((e) => e.kind === kind),
      `${kind} trace event`,
    );
  }
  check(Boolean(run.trace.finishedAt), "trace finished");

  for (const workflow of WORKFLOW_CATALOG) {
    const bundle = executeWorkflowOrThrow(workflow, {
      input: {
        goal: `probe:${workflow.kind}`,
        ready: true,
        riskScore: 10,
      },
    });
    check(bundle.result.success === true, `${workflow.id} success`);
    check(
      bundle.result.completedSteps === workflow.listingIds.length,
      `${workflow.id} steps`,
    );
  }

  const blocked = executeWorkflow(fulfill, {
    input: { goal: "blocked probe", unsafe: true },
  });
  check(blocked.result.success === false, "blocked not success");
  check(blocked.result.status === "blocked", "blocked status");
  check(blocked.result.completedSteps === 0, "no steps completed");
  check(
    blocked.trace.events.some((e) => e.kind === "error"),
    "blocked trace error",
  );

  const broken = executeWorkflow({
    ...fulfill,
    listingIds: ["e08.exchange.missing"],
  });
  check(broken.result.success === false, "broken binding not success");
  check(broken.result.status === "failed", "broken binding failed");

  console.log("✓ workflow executor → E08 partner exchange bridge");
}

function main() {
  console.log("E08-P4 — Cross Enterprise Workflow Verification\n");

  const frozen = [...FROZEN_E08_P1_P3, ...FROZEN_UPSTREAM];
  const baseline: Record<string, string> = {};
  for (const rel of frozen) {
    baseline[rel] = sha1(rel);
  }

  checkModules();
  checkFrozen("E08-P1/P2/P3", FROZEN_E08_P1_P3, baseline);
  checkFrozen("upstream", FROZEN_UPSTREAM, baseline);
  checkBasesIntact();
  testRegistryAndPlanner();
  testExecutor();
  checkFrozen("E08-P1/P2/P3", FROZEN_E08_P1_P3, baseline);
  checkFrozen("upstream", FROZEN_UPSTREAM, baseline);
  checkBasesIntact();

  console.log("\nPASS — E08 P4 cross enterprise workflow");
}

main();
