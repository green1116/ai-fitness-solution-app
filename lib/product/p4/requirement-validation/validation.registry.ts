/**
 * Product P4 — Requirement validation registry
 */

import { listBudgetTargets } from "../budget-target/budget.registry";
import { listConstraints } from "../constraint/constraint.registry";
import { listEquipmentPreferences } from "../equipment-preference/equipment.registry";
import { listQuestionnaires } from "../questionnaire/questionnaire.registry";
import { listSpaceAnalyses } from "../space-analysis/space.registry";
import { listStakeholders } from "../stakeholder/stakeholder.registry";
import { listSurveys } from "../survey/survey.registry";
import type {
  RequirementValidation,
  ValidateRequirementsInput,
  ValidationVerdict,
} from "./validation.types";

const validations = new Map<string, RequirementValidation>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function cloneValidation(
  validation: RequirementValidation,
): RequirementValidation {
  return {
    ...validation,
    issues: [...validation.issues],
    metadata: { ...validation.metadata },
  };
}

export function validateRequirements(
  input: ValidateRequirementsInput,
): RequirementValidation {
  const projectRef = input.projectRef.trim();
  if (!projectRef) throw new Error("validation.projectRef is required");

  const issues: string[] = [];
  let score = 0;

  if (listQuestionnaires({ projectRef }).length >= 1) score += 15;
  else issues.push("missing-questionnaire");

  if (listSurveys().some((s) => {
    const q = listQuestionnaires({ projectRef }).find(
      (qq) => qq.id === s.questionnaireId,
    );
    return Boolean(q);
  })) {
    score += 15;
  } else {
    issues.push("missing-survey");
  }

  if (listStakeholders({ projectRef }).length >= 1) score += 10;
  else issues.push("missing-stakeholder");

  if (listConstraints({ projectRef }).length >= 1) score += 15;
  else issues.push("missing-constraint");

  if (listSpaceAnalyses({ projectRef }).length >= 1) score += 15;
  else issues.push("missing-space-analysis");

  if (listEquipmentPreferences({ projectRef }).length >= 1) score += 15;
  else issues.push("missing-equipment-preference");

  if (listBudgetTargets({ projectRef }).length >= 1) score += 15;
  else issues.push("missing-budget-target");

  const verdict: ValidationVerdict =
    issues.length === 0 ? "PASS" : score >= 50 ? "WARN" : "FAIL";

  const id = input.id?.trim() || createId("p4val");
  if (validations.has(id)) {
    throw new Error(`requirement validation already exists: ${id}`);
  }

  const validation: RequirementValidation = {
    id,
    projectRef,
    verdict,
    score,
    issues,
    detail: `verdict=${verdict} score=${score} issues=${issues.length}`,
    metadata: { ...(input.metadata ?? {}) },
    validatedAt: nowIso(),
  };
  validations.set(id, validation);
  return cloneValidation(validation);
}

export function getRequirementValidation(
  id: string,
): RequirementValidation | undefined {
  const validation = validations.get(id.trim());
  return validation ? cloneValidation(validation) : undefined;
}

export function listRequirementValidations(filter?: {
  projectRef?: string;
  verdict?: ValidationVerdict;
}): RequirementValidation[] {
  let result = [...validations.values()];
  if (filter?.projectRef) {
    const pref = filter.projectRef.trim();
    result = result.filter((v) => v.projectRef === pref);
  }
  if (filter?.verdict) {
    result = result.filter((v) => v.verdict === filter.verdict);
  }
  return result
    .slice()
    .sort((a, b) => a.id.localeCompare(b.id))
    .map(cloneValidation);
}

export function clearRequirementValidations(): void {
  validations.clear();
}
