/**
 * E07-P7 — Autonomous Organization Planner
 * Composes ordered learning-unit plans from organization definitions
 */

import { getLearningById } from "../learning/learning.registry";
import { assertOrganizationDefinition } from "./organization.registry";
import type {
  OrganizationDefinition,
  OrganizationPlan,
  OrganizationPlanUnit,
} from "./organization.types";

export function planOrganization(
  organization: OrganizationDefinition,
): OrganizationPlan {
  assertOrganizationDefinition(organization);

  const units: OrganizationPlanUnit[] = organization.learningIds.map(
    (learningId, index) => {
      const learning = getLearningById(learningId);
      if (!learning) {
        throw new Error(
          `unknown learning ${learningId} on ${organization.id}`,
        );
      }
      return {
        id: `${organization.id}.unit-${index + 1}`,
        order: index + 1,
        learningId: learning.id,
        learningKind: learning.kind,
        collaborationId: learning.collaborationId,
        title: learning.name,
        detail: `${learning.description} → ${learning.collaborationId}`,
        readOnly: true,
      };
    },
  );

  const narrative = [
    `${organization.name} plans ${units.length} learning units`,
    `for mission "${organization.mission}"`,
    `(${units.map((u) => u.learningKind).join(" → ")})`,
  ].join(" ");

  return {
    organizationId: organization.id,
    kind: organization.kind,
    mission: organization.mission,
    unitCount: units.length,
    units: Object.freeze([...units]) as OrganizationPlanUnit[],
    narrative,
    readOnly: true,
  };
}
