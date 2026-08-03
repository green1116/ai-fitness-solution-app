/**
 * Intelligence IP-1 Baseline Freeze Gate
 * Freezes Intelligence Context → Dashboard baseline (FEAT-49…FEAT-52).
 * No feature / model / API changes — export + smoke verification only.
 */
import * as intelligence from "../lib/intelligence";
import * as postLaunch from "../lib/post-launch";

export const INTELLIGENCE_IP1_BASELINE_ID =
  "intelligence-ip1-baseline-v1" as const;

export const INTELLIGENCE_IP1_FREEZE_VERSION =
  "intelligence-ip1-freeze-1" as const;

export type GateVerdict = "PASS" | "FAIL";

export type GateCheckItem = {
  id: string;
  component: string;
  label: string;
  ok: boolean;
  detail: string;
};

export type IntelligenceIp1GateResult = {
  result: GateVerdict;
  passCount: number;
  failCount: number;
  checks: GateCheckItem[];
  summary: string;
  baselineId: typeof INTELLIGENCE_IP1_BASELINE_ID;
  freezeVersion: typeof INTELLIGENCE_IP1_FREEZE_VERSION;
};

function check(
  id: string,
  component: string,
  label: string,
  ok: boolean,
  detail: string,
): GateCheckItem {
  return { id, component, label, ok, detail };
}

function resetStacks(): void {
  intelligence.clearIntelligenceDashboard();
  intelligence.clearIntelligenceMetrics();
  intelligence.clearIntelligenceSnapshots();
  intelligence.clearIntelligenceContext();
  postLaunch.clearAutomationDashboard();
  postLaunch.clearTasks();
  postLaunch.clearWorkflows();
  postLaunch.clearCustomerAutomations();
  postLaunch.clearOptimizationDashboard();
  postLaunch.clearExpansionInsights();
  postLaunch.clearRetentionInsights();
  postLaunch.clearCustomerInsights();
  postLaunch.clearRetentionDashboard();
  postLaunch.clearExpansions();
  postLaunch.clearRenewals();
  postLaunch.clearCustomerAnalytics();
  postLaunch.clearCustomerSuccessDashboard();
  postLaunch.clearSupportCases();
  postLaunch.clearCustomerEngagements();
  postLaunch.clearCustomerHealth();
  postLaunch.clearCustomerLifecycles();
  postLaunch.clearCustomerProfiles();
  postLaunch.clearCustomers();
}

function assertExport(name: string, value: unknown): boolean {
  return typeof value !== "undefined";
}

/**
 * Run Intelligence IP-1 freeze gate.
 */
export function checkIntelligenceIp1Gate(): IntelligenceIp1GateResult {
  const checks: GateCheckItem[] = [];

  checks.push(
    check(
      "IP1-BASELINE",
      "freeze",
      "Intelligence IP-1 baseline constants",
      INTELLIGENCE_IP1_BASELINE_ID === "intelligence-ip1-baseline-v1" &&
        INTELLIGENCE_IP1_FREEZE_VERSION === "intelligence-ip1-freeze-1",
      `baseline=${INTELLIGENCE_IP1_BASELINE_ID}`,
    ),
  );

  const requiredExports: Array<{ id: string; name: string; value: unknown }> = [
    {
      id: "IP1-EXP-CTX",
      name: "buildIntelligenceContext",
      value: intelligence.buildIntelligenceContext,
    },
    {
      id: "IP1-EXP-SNAP",
      name: "createIntelligenceSnapshot",
      value: intelligence.createIntelligenceSnapshot,
    },
    {
      id: "IP1-EXP-METRICS",
      name: "buildIntelligenceMetrics",
      value: intelligence.buildIntelligenceMetrics,
    },
    {
      id: "IP1-EXP-DASH",
      name: "buildIntelligenceDashboard",
      value: intelligence.buildIntelligenceDashboard,
    },
    { id: "IP1-EXP-FEAT49", name: "FEAT_49_ID", value: intelligence.FEAT_49_ID },
    { id: "IP1-EXP-FEAT50", name: "FEAT_50_ID", value: intelligence.FEAT_50_ID },
    { id: "IP1-EXP-FEAT51", name: "FEAT_51_ID", value: intelligence.FEAT_51_ID },
    { id: "IP1-EXP-FEAT52", name: "FEAT_52_ID", value: intelligence.FEAT_52_ID },
    {
      id: "IP1-EXP-CAP-CTX",
      name: "INTELLIGENCE_CONTEXT_CAPABILITY",
      value: intelligence.INTELLIGENCE_CONTEXT_CAPABILITY,
    },
    {
      id: "IP1-EXP-CAP-SNAP",
      name: "INTELLIGENCE_SNAPSHOT_CAPABILITY",
      value: intelligence.INTELLIGENCE_SNAPSHOT_CAPABILITY,
    },
    {
      id: "IP1-EXP-CAP-METRICS",
      name: "INTELLIGENCE_METRICS_CAPABILITY",
      value: intelligence.INTELLIGENCE_METRICS_CAPABILITY,
    },
    {
      id: "IP1-EXP-CAP-DASH",
      name: "INTELLIGENCE_DASHBOARD_CAPABILITY",
      value: intelligence.INTELLIGENCE_DASHBOARD_CAPABILITY,
    },
  ];

  for (const exp of requiredExports) {
    const ok = assertExport(exp.name, exp.value);
    checks.push(
      check(
        exp.id,
        "export",
        `Export ${exp.name}`,
        ok,
        ok ? "exported" : "missing",
      ),
    );
  }

  resetStacks();

  try {
    const customerId = "cust-ip1-freeze-1";
    postLaunch.registerCustomer({
      customerId,
      name: "IP1 Freeze Customer",
      organization: "Org IP1",
      email: "ip1@freeze.example",
    });
    postLaunch.createCustomerProfile({
      customerId,
      displayName: "IP1 Profile",
    });
    postLaunch.setCustomerLifecycleStage({
      customerId,
      stage: "ACTIVE",
    });
    postLaunch.setCustomerHealth({
      customerId,
      score: 90,
      level: "GOOD",
    });
    postLaunch.recordCustomerEngagement({
      customerId,
      type: "CALL",
      notes: "ip1 freeze",
    });

    const context = intelligence.buildIntelligenceContext();
    const gotContext = intelligence.getIntelligenceContext();
    checks.push(
      check(
        "IP1-CTX",
        "Intelligence Context",
        "Intelligence Context build/get",
        context.customerSummary.totalCustomers >= 1 &&
          gotContext.contextId === context.contextId &&
          intelligence.FEAT_49_ID === "FEAT-49",
        `contextId=${context.contextId}`,
      ),
    );

    const snapshot = intelligence.createIntelligenceSnapshot({
      snapshotId: "snap-ip1-freeze-1",
      version: "v1",
    });
    const gotSnapshot = intelligence.getIntelligenceSnapshot(
      snapshot.snapshotId,
    );
    checks.push(
      check(
        "IP1-SNAP",
        "Intelligence Snapshot",
        "Intelligence Snapshot create/get/list",
        snapshot.contextId === context.contextId &&
          gotSnapshot?.version === "v1" &&
          intelligence.listIntelligenceSnapshots().length === 1 &&
          intelligence.FEAT_50_ID === "FEAT-50",
        `snapshotId=${snapshot.snapshotId}`,
      ),
    );

    const metrics = intelligence.buildIntelligenceMetrics();
    const gotMetrics = intelligence.getIntelligenceMetrics();
    checks.push(
      check(
        "IP1-METRICS",
        "Intelligence Metrics",
        "Intelligence Metrics build/get",
        metrics.snapshotId === snapshot.snapshotId &&
          typeof metrics.healthScore === "number" &&
          gotMetrics.metricsId === metrics.metricsId &&
          intelligence.FEAT_51_ID === "FEAT-51",
        `metricsId=${metrics.metricsId}`,
      ),
    );

    const dashboard = intelligence.buildIntelligenceDashboard();
    const gotDashboard = intelligence.getIntelligenceDashboard();
    const latestMetrics = intelligence.getIntelligenceMetrics();
    checks.push(
      check(
        "IP1-DASH",
        "Intelligence Dashboard",
        "Intelligence Dashboard build/get",
        dashboard.metricsId === latestMetrics.metricsId &&
          typeof dashboard.overallScore === "number" &&
          dashboard.summary.includes("overall=") &&
          gotDashboard.updatedAt === dashboard.updatedAt &&
          intelligence.FEAT_52_ID === "FEAT-52",
        `overallScore=${dashboard.overallScore}`,
      ),
    );
  } catch (err) {
    checks.push(
      check(
        "IP1-SMOKE",
        "smoke",
        "IP-1 smoke flow",
        false,
        err instanceof Error ? err.message : String(err),
      ),
    );
  } finally {
    resetStacks();
  }

  const passCount = checks.filter((c) => c.ok).length;
  const failCount = checks.filter((c) => !c.ok).length;
  const result: GateVerdict = failCount === 0 ? "PASS" : "FAIL";

  return {
    result,
    passCount,
    failCount,
    checks,
    summary: `intelligence-ip1 gate ${result.toLowerCase()}: pass=${passCount} fail=${failCount}`,
    baselineId: INTELLIGENCE_IP1_BASELINE_ID,
    freezeVersion: INTELLIGENCE_IP1_FREEZE_VERSION,
  };
}

export function assertIntelligenceIp1GatePass(
  result: IntelligenceIp1GateResult,
): asserts result is IntelligenceIp1GateResult & { result: "PASS" } {
  if (result.result !== "PASS") {
    throw new Error(`intelligence ip-1 gate failed: ${result.summary}`);
  }
}
