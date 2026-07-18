/**
 * E07-P8 — Collect per-phase readiness via P1–P7 workforce chain (read-only)
 */

import { buildWorkforceFoundation } from "../core/workforce.lifecycle";
import { buildEmployeeRegistryManifest } from "../employee/employee.registry";
import { buildRoleRegistryManifest } from "../marketplace/role.registry";
import { buildOrchestrationRegistryManifest } from "../orchestration/orchestration.registry";
import { buildCollaborationRegistryManifest } from "../collaboration/collaboration.registry";
import { buildLearningRegistryManifest } from "../learning/learning.registry";
import {
  buildOrganizationRegistryManifest,
  getOrganizationById,
} from "../organization/organization.registry";
import { executeOrganizationOrThrow } from "../organization/organization.executor";

import type {
  OrganizationBaselineSnapshot,
  ReadinessReport,
} from "./signoff.types";

function runOrganizationBaseline(deploymentId: string) {
  const organization = getOrganizationById("e07.org.commercial-division");
  if (!organization) {
    throw new Error("missing organization e07.org.commercial-division");
  }

  return executeOrganizationOrThrow(organization, {
    taskId: `${deploymentId}-org`,
    input: {
      goal: "E07 P8 digital workforce governance freeze baseline",
      ready: true,
      riskScore: 10,
      humanDecision: "approve",
      projectHint: "星河科技园企业健身中心",
    },
    metadata: { source: "e07-p8-signoff", deploymentId },
  });
}

export function collectOrganizationBaseline(
  deploymentId: string,
): OrganizationBaselineSnapshot {
  const run = runOrganizationBaseline(`${deploymentId}-baseline`);

  return {
    ready:
      run.result.success &&
      run.result.completedUnits === run.result.plan.unitCount,
    organizationId: run.result.organizationId,
    kind: run.result.kind,
    mission: run.result.mission,
    unitCount: run.result.plan.unitCount,
    completedUnits: run.result.completedUnits,
    readinessScore: run.result.success ? 100 : 0,
  };
}

export function collectWorkforcePhaseReadiness(
  deploymentId: string,
): ReadinessReport {
  try {
    const foundation = buildWorkforceFoundation();
    const employees = buildEmployeeRegistryManifest();
    const roles = buildRoleRegistryManifest();
    const orchestrations = buildOrchestrationRegistryManifest();
    const collaborations = buildCollaborationRegistryManifest();
    const learnings = buildLearningRegistryManifest();
    const organizations = buildOrganizationRegistryManifest();
    const baseline = collectOrganizationBaseline(deploymentId);

    const p1 = foundation.ready === true;
    const p2 = employees.catalogComplete === true;
    const p3 = roles.catalogComplete === true;
    const p4 = orchestrations.catalogComplete === true;
    const p5 = collaborations.catalogComplete === true;
    const p6 = learnings.catalogComplete === true;
    const p7 = organizations.catalogComplete === true && baseline.ready;

    const ready = p1 && p2 && p3 && p4 && p5 && p6 && p7;
    const blocked = !ready;

    return {
      p1,
      p2,
      p3,
      p4,
      p5,
      p6,
      p7,
      ready,
      blocked,
      summary: [
        `readiness ready=${ready}`,
        `phases=${[p1, p2, p3, p4, p5, p6, p7].filter(Boolean).length}/7`,
        `blocked=${blocked}`,
      ].join(" "),
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "readiness failed";
    return {
      p1: false,
      p2: false,
      p3: false,
      p4: false,
      p5: false,
      p6: false,
      p7: false,
      ready: false,
      blocked: true,
      summary: `readiness ready=false blocked=true error=${message}`,
    };
  }
}
