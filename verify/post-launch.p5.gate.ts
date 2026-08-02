/**
 * Post-Launch P5 Baseline Freeze Gate
 * Freezes Customer Analytics → Retention Dashboard baseline (FEAT-37…FEAT-40).
 * No feature / model / API changes — export + smoke verification only.
 */
import * as postLaunch from "../lib/post-launch";

export const POST_LAUNCH_P5_BASELINE_ID =
  "post-launch-p5-retention-baseline-v1" as const;

export const POST_LAUNCH_P5_FREEZE_VERSION =
  "post-launch-p5-freeze-1" as const;

export type GateVerdict = "PASS" | "FAIL";

export type GateCheckItem = {
  id: string;
  component: string;
  label: string;
  ok: boolean;
  detail: string;
};

export type PostLaunchP5GateResult = {
  result: GateVerdict;
  passCount: number;
  failCount: number;
  checks: GateCheckItem[];
  summary: string;
  baselineId: typeof POST_LAUNCH_P5_BASELINE_ID;
  freezeVersion: typeof POST_LAUNCH_P5_FREEZE_VERSION;
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
 * Run Post-Launch P5 freeze gate.
 */
export function checkPostLaunchP5Gate(): PostLaunchP5GateResult {
  const checks: GateCheckItem[] = [];

  checks.push(
    check(
      "P5-BASELINE",
      "freeze",
      "Post-Launch P5 baseline constants",
      POST_LAUNCH_P5_BASELINE_ID ===
        "post-launch-p5-retention-baseline-v1" &&
        POST_LAUNCH_P5_FREEZE_VERSION === "post-launch-p5-freeze-1",
      `baseline=${POST_LAUNCH_P5_BASELINE_ID}`,
    ),
  );

  const requiredExports: Array<{ id: string; name: string; value: unknown }> = [
    {
      id: "P5-EXP-ANALYTICS",
      name: "buildCustomerAnalytics",
      value: postLaunch.buildCustomerAnalytics,
    },
    {
      id: "P5-EXP-RENEWAL",
      name: "addRenewal",
      value: postLaunch.addRenewal,
    },
    {
      id: "P5-EXP-EXPANSION",
      name: "addExpansion",
      value: postLaunch.addExpansion,
    },
    {
      id: "P5-EXP-RETENTION",
      name: "buildRetentionDashboard",
      value: postLaunch.buildRetentionDashboard,
    },
    { id: "P5-EXP-FEAT37", name: "FEAT_37_ID", value: postLaunch.FEAT_37_ID },
    { id: "P5-EXP-FEAT38", name: "FEAT_38_ID", value: postLaunch.FEAT_38_ID },
    { id: "P5-EXP-FEAT39", name: "FEAT_39_ID", value: postLaunch.FEAT_39_ID },
    { id: "P5-EXP-FEAT40", name: "FEAT_40_ID", value: postLaunch.FEAT_40_ID },
    {
      id: "P5-EXP-CAP-ANALYTICS",
      name: "CUSTOMER_ANALYTICS_CAPABILITY",
      value: postLaunch.CUSTOMER_ANALYTICS_CAPABILITY,
    },
    {
      id: "P5-EXP-CAP-RENEWAL",
      name: "RENEWAL_QUEUE_CAPABILITY",
      value: postLaunch.RENEWAL_QUEUE_CAPABILITY,
    },
    {
      id: "P5-EXP-CAP-EXPANSION",
      name: "EXPANSION_QUEUE_CAPABILITY",
      value: postLaunch.EXPANSION_QUEUE_CAPABILITY,
    },
    {
      id: "P5-EXP-CAP-RETENTION",
      name: "RETENTION_DASHBOARD_CAPABILITY",
      value: postLaunch.RETENTION_DASHBOARD_CAPABILITY,
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
    const customerId = "cust-p5-freeze-1";
    postLaunch.registerCustomer({
      customerId,
      name: "P5 Freeze Customer",
      organization: "Org P5",
      email: "p5@freeze.example",
    });
    postLaunch.createCustomerProfile({
      customerId,
      displayName: "P5 Profile",
    });
    postLaunch.setCustomerLifecycleStage({
      customerId,
      stage: "ACTIVE",
    });
    postLaunch.setCustomerHealth({
      customerId,
      score: 88,
      level: "GOOD",
    });
    postLaunch.recordCustomerEngagement({
      customerId,
      type: "CALL",
      notes: "p5 freeze",
    });
    postLaunch.openSupportCase({
      caseId: "case-p5-freeze-1",
      customerId,
      subject: "P5 freeze case",
    });
    postLaunch.buildCustomerSuccessDashboard();

    const analytics = postLaunch.buildCustomerAnalytics();
    const gotAnalytics = postLaunch.getCustomerAnalytics();
    checks.push(
      check(
        "P5-ANALYTICS",
        "Customer Analytics",
        "Customer Analytics build/get",
        analytics.totalCustomers >= 1 &&
          analytics.updatedAt.includes("T") &&
          gotAnalytics.updatedAt === analytics.updatedAt &&
          postLaunch.FEAT_37_ID === "FEAT-37",
        `totalCustomers=${analytics.totalCustomers}`,
      ),
    );

    const renewal = postLaunch.addRenewal({
      customerId,
      renewalDate: "2026-12-31",
      value: 15000,
    });
    const gotRenewal = postLaunch.getRenewal(customerId);
    checks.push(
      check(
        "P5-RENEWAL",
        "Renewal Queue",
        "Renewal Queue add/get/list",
        renewal.renewalStatus === "OPEN" &&
          gotRenewal?.value === 15000 &&
          postLaunch.listRenewals().length === 1 &&
          postLaunch.FEAT_38_ID === "FEAT-38",
        `customerId=${renewal.customerId}`,
      ),
    );

    const customerId2 = "cust-p5-freeze-2";
    postLaunch.registerCustomer({
      customerId: customerId2,
      name: "P5 Expansion Customer",
      organization: "Org P5B",
      email: "p5b@freeze.example",
    });
    postLaunch.createCustomerProfile({
      customerId: customerId2,
      displayName: "P5 Expansion",
    });
    postLaunch.setCustomerLifecycleStage({
      customerId: customerId2,
      stage: "ACTIVE",
    });
    postLaunch.setCustomerHealth({
      customerId: customerId2,
      score: 75,
      level: "GOOD",
    });
    postLaunch.recordCustomerEngagement({
      customerId: customerId2,
      type: "MEETING",
      notes: "p5 expansion",
    });
    postLaunch.buildCustomerSuccessDashboard();
    postLaunch.buildCustomerAnalytics();

    const expansion = postLaunch.addExpansion({
      customerId: customerId2,
      expansionDate: "2026-11-15",
      value: 9000,
    });
    const gotExpansion = postLaunch.getExpansion(customerId2);
    checks.push(
      check(
        "P5-EXPANSION",
        "Expansion Queue",
        "Expansion Queue add/get/list",
        expansion.expansionStatus === "OPEN" &&
          gotExpansion?.value === 9000 &&
          postLaunch.listExpansions().length === 1 &&
          postLaunch.FEAT_39_ID === "FEAT-39",
        `customerId=${expansion.customerId}`,
      ),
    );

    postLaunch.updateRenewalStatus({
      customerId,
      renewalStatus: "RENEWED",
    });
    postLaunch.updateExpansionStatus({
      customerId: customerId2,
      expansionStatus: "WON",
    });

    const retention = postLaunch.buildRetentionDashboard();
    const gotRetention = postLaunch.getRetentionDashboard();
    checks.push(
      check(
        "P5-RETENTION",
        "Retention Dashboard",
        "Retention Dashboard build/get",
        retention.totalRenewals >= 1 &&
          retention.renewedCustomers >= 1 &&
          retention.wonExpansions >= 1 &&
          retention.retentionRate === 1 &&
          gotRetention.updatedAt === retention.updatedAt &&
          postLaunch.FEAT_40_ID === "FEAT-40",
        `retentionRate=${retention.retentionRate}`,
      ),
    );
  } catch (err) {
    checks.push(
      check(
        "P5-SMOKE",
        "smoke",
        "P5 smoke flow",
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
    summary: `post-launch-p5 gate ${result.toLowerCase()}: pass=${passCount} fail=${failCount}`,
    baselineId: POST_LAUNCH_P5_BASELINE_ID,
    freezeVersion: POST_LAUNCH_P5_FREEZE_VERSION,
  };
}

export function assertPostLaunchP5GatePass(
  result: PostLaunchP5GateResult,
): asserts result is PostLaunchP5GateResult & { result: "PASS" } {
  if (result.result !== "PASS") {
    throw new Error(`post-launch p5 gate failed: ${result.summary}`);
  }
}
