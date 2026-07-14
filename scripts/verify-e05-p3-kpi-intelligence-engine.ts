/**
 * E05-P3 — KPI Intelligence Engine verification
 * KPI interpretation layer above analytics
 */
import fs from "node:fs";
import path from "node:path";
import { createHash } from "node:crypto";

import { buildIntelligenceFoundation } from "../lib/intelligence/e05/core/intelligence.lifecycle";
import {
  E05_INTELLIGENCE_PLATFORM_ID,
  E05_INTELLIGENCE_VERSION,
} from "../lib/intelligence/e05/core/intelligence.constants";
import { buildAnalyticsRegistryManifest } from "../lib/intelligence/e05/analytics/analytics.registry";
import {
  E05_ANALYTICS_RUNTIME_ID,
  E05_ANALYTICS_VERSION,
} from "../lib/intelligence/e05/analytics/analytics.constants";
import {
  E05_KPI_BASE,
  E05_KPI_ENGINE_ID,
  E05_KPI_VERSION,
  KPI_KINDS,
  KPI_STATUSES,
} from "../lib/intelligence/e05/kpi/kpi.constants";
import {
  KPI_CATALOG,
  buildKpiRegistryManifest,
  getKpiById,
  listRequiredKpis,
} from "../lib/intelligence/e05/kpi/kpi.registry";
import {
  evaluateKpiFromValue,
} from "../lib/intelligence/e05/kpi/kpi.evaluator";
import { executeKpiOrThrow } from "../lib/intelligence/e05/kpi/kpi.engine";
import {
  appendKpiTraceEvent,
  createKpiRuntimeTrace,
} from "../lib/intelligence/e05/kpi/kpi.trace";

const ROOT = path.resolve(__dirname, "..");

const FROZEN_E05_P1 = [
  "lib/intelligence/e05/core/intelligence.types.ts",
  "lib/intelligence/e05/core/intelligence.constants.ts",
  "lib/intelligence/e05/core/intelligence.lifecycle.ts",
  "lib/intelligence/e05/core/intelligence.registry.ts",
  "lib/intelligence/e05/runtime/intelligence.context.ts",
  "lib/intelligence/e05/runtime/intelligence.executor.ts",
  "lib/intelligence/e05/insight/insight.registry.ts",
  "lib/intelligence/e05/index.ts",
] as const;

const FROZEN_E05_P2 = [
  "lib/intelligence/e05/analytics/analytics.types.ts",
  "lib/intelligence/e05/analytics/analytics.constants.ts",
  "lib/intelligence/e05/analytics/analytics.registry.ts",
  "lib/intelligence/e05/analytics/analytics.engine.ts",
  "lib/intelligence/e05/analytics/analytics.metric.ts",
  "lib/intelligence/e05/analytics/analytics.trace.ts",
] as const;

const FROZEN_E04 = [
  "lib/business-agent/e04/core/business-agent.registry.ts",
  "lib/business-agent/e04/runtime/business-agent.executor.ts",
  "lib/business-agent/e04/index.ts",
] as const;

const FROZEN_E03 = [
  "lib/agent-platform/e03/core/agent.registry.ts",
  "lib/agent-platform/e03/runtime/agent.executor.ts",
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
    "lib/intelligence/e05/kpi/kpi.types.ts",
    "lib/intelligence/e05/kpi/kpi.constants.ts",
    "lib/intelligence/e05/kpi/kpi.registry.ts",
    "lib/intelligence/e05/kpi/kpi.engine.ts",
    "lib/intelligence/e05/kpi/kpi.evaluator.ts",
    "lib/intelligence/e05/kpi/kpi.trace.ts",
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
  const e05 = buildIntelligenceFoundation();
  check(e05.ready === true, "E05 P1 ready");
  check(e05.platformId === E05_INTELLIGENCE_PLATFORM_ID, "P1 id");
  check(e05.version === E05_INTELLIGENCE_VERSION, "P1 version");

  const analytics = buildAnalyticsRegistryManifest();
  check(analytics.catalogComplete === true, "P2 ready");
  check(analytics.runtimeId === E05_ANALYTICS_RUNTIME_ID, "P2 id");
  check(analytics.version === E05_ANALYTICS_VERSION, "P2 version");

  check(
    E05_KPI_BASE === "enterprise-e05-business-analytics-runtime-v1",
    "kpi base",
  );
  console.log("✓ E03 + E04 + E05 P1/P2 unmodified / bases intact");
}

function testRegistryAndEvaluator() {
  check(KPI_KINDS.length === 4, "kpi kinds");
  check(KPI_STATUSES.length === 4, "kpi statuses");
  check(KPI_CATALOG.length === 6, "kpi catalog");
  check(listRequiredKpis().length === 5, "required kpis");

  const manifest = buildKpiRegistryManifest();
  check(manifest.catalogComplete === true, "catalog complete");
  check(manifest.engineId === E05_KPI_ENGINE_ID, "engine id");
  check(manifest.version === E05_KPI_VERSION, "version");
  check(manifest.base === E05_KPI_BASE, "base");

  const risk = getKpiById("e05.kpi.risk");
  check(Boolean(risk), "risk kpi");
  const lowRisk = evaluateKpiFromValue(risk!, 20);
  check(lowRisk.status === "green", "low risk green");
  const highRisk = evaluateKpiFromValue(risk!, 70);
  check(highRisk.status === "red", "high risk red");

  const opp = getKpiById("e05.kpi.opportunity");
  const goodOpp = evaluateKpiFromValue(opp!, 85);
  check(goodOpp.status === "green", "good opportunity");

  console.log("✓ registry + evaluator");
}

function testEngineAndTrace() {
  const trace = createKpiRuntimeTrace({
    instanceId: "inst_x",
    kpiId: "e05.kpi.opportunity",
    taskId: "task_x",
  });
  const withEvent = appendKpiTraceEvent(trace, "ready", "boot");
  check(withEvent.eventCount === 1, "trace event");

  const opportunity = getKpiById("e05.kpi.opportunity");
  check(Boolean(opportunity), "opportunity kpi");

  const run = executeKpiOrThrow(opportunity!, {
    input: {
      goal: "星河科技园健身中心 KPI",
      opportunityScore: 88,
      projectHint: "星河科技园企业健身中心",
    },
    metadata: { source: "verify-e05-p3" },
  });

  check(run.result.success === true, "execute success");
  check(run.result.status === "result", "status result");
  check(run.result.evaluation.status === "green", "green status");
  check(run.result.evaluation.value === 88, "eval value");
  check(run.result.analyticsId === "e05.analytics.opportunity", "analytics");
  check(run.trace.eventCount >= 4, "trace events");
  check(run.result.traceId === run.trace.traceId, "trace linked");

  for (const kpi of listRequiredKpis()) {
    const bundle = executeKpiOrThrow(kpi, {
      input: {
        goal: `probe:${kpi.id}`,
        opportunityScore: 82,
        riskIndex: 25,
        pricingBand: 3,
        complianceRatio: 0.92,
        milestoneCount: 6,
        synthesisIndex: 78,
      },
    });
    check(bundle.result.success === true, `${kpi.id} success`);
    check(bundle.result.evaluation.status !== "unknown", `${kpi.id} status`);
  }

  console.log("✓ kpi engine → analytics bridge");
}

function main() {
  console.log("E05-P3 — KPI Intelligence Engine Verification\n");

  const baseline: Record<string, string> = {};
  for (const rel of [
    ...FROZEN_E05_P1,
    ...FROZEN_E05_P2,
    ...FROZEN_E04,
    ...FROZEN_E03,
  ]) {
    baseline[rel] = sha1(rel);
  }

  checkModules();
  checkFrozen("E05 P1", FROZEN_E05_P1, baseline);
  checkFrozen("E05 P2", FROZEN_E05_P2, baseline);
  checkFrozen("E04", FROZEN_E04, baseline);
  checkFrozen("E03", FROZEN_E03, baseline);
  checkBasesIntact();
  testRegistryAndEvaluator();
  testEngineAndTrace();
  checkFrozen("E05 P1", FROZEN_E05_P1, baseline);
  checkFrozen("E05 P2", FROZEN_E05_P2, baseline);
  checkFrozen("E04", FROZEN_E04, baseline);
  checkFrozen("E03", FROZEN_E03, baseline);
  checkBasesIntact();

  console.log("\nPASS — E05 P3 kpi intelligence engine");
}

main();
