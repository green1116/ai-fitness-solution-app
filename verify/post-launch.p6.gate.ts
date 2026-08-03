/**
 * Post-Launch P6 Baseline Freeze Gate
 * Freezes Customer Insights → Optimization Dashboard baseline (FEAT-41…FEAT-44).
 * No feature / model / API changes — export + smoke verification only.
 */
import * as postLaunch from "../lib/post-launch";

export const POST_LAUNCH_P6_BASELINE_ID =
  "post-launch-p6-optimization-baseline-v1" as const;

export const POST_LAUNCH_P6_FREEZE_VERSION =
  "post-launch-p6-freeze-1" as const;

export type GateVerdict = "PASS" | "FAIL";

export type GateCheckItem = {
  id: string;
  component: string;
  label: string;
  ok: boolean;
  detail: string;
};

export type PostLaunchP6GateResult = {
  result: GateVerdict;
  passCount: number;
  failCount: number;
  checks: GateCheckItem[];
  summary: string;
  baselineId: typeof POST_LAUNCH_P6_BASELINE_ID;
  freezeVersion: typeof POST_LAUNCH_P6_FREEZE_VERSION;
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

function resetCustomerStack(): void {
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
 * Run Post-Launch P6 freeze gate.
 */
export function checkPostLaunchP6Gate(): PostLaunchP6GateResult {
  const checks: GateCheckItem[] = [];

  checks.push(
    check(
      "P6-BASELINE",
      "freeze",
      "Post-Launch P6 baseline constants",
      POST_LAUNCH_P6_BASELINE_ID ===
        "post-launch-p6-optimization-baseline-v1" &&
        POST_LAUNCH_P6_FREEZE_VERSION === "post-launch-p6-freeze-1",
      `baseline=${POST_LAUNCH_P6_BASELINE_ID}`,
    ),
  );

  const requiredExports: Array<{ id: string; name: string; value: unknown }> = [
    {
      id: "P6-EXP-CUST-INS",
      name: "buildCustomerInsights",
      value: postLaunch.buildCustomerInsights,
    },
    {
      id: "P6-EXP-RET-INS",
      name: "buildRetentionInsights",
      value: postLaunch.buildRetentionInsights,
    },
    {
      id: "P6-EXP-EXP-INS",
      name: "buildExpansionInsights",
      value: postLaunch.buildExpansionInsights,
    },
    {
      id: "P6-EXP-OPT",
      name: "buildOptimizationDashboard",
      value: postLaunch.buildOptimizationDashboard,
    },
    { id: "P6-EXP-FEAT41", name: "FEAT_41_ID", value: postLaunch.FEAT_41_ID },
    { id: "P6-EXP-FEAT42", name: "FEAT_42_ID", value: postLaunch.FEAT_42_ID },
    { id: "P6-EXP-FEAT43", name: "FEAT_43_ID", value: postLaunch.FEAT_43_ID },
    { id: "P6-EXP-FEAT44", name: "FEAT_44_ID", value: postLaunch.FEAT_44_ID },
    {
      id: "P6-EXP-CAP-CUST",
      name: "CUSTOMER_INSIGHTS_CAPABILITY",
      value: postLaunch.CUSTOMER_INSIGHTS_CAPABILITY,
    },
    {
      id: "P6-EXP-CAP-RET",
      name: "RETENTION_INSIGHTS_CAPABILITY",
      value: postLaunch.RETENTION_INSIGHTS_CAPABILITY,
    },
    {
      id: "P6-EXP-CAP-EXP",
      name: "EXPANSION_INSIGHTS_CAPABILITY",
      value: postLaunch.EXPANSION_INSIGHTS_CAPABILITY,
    },
    {
      id: "P6-EXP-CAP-OPT",
      name: "OPTIMIZATION_DASHBOARD_CAPABILITY",
      value: postLaunch.OPTIMIZATION_DASHBOARD_CAPABILITY,
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

  resetCustomerStack();

  try {
    const customerId = "cust-p6-freeze-1";
    postLaunch.registerCustomer({
      customerId,
      name: "P6 Freeze Customer",
      organization: "Org P6",
      email: "p6@freeze.example",
    });
    postLaunch.createCustomerProfile({
      customerId,
      displayName: "P6 Profile",
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
      notes: "p6 freeze",
    });

    const customerId2 = "cust-p6-freeze-2";
    postLaunch.registerCustomer({
      customerId: customerId2,
      name: "P6 Expansion Customer",
      organization: "Org P6B",
      email: "p6b@freeze.example",
    });
    postLaunch.createCustomerProfile({
      customerId: customerId2,
      displayName: "P6 Expansion",
    });
    postLaunch.setCustomerLifecycleStage({
      customerId: customerId2,
      stage: "ACTIVE",
    });
    postLaunch.setCustomerHealth({
      customerId: customerId2,
      score: 80,
      level: "GOOD",
    });
    postLaunch.recordCustomerEngagement({
      customerId: customerId2,
      type: "MEETING",
      notes: "p6 expansion",
    });

    postLaunch.addRenewal({
      customerId,
      renewalDate: "2026-12-31",
      value: 12000,
    });
    postLaunch.updateRenewalStatus({
      customerId,
      renewalStatus: "RENEWED",
    });

    postLaunch.addExpansion({
      customerId: customerId2,
      expansionDate: "2026-11-15",
      value: 8000,
    });
    postLaunch.updateExpansionStatus({
      customerId: customerId2,
      expansionStatus: "WON",
    });

    const customerInsights = postLaunch.buildCustomerInsights();
    const gotCustomerInsights = postLaunch.getCustomerInsights();
    checks.push(
      check(
        "P6-CUST-INS",
        "Customer Insights",
        "Customer Insights build/get",
        customerInsights.totalCustomers >= 2 &&
          customerInsights.healthyCustomers >= 2 &&
          gotCustomerInsights.updatedAt === customerInsights.updatedAt &&
          postLaunch.FEAT_41_ID === "FEAT-41",
        `totalCustomers=${customerInsights.totalCustomers}`,
      ),
    );

    const retentionInsights = postLaunch.buildRetentionInsights();
    const gotRetentionInsights = postLaunch.getRetentionInsights();
    checks.push(
      check(
        "P6-RET-INS",
        "Retention Insights",
        "Retention Insights build/get",
        retentionInsights.renewedCustomers >= 1 &&
          retentionInsights.retentionRate === 1 &&
          gotRetentionInsights.updatedAt === retentionInsights.updatedAt &&
          postLaunch.FEAT_42_ID === "FEAT-42",
        `retentionRate=${retentionInsights.retentionRate}`,
      ),
    );

    const expansionInsights = postLaunch.buildExpansionInsights();
    const gotExpansionInsights = postLaunch.getExpansionInsights();
    checks.push(
      check(
        "P6-EXP-INS",
        "Expansion Insights",
        "Expansion Insights build/get",
        expansionInsights.wonExpansions >= 1 &&
          expansionInsights.expansionRate === 1 &&
          gotExpansionInsights.updatedAt === expansionInsights.updatedAt &&
          postLaunch.FEAT_43_ID === "FEAT-43",
        `expansionRate=${expansionInsights.expansionRate}`,
      ),
    );

    const optimization = postLaunch.buildOptimizationDashboard();
    const gotOptimization = postLaunch.getOptimizationDashboard();
    checks.push(
      check(
        "P6-OPT",
        "Optimization Dashboard",
        "Optimization Dashboard build/get",
        optimization.customerInsights.totalCustomers >= 2 &&
          optimization.retentionInsights.retentionRate === 1 &&
          optimization.expansionInsights.expansionRate === 1 &&
          optimization.optimizationScore === 100 &&
          gotOptimization.updatedAt === optimization.updatedAt &&
          postLaunch.FEAT_44_ID === "FEAT-44",
        `optimizationScore=${optimization.optimizationScore}`,
      ),
    );
  } catch (err) {
    checks.push(
      check(
        "P6-SMOKE",
        "smoke",
        "P6 smoke flow",
        false,
        err instanceof Error ? err.message : String(err),
      ),
    );
  } finally {
    resetCustomerStack();
  }

  const passCount = checks.filter((c) => c.ok).length;
  const failCount = checks.filter((c) => !c.ok).length;
  const result: GateVerdict = failCount === 0 ? "PASS" : "FAIL";

  return {
    result,
    passCount,
    failCount,
    checks,
    summary: `post-launch-p6 gate ${result.toLowerCase()}: pass=${passCount} fail=${failCount}`,
    baselineId: POST_LAUNCH_P6_BASELINE_ID,
    freezeVersion: POST_LAUNCH_P6_FREEZE_VERSION,
  };
}

export function assertPostLaunchP6GatePass(
  result: PostLaunchP6GateResult,
): asserts result is PostLaunchP6GateResult & { result: "PASS" } {
  if (result.result !== "PASS") {
    throw new Error(`post-launch p6 gate failed: ${result.summary}`);
  }
}
