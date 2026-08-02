/**
 * Post-Launch P4 Baseline Freeze Gate
 * Freezes Customer Registry → Success Dashboard baseline (FEAT-30…FEAT-36).
 * No feature / model / API changes — export + smoke verification only.
 */
import * as postLaunch from "../lib/post-launch";

export const POST_LAUNCH_P4_BASELINE_ID =
  "post-launch-p4-customer-success-baseline-v1" as const;

export const POST_LAUNCH_P4_FREEZE_VERSION =
  "post-launch-p4-freeze-1" as const;

export type GateVerdict = "PASS" | "FAIL";

export type GateCheckItem = {
  id: string;
  component: string;
  label: string;
  ok: boolean;
  detail: string;
};

export type PostLaunchP4GateResult = {
  result: GateVerdict;
  passCount: number;
  failCount: number;
  checks: GateCheckItem[];
  summary: string;
  baselineId: typeof POST_LAUNCH_P4_BASELINE_ID;
  freezeVersion: typeof POST_LAUNCH_P4_FREEZE_VERSION;
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
  postLaunch.clearCustomerSuccessDashboard();
  postLaunch.clearSupportCases();
  postLaunch.clearCustomerEngagements();
  postLaunch.clearCustomerHealth();
  postLaunch.clearCustomerLifecycles();
  postLaunch.clearCustomerProfiles();
  postLaunch.clearCustomers();
}

function assertExport(
  name: string,
  value: unknown,
): boolean {
  return typeof value !== "undefined";
}

/**
 * Run Post-Launch P4 freeze gate.
 */
export function checkPostLaunchP4Gate(): PostLaunchP4GateResult {
  const checks: GateCheckItem[] = [];

  checks.push(
    check(
      "P4-BASELINE",
      "freeze",
      "Post-Launch P4 baseline constants",
      POST_LAUNCH_P4_BASELINE_ID ===
        "post-launch-p4-customer-success-baseline-v1" &&
        POST_LAUNCH_P4_FREEZE_VERSION === "post-launch-p4-freeze-1",
      `baseline=${POST_LAUNCH_P4_BASELINE_ID}`,
    ),
  );

  const requiredExports: Array<{ id: string; name: string; value: unknown }> = [
    { id: "P4-EXP-REG", name: "registerCustomer", value: postLaunch.registerCustomer },
    { id: "P4-EXP-PROF", name: "createCustomerProfile", value: postLaunch.createCustomerProfile },
    { id: "P4-EXP-LIFE", name: "setCustomerLifecycleStage", value: postLaunch.setCustomerLifecycleStage },
    { id: "P4-EXP-HEALTH", name: "setCustomerHealth", value: postLaunch.setCustomerHealth },
    { id: "P4-EXP-ENG", name: "recordCustomerEngagement", value: postLaunch.recordCustomerEngagement },
    { id: "P4-EXP-CASE", name: "openSupportCase", value: postLaunch.openSupportCase },
    { id: "P4-EXP-DASH", name: "buildCustomerSuccessDashboard", value: postLaunch.buildCustomerSuccessDashboard },
    { id: "P4-EXP-FEAT30", name: "FEAT_30_ID", value: postLaunch.FEAT_30_ID },
    { id: "P4-EXP-FEAT31", name: "FEAT_31_ID", value: postLaunch.FEAT_31_ID },
    { id: "P4-EXP-FEAT32", name: "FEAT_32_ID", value: postLaunch.FEAT_32_ID },
    { id: "P4-EXP-FEAT33", name: "FEAT_33_ID", value: postLaunch.FEAT_33_ID },
    { id: "P4-EXP-FEAT34", name: "FEAT_34_ID", value: postLaunch.FEAT_34_ID },
    { id: "P4-EXP-FEAT35", name: "FEAT_35_ID", value: postLaunch.FEAT_35_ID },
    { id: "P4-EXP-FEAT36", name: "FEAT_36_ID", value: postLaunch.FEAT_36_ID },
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
    const customer = postLaunch.registerCustomer({
      customerId: "cust-p4-freeze-1",
      name: "P4 Freeze Customer",
      organization: "Org P4",
      email: "p4@freeze.example",
    });
    checks.push(
      check(
        "P4-REG",
        "Customer Registry",
        "Customer Registry register/get",
        postLaunch.existsCustomer(customer.customerId) &&
          postLaunch.getCustomer(customer.customerId)?.customerId ===
            customer.customerId,
        `customerId=${customer.customerId}`,
      ),
    );

    const profile = postLaunch.createCustomerProfile({
      customerId: customer.customerId,
      displayName: "P4 Profile",
      industry: "Fitness",
    });
    checks.push(
      check(
        "P4-PROF",
        "Customer Profile",
        "Customer Profile create/get",
        postLaunch.getCustomerProfile(customer.customerId)?.displayName ===
          profile.displayName,
        `displayName=${profile.displayName}`,
      ),
    );

    const life = postLaunch.setCustomerLifecycleStage({
      customerId: customer.customerId,
      stage: "RISK",
    });
    checks.push(
      check(
        "P4-LIFE",
        "Customer Lifecycle",
        "Customer Lifecycle set/get/at-risk",
        life.stage === "RISK" &&
          postLaunch.isCustomerAtRisk(customer.customerId) === true,
        `stage=${life.stage}`,
      ),
    );

    const health = postLaunch.setCustomerHealth({
      customerId: customer.customerId,
      score: 82,
      level: "GOOD",
    });
    checks.push(
      check(
        "P4-HEALTH",
        "Customer Health",
        "Customer Health set/get/isHealthy",
        health.level === "GOOD" &&
          postLaunch.isHealthy(customer.customerId) === true,
        `score=${health.score}`,
      ),
    );

    const engagement = postLaunch.recordCustomerEngagement({
      customerId: customer.customerId,
      type: "EMAIL",
      notes: "p4 freeze",
    });
    checks.push(
      check(
        "P4-ENG",
        "Customer Engagement",
        "Customer Engagement record/get/recent",
        postLaunch.getCustomerEngagement(customer.customerId)?.type ===
          engagement.type &&
          postLaunch.hasRecentEngagement(customer.customerId) === true,
        `type=${engagement.type}`,
      ),
    );

    const supportCase = postLaunch.openSupportCase({
      caseId: "case-p4-freeze-1",
      customerId: customer.customerId,
      subject: "P4 freeze case",
      priority: "MEDIUM",
    });
    checks.push(
      check(
        "P4-CASE",
        "Support Case",
        "Support Case open/get/list",
        postLaunch.getSupportCase(supportCase.caseId)?.status === "OPEN" &&
          postLaunch.listSupportCase({ customerId: customer.customerId })
            .length === 1,
        `caseId=${supportCase.caseId}`,
      ),
    );

    const dashboard = postLaunch.buildCustomerSuccessDashboard();
    const gotDash = postLaunch.getCustomerSuccessDashboard();
    checks.push(
      check(
        "P4-DASH",
        "Customer Success Dashboard",
        "Customer Success Dashboard build/get",
        dashboard.totalCustomers >= 1 &&
          dashboard.openSupportCases >= 1 &&
          gotDash.updatedAt === dashboard.updatedAt,
        `totalCustomers=${dashboard.totalCustomers}`,
      ),
    );
  } catch (err) {
    checks.push(
      check(
        "P4-SMOKE",
        "smoke",
        "P4 smoke flow",
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
    summary: `post-launch-p4 gate ${result.toLowerCase()}: pass=${passCount} fail=${failCount}`,
    baselineId: POST_LAUNCH_P4_BASELINE_ID,
    freezeVersion: POST_LAUNCH_P4_FREEZE_VERSION,
  };
}

export function assertPostLaunchP4GatePass(
  result: PostLaunchP4GateResult,
): asserts result is PostLaunchP4GateResult & { result: "PASS" } {
  if (result.result !== "PASS") {
    throw new Error(`post-launch p4 gate failed: ${result.summary}`);
  }
}
