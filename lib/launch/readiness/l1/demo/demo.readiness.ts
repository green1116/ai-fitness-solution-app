/**
 * Launch L1 — Demo foundation readiness
 */

import { ENTERPRISE_COMMERCIALIZATION_COMPLETE_ID } from "../../../../commercialization/p8/freeze/freeze.lock";
import { listArtifacts } from "../artifact/artifact.registry";
import { listCustomerProfiles } from "../customer/customer.profile";
import { listProjectScenarios } from "../project/project.scenario";
import { listTenants } from "../tenant/tenant.registry";
import { LAUNCH_L1_DEMO_FOUNDATION_BASE } from "./demo.constants";
import { listDemoBundles } from "./demo.loader";
import { listDemoSeeds } from "./demo.seed";
import type { L1ReadinessCheck, L1ReadinessResult } from "./demo.types";

function nowIso(): string {
  return new Date().toISOString();
}

function check(
  id: string,
  component: string,
  label: string,
  ok: boolean,
  detail: string,
): L1ReadinessCheck {
  return { id, component, label, ok, detail };
}

export function evaluateL1DemoReadiness(): L1ReadinessResult {
  const checks: L1ReadinessCheck[] = [];

  checks.push(
    check(
      "L1-BASE",
      "foundation",
      "Commercialization v1 release baseline aligned",
      LAUNCH_L1_DEMO_FOUNDATION_BASE ===
        "enterprise-commercialization-v1-release" &&
        ENTERPRISE_COMMERCIALIZATION_COMPLETE_ID ===
          "enterprise-commercialization-complete-v1",
      `base=${LAUNCH_L1_DEMO_FOUNDATION_BASE}`,
    ),
  );

  const tenants = listTenants();
  checks.push(
    check(
      "L1-TEN",
      "tenant",
      "Demo tenants registered",
      tenants.length >= 1,
      `tenants=${tenants.length}`,
    ),
  );

  const customers = listCustomerProfiles();
  checks.push(
    check(
      "L1-CUS",
      "customer",
      "Customer profiles present",
      customers.length >= 1,
      `customers=${customers.length}`,
    ),
  );

  const projects = listProjectScenarios();
  checks.push(
    check(
      "L1-PRJ",
      "project",
      "Project scenarios present",
      projects.length >= 1,
      `projects=${projects.length}`,
    ),
  );

  const artifacts = listArtifacts();
  checks.push(
    check(
      "L1-ART",
      "artifact",
      "Demo artifacts registered",
      artifacts.length >= 1,
      `artifacts=${artifacts.length}`,
    ),
  );

  const bundles = listDemoBundles();
  checks.push(
    check(
      "L1-DEM",
      "demo",
      "Demo bundles loaded",
      bundles.length >= 1,
      `bundles=${bundles.length}`,
    ),
  );

  const seeds = listDemoSeeds();
  checks.push(
    check(
      "L1-SED",
      "demo",
      "Demo seeds present",
      seeds.length >= 1,
      `seeds=${seeds.length}`,
    ),
  );

  const passCount = checks.filter((c) => c.ok).length;
  const failCount = checks.filter((c) => !c.ok).length;
  const verdict =
    failCount === 0 ? "READY" : passCount === 0 ? "NOT_READY" : "BLOCKED";

  return {
    verdict,
    passCount,
    failCount,
    checks,
    summary: `l1-demo-foundation readiness ${verdict.toLowerCase()}: pass=${passCount} fail=${failCount}`,
    evaluatedAt: nowIso(),
  };
}

export function assertL1DemoReadinessReady(
  result: L1ReadinessResult,
): asserts result is L1ReadinessResult & { verdict: "READY" } {
  if (result.verdict !== "READY") {
    throw new Error(`l1 demo foundation not ready: ${result.summary}`);
  }
}
