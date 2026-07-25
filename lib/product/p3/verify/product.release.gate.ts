/**
 * Product P3 — AI Project Creation Release Gate
 * BASE: enterprise-product-p2-organization-workspace-v1
 * Isolated — product layer only; does not mutate architecture layers
 */

import { buildPlatformV1Manifest } from "../../../platform/v1/platform.manifest";
import { E12_PRODUCTIZATION_COMPLETE_ID } from "../../e12/signoff/governance.freeze.lock";
import { ENTERPRISE_LAUNCH_COMPLETE_ID } from "../../../launch/signoff/governance.freeze.lock";
import { ENTERPRISE_EVOLUTION_COMPLETE_ID } from "../../../evolution/signoff/governance.freeze.lock";
import { ENTERPRISE_COMMERCIALIZATION_COMPLETE_ID } from "../../../commercialization/p8/freeze/freeze.lock";
import { ENTERPRISE_LAUNCH_READINESS_COMPLETE_ID } from "../../../launch/readiness/l5/freeze/freeze.lock";
import { ENTERPRISE_OPERATIONS_COMPLETE_ID } from "../../../operations/o5/freeze/freeze.lock";
import { PRODUCT_P2_ORGANIZATION_WORKSPACE_ID } from "../../p2/organization/organization.constants";
import {
  BRIEF_STATUSES,
  FACILITY_KINDS,
  GOAL_STATUSES,
  P3_MANAGER_STATUSES,
  P3_READINESS_VERDICTS,
  PRODUCT_P3_AI_PROJECT_CREATION_BASE,
  PRODUCT_P3_AI_PROJECT_CREATION_FREEZE_VERSION,
  PRODUCT_P3_AI_PROJECT_CREATION_ID,
  PRODUCT_P3_AI_PROJECT_CREATION_VERSION,
  PRODUCT_P3_PROJECT_FREEZE_VERSION,
  PROJECT_STATUSES,
  PROJECT_TEMPLATE_KINDS,
  REQUIREMENT_PRIORITIES,
  SITE_STATUSES,
} from "../project/project.constants";
import {
  assertP3AiProjectCreationReadinessReady,
  clearP3AiProjectCreationLayer,
  createP3AiProjectManager,
  getP3RegistryManifest,
} from "../project.manager";

export type GateVerdict = "PASS" | "FAIL";

export type GateCheckItem = {
  id: string;
  component: string;
  label: string;
  ok: boolean;
  detail: string;
};

export type ReleaseGateResult = {
  result: GateVerdict;
  passCount: number;
  failCount: number;
  checks: GateCheckItem[];
  summary: string;
};

export const PRODUCT_P3_SIGNOFF_VERSION = "product-p3-signoff-1" as const;

function check(
  id: string,
  component: string,
  label: string,
  ok: boolean,
  detail: string,
): GateCheckItem {
  return { id, component, label, ok, detail };
}

function cleanup(): void {
  clearP3AiProjectCreationLayer();
}

export function checkProductP3ReleaseGate(): ReleaseGateResult {
  const checks: GateCheckItem[] = [];

  checks.push(
    check(
      "P3-CONSTANTS",
      "project",
      "Product P3 AI project creation version constants",
      PRODUCT_P3_AI_PROJECT_CREATION_ID ===
        "enterprise-product-p3-ai-project-creation-v1" &&
        PRODUCT_P3_AI_PROJECT_CREATION_VERSION === "product-p3-1" &&
        PRODUCT_P3_AI_PROJECT_CREATION_BASE ===
          PRODUCT_P2_ORGANIZATION_WORKSPACE_ID &&
        PRODUCT_P3_AI_PROJECT_CREATION_FREEZE_VERSION ===
          "product-p3-ai-project-creation-freeze-1" &&
        PRODUCT_P3_PROJECT_FREEZE_VERSION ===
          "product-p3-ai-project-creation-freeze-1" &&
        PROJECT_STATUSES.length === 6 &&
        PROJECT_TEMPLATE_KINDS.length === 5 &&
        BRIEF_STATUSES.length === 4 &&
        SITE_STATUSES.length === 3 &&
        FACILITY_KINDS.length === 6 &&
        REQUIREMENT_PRIORITIES.length === 4 &&
        GOAL_STATUSES.length === 4 &&
        P3_READINESS_VERDICTS.length === 3 &&
        P3_MANAGER_STATUSES.length === 4,
      `id=${PRODUCT_P3_AI_PROJECT_CREATION_ID} base=${PRODUCT_P3_AI_PROJECT_CREATION_BASE}`,
    ),
  );

  const platform = buildPlatformV1Manifest();
  checks.push(
    check(
      "P3-PLATFORM",
      "platform-v1",
      "Platform v1 baseline aligned",
      platform.aligned === true,
      platform.summary,
    ),
  );

  checks.push(
    check(
      "P3-P2-BASE",
      "product-p2",
      "P2 organization workspace BASE preserved",
      PRODUCT_P3_AI_PROJECT_CREATION_BASE ===
        "enterprise-product-p2-organization-workspace-v1" &&
        ENTERPRISE_OPERATIONS_COMPLETE_ID ===
          "enterprise-operations-complete-v1" &&
        ENTERPRISE_LAUNCH_READINESS_COMPLETE_ID ===
          "enterprise-launch-readiness-complete-v1" &&
        ENTERPRISE_COMMERCIALIZATION_COMPLETE_ID ===
          "enterprise-commercialization-complete-v1",
      `base=${PRODUCT_P3_AI_PROJECT_CREATION_BASE}`,
    ),
  );

  checks.push(
    check(
      "P3-UPSTREAM",
      "baselines",
      "Evolution / launch / E12 baselines preserved",
      ENTERPRISE_EVOLUTION_COMPLETE_ID ===
        "enterprise-evolution-complete-v1" &&
        ENTERPRISE_LAUNCH_COMPLETE_ID === "enterprise-launch-complete-v1" &&
        E12_PRODUCTIZATION_COMPLETE_ID ===
          "enterprise-e12-productization-complete-v1",
      `evolution=${ENTERPRISE_EVOLUTION_COMPLETE_ID}`,
    ),
  );

  try {
    cleanup();
    const mgr = createP3AiProjectManager({ managerId: "prod-p3-gate" });
    mgr.initialize();
    mgr.start();

    const template = mgr.registerTemplate({
      id: "p3.gate.tmpl",
      kind: "FITNESS_CENTER",
      name: "Fitness Center AI Launch",
      description: "Standard gym AI project template",
      defaultGoals: ["Increase member retention", "Automate programming"],
    });
    const project = mgr.createProject({
      id: "p3.gate.prj",
      organizationRef: "acme-fitness",
      name: "Acme AI Coaching Rollout",
      owner: "pm.jordan",
      templateId: template.id,
    });
    const brief = mgr.createBrief({
      id: "p3.gate.brf",
      projectId: project.id,
      title: "Acme coaching brief",
      summary: "Deploy AI coaching across 3 gyms",
    });
    mgr.updateBriefStatus({ briefId: brief.id, status: "APPROVED" });
    mgr.updateProjectStatus({ projectId: project.id, status: "BRIEFED" });
    const site = mgr.registerSite({
      id: "p3.gate.site",
      projectId: project.id,
      name: "Acme Downtown",
      location: "Shanghai",
    });
    mgr.registerFacility({
      id: "p3.gate.fac",
      projectId: project.id,
      siteId: site.id,
      name: "Main Floor Gym",
      kind: "GYM",
      capacity: 120,
    });
    mgr.captureRequirement({
      id: "p3.gate.req",
      projectId: project.id,
      title: "Coach console SSO",
      priority: "P1",
      description: "Integrate enterprise SSO for coaches",
    });
    mgr.defineGoal({
      id: "p3.gate.goal",
      projectId: project.id,
      title: "Activation rate",
      targetMetric: "activation_pct",
      targetValue: 80,
    });
    mgr.updateProjectStatus({ projectId: project.id, status: "SCOPED" });
    mgr.updateProjectStatus({ projectId: project.id, status: "ACTIVE" });

    const readiness = mgr.evaluateReadiness();
    const registry = getP3RegistryManifest();

    const ok =
      readiness.verdict === "READY" &&
      registry.foundationId === PRODUCT_P3_AI_PROJECT_CREATION_ID &&
      registry.base === PRODUCT_P3_AI_PROJECT_CREATION_BASE &&
      registry.projectCount >= 1 &&
      registry.templateCount >= 1 &&
      registry.briefCount >= 1 &&
      registry.siteCount >= 1 &&
      registry.facilityCount >= 1 &&
      registry.requirementCount >= 1 &&
      registry.goalCount >= 1;

    try {
      assertP3AiProjectCreationReadinessReady(readiness);
      checks.push(
        check(
          "P3-STACK",
          "project",
          "Template / project / brief / site / facility / requirement / goal",
          ok,
          `readiness=${readiness.verdict} projects=${registry.projectCount}`,
        ),
      );
    } catch (error) {
      checks.push(
        check(
          "P3-STACK",
          "project",
          "Template / project / brief / site / facility / requirement / goal",
          false,
          error instanceof Error
            ? error.message
            : "p3 ai project creation not ready",
        ),
      );
    }

    mgr.stop();
    cleanup();
  } catch (error) {
    checks.push(
      check(
        "P3-STACK",
        "project",
        "Template / project / brief / site / facility / requirement / goal",
        false,
        error instanceof Error
          ? error.message
          : "p3 ai project creation probe failed",
      ),
    );
    cleanup();
  }

  const passCount = checks.filter((c) => c.ok).length;
  const failCount = checks.filter((c) => !c.ok).length;
  const result: GateVerdict = failCount === 0 ? "PASS" : "FAIL";

  return {
    result,
    passCount,
    failCount,
    checks,
    summary: [
      `product-p3-gate result=${result}`,
      `pass=${passCount}/${checks.length}`,
      `fail=${failCount}`,
    ].join(" "),
  };
}

export function assertProductP3ReleaseGatePass(
  gate: ReleaseGateResult = checkProductP3ReleaseGate(),
): asserts gate is ReleaseGateResult & { result: "PASS" } {
  if (gate.result !== "PASS") {
    throw new Error(`Product P3 release gate failed: ${gate.summary}`);
  }
}
