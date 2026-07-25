/**
 * Product P4 — Requirement collection readiness
 */

import { PRODUCT_P3_AI_PROJECT_CREATION_ID } from "../../p3/project/project.constants";
import { listBudgetTargets } from "../budget-target/budget.registry";
import { listConstraints } from "../constraint/constraint.registry";
import { listEquipmentPreferences } from "../equipment-preference/equipment.registry";
import {
  PRODUCT_P4_REQUIREMENT_COLLECTION_BASE,
} from "../questionnaire/questionnaire.constants";
import { listQuestionnaires } from "../questionnaire/questionnaire.registry";
import type {
  P4ReadinessCheck,
  P4ReadinessResult,
} from "../questionnaire/questionnaire.types";
import { listRequirementValidations } from "../requirement-validation/validation.registry";
import { listSpaceAnalyses } from "../space-analysis/space.registry";
import { listStakeholders } from "../stakeholder/stakeholder.registry";
import { listSurveys } from "../survey/survey.registry";

function nowIso(): string {
  return new Date().toISOString();
}

function check(
  id: string,
  component: string,
  label: string,
  ok: boolean,
  detail: string,
): P4ReadinessCheck {
  return { id, component, label, ok, detail };
}

export function evaluateP4RequirementCollectionReadiness(): P4ReadinessResult {
  const checks: P4ReadinessCheck[] = [];

  checks.push(
    check(
      "P4-BASE",
      "foundation",
      "P3 AI project creation baseline aligned",
      PRODUCT_P4_REQUIREMENT_COLLECTION_BASE ===
        PRODUCT_P3_AI_PROJECT_CREATION_ID,
      `base=${PRODUCT_P4_REQUIREMENT_COLLECTION_BASE}`,
    ),
  );

  const questionnaires = listQuestionnaires();
  checks.push(
    check(
      "P4-QNR",
      "questionnaire",
      "Questionnaires present",
      questionnaires.length >= 1,
      `questionnaires=${questionnaires.length}`,
    ),
  );

  const surveys = listSurveys();
  checks.push(
    check(
      "P4-SRV",
      "survey",
      "Surveys present",
      surveys.length >= 1,
      `surveys=${surveys.length}`,
    ),
  );

  const stakeholders = listStakeholders();
  checks.push(
    check(
      "P4-STK",
      "stakeholder",
      "Stakeholders present",
      stakeholders.length >= 1,
      `stakeholders=${stakeholders.length}`,
    ),
  );

  const constraints = listConstraints();
  checks.push(
    check(
      "P4-CST",
      "constraint",
      "Constraints present",
      constraints.length >= 1,
      `constraints=${constraints.length}`,
    ),
  );

  const spaces = listSpaceAnalyses();
  checks.push(
    check(
      "P4-SPC",
      "space-analysis",
      "Space analyses present",
      spaces.length >= 1,
      `spaceAnalyses=${spaces.length}`,
    ),
  );

  const equipment = listEquipmentPreferences();
  checks.push(
    check(
      "P4-EQP",
      "equipment-preference",
      "Equipment preferences present",
      equipment.length >= 1,
      `equipmentPreferences=${equipment.length}`,
    ),
  );

  const budgets = listBudgetTargets();
  checks.push(
    check(
      "P4-BUD",
      "budget-target",
      "Budget targets present",
      budgets.length >= 1,
      `budgetTargets=${budgets.length}`,
    ),
  );

  const validations = listRequirementValidations();
  const validationOk = validations.some(
    (v) => v.verdict === "PASS" || v.verdict === "WARN",
  );
  checks.push(
    check(
      "P4-VAL",
      "requirement-validation",
      "Requirement validation present",
      validationOk,
      `validations=${validations.length}`,
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
    summary: `p4-requirement-collection readiness ${verdict.toLowerCase()}: pass=${passCount} fail=${failCount}`,
    evaluatedAt: nowIso(),
  };
}

export function assertP4RequirementCollectionReadinessReady(
  result: P4ReadinessResult,
): asserts result is P4ReadinessResult & { verdict: "READY" } {
  if (result.verdict !== "READY") {
    throw new Error(
      `p4 requirement collection not ready: ${result.summary}`,
    );
  }
}
