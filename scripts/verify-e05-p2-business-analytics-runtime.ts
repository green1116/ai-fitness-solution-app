/**
 * E05-P2 — Business Analytics Runtime verification
 * Analytics layer above E05 Intelligence Foundation
 */
import fs from "node:fs";
import path from "node:path";
import { createHash } from "node:crypto";

import { buildBusinessAgentFoundation } from "../lib/business-agent/e04/core/business-agent.lifecycle";
import {
  E04_BUSINESS_AGENT_PLATFORM_ID,
  E04_BUSINESS_AGENT_VERSION,
} from "../lib/business-agent/e04/core/business-agent.constants";
import {
  assertIntelligenceFoundationPass,
  buildIntelligenceFoundation,
  E05_INTELLIGENCE_BASE,
  E05_INTELLIGENCE_PLATFORM_ID,
  E05_INTELLIGENCE_VERSION,
} from "../lib/intelligence/e05";
import {
  E05_ANALYTICS_BASE,
  E05_ANALYTICS_RUNTIME_ID,
  E05_ANALYTICS_VERSION,
  ANALYTICS_INSTANCE_PHASES,
  METRIC_KINDS,
} from "../lib/intelligence/e05/analytics/analytics.constants";
import {
  ANALYTICS_CATALOG,
  buildAnalyticsRegistryManifest,
  getAnalyticsById,
  listRequiredAnalytics,
} from "../lib/intelligence/e05/analytics/analytics.registry";
import {
  calculateMetric,
  calculateMetrics,
  getMetricById,
  METRIC_CATALOG,
} from "../lib/intelligence/e05/analytics/analytics.metric";
import { executeAnalyticsOrThrow } from "../lib/intelligence/e05/analytics/analytics.engine";
import {
  appendAnalyticsTraceEvent,
  createAnalyticsRuntimeTrace,
} from "../lib/intelligence/e05/analytics/analytics.trace";

const ROOT = path.resolve(__dirname, "..");

const FROZEN_E05_P1 = [
  "lib/intelligence/e05/core/intelligence.types.ts",
  "lib/intelligence/e05/core/intelligence.constants.ts",
  "lib/intelligence/e05/core/intelligence.lifecycle.ts",
  "lib/intelligence/e05/core/intelligence.registry.ts",
  "lib/intelligence/e05/runtime/intelligence.context.ts",
  "lib/intelligence/e05/runtime/intelligence.executor.ts",
  "lib/intelligence/e05/insight/insight.types.ts",
  "lib/intelligence/e05/insight/insight.registry.ts",
  "lib/intelligence/e05/index.ts",
] as const;

const FROZEN_E04 = [
  "lib/business-agent/e04/core/business-agent.types.ts",
  "lib/business-agent/e04/core/business-agent.constants.ts",
  "lib/business-agent/e04/core/business-agent.registry.ts",
  "lib/business-agent/e04/core/business-agent.lifecycle.ts",
  "lib/business-agent/e04/runtime/business-agent.executor.ts",
  "lib/business-agent/e04/index.ts",
] as const;

const FROZEN_E03 = [
  "lib/agent-platform/e03/core/agent.types.ts",
  "lib/agent-platform/e03/core/agent.constants.ts",
  "lib/agent-platform/e03/core/agent.registry.ts",
  "lib/agent-platform/e03/core/agent.lifecycle.ts",
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
    "lib/intelligence/e05/analytics/analytics.types.ts",
    "lib/intelligence/e05/analytics/analytics.constants.ts",
    "lib/intelligence/e05/analytics/analytics.registry.ts",
    "lib/intelligence/e05/analytics/analytics.engine.ts",
    "lib/intelligence/e05/analytics/analytics.metric.ts",
    "lib/intelligence/e05/analytics/analytics.trace.ts",
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
  const e04 = buildBusinessAgentFoundation();
  check(e04.ready === true, "E04 ready");
  check(e04.platformId === E04_BUSINESS_AGENT_PLATFORM_ID, "E04 id");

  const e05 = buildIntelligenceFoundation();
  check(e05.ready === true, "E05 P1 ready");
  check(e05.platformId === E05_INTELLIGENCE_PLATFORM_ID, "E05 id");
  check(e05.version === E05_INTELLIGENCE_VERSION, "E05 version");
  assertIntelligenceFoundationPass(e05);

  check(
    E05_ANALYTICS_BASE === "enterprise-e05-p1-intelligence-foundation-v1",
    "analytics base",
  );
  check(
    E05_INTELLIGENCE_BASE ===
      "enterprise-e04-business-agent-platform-freeze-v1",
    "E05 base intact",
  );
  console.log("✓ E03 + E04 + E05 P1 unmodified / bases intact");
}

function testRegistryAndMetrics() {
  check(ANALYTICS_INSTANCE_PHASES.length === 4, "phases");
  check(METRIC_KINDS.length === 5, "metric kinds");
  check(ANALYTICS_CATALOG.length === 6, "analytics catalog");
  check(METRIC_CATALOG.length === 6, "metric catalog");
  check(listRequiredAnalytics().length === 5, "required analytics");

  const manifest = buildAnalyticsRegistryManifest();
  check(manifest.catalogComplete === true, "catalog complete");
  check(manifest.runtimeId === E05_ANALYTICS_RUNTIME_ID, "runtime id");
  check(manifest.version === E05_ANALYTICS_VERSION, "version");
  check(manifest.base === E05_ANALYTICS_BASE, "base");

  const score = getMetricById("e05.metric.opportunity-score");
  check(Boolean(score), "opportunity metric");
  const calculated = calculateMetric(score!, { opportunityScore: 88 });
  check(calculated.value === 88, "score calc");

  const metrics = calculateMetrics(
    ["e05.metric.risk-index", "e05.metric.pricing-band"],
    { riskIndex: 42, pricingBand: 3 },
  );
  check(metrics.length === 2, "multi metric");

  console.log("✓ registry + metrics");
}

function testEngineAndTrace() {
  const trace = createAnalyticsRuntimeTrace({
    instanceId: "inst_x",
    analyticsId: "e05.analytics.opportunity",
    taskId: "task_x",
  });
  const withEvent = appendAnalyticsTraceEvent(trace, "ready", "boot");
  check(withEvent.eventCount === 1, "trace event");

  const opportunity = getAnalyticsById("e05.analytics.opportunity");
  check(Boolean(opportunity), "opportunity analytics");

  const run = executeAnalyticsOrThrow(opportunity!, {
    input: {
      goal: "星河科技园健身中心招采分析",
      opportunityScore: 82,
      projectHint: "星河科技园企业健身中心",
    },
    metadata: { source: "verify-e05-p2" },
  });

  check(run.result.success === true, "execute success");
  check(run.result.status === "result", "status result");
  check(run.result.metrics.length === 1, "metrics");
  check(run.result.metrics[0]!.value === 82, "metric value");
  check(run.result.insightOutput.intelligenceId === "e05.intel.opportunity", "intel");
  check(run.trace.eventCount >= 4, "trace events");
  check(run.result.traceId === run.trace.traceId, "trace linked");

  for (const item of listRequiredAnalytics()) {
    const bundle = executeAnalyticsOrThrow(item, {
      input: {
        goal: `probe:${item.id}`,
        opportunityScore: 70,
        riskIndex: 35,
        pricingBand: 3,
        complianceRatio: 0.9,
        milestoneCount: 5,
        synthesisIndex: 78,
      },
    });
    check(bundle.result.success === true, `${item.id} success`);
  }

  console.log("✓ analytics engine → intelligence bridge");
}

function main() {
  console.log("E05-P2 — Business Analytics Runtime Verification\n");

  const baseline: Record<string, string> = {};
  for (const rel of [...FROZEN_E05_P1, ...FROZEN_E04, ...FROZEN_E03]) {
    baseline[rel] = sha1(rel);
  }

  checkModules();
  checkFrozen("E05 P1", FROZEN_E05_P1, baseline);
  checkFrozen("E04", FROZEN_E04, baseline);
  checkFrozen("E03", FROZEN_E03, baseline);
  checkBasesIntact();
  testRegistryAndMetrics();
  testEngineAndTrace();
  checkFrozen("E05 P1", FROZEN_E05_P1, baseline);
  checkFrozen("E04", FROZEN_E04, baseline);
  checkFrozen("E03", FROZEN_E03, baseline);
  checkBasesIntact();

  console.log("\nPASS — E05 P2 business analytics runtime");
}

main();
