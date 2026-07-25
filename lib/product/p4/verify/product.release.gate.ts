/**
 * Product P4 — Requirement Collection Release Gate
 * BASE: enterprise-product-p3-ai-project-creation-v1
 * Isolated — product layer only
 */

import { buildPlatformV1Manifest } from "../../../platform/v1/platform.manifest";
import { E12_PRODUCTIZATION_COMPLETE_ID } from "../../e12/signoff/governance.freeze.lock";
import { ENTERPRISE_LAUNCH_COMPLETE_ID } from "../../../launch/signoff/governance.freeze.lock";
import { ENTERPRISE_EVOLUTION_COMPLETE_ID } from "../../../evolution/signoff/governance.freeze.lock";
import { ENTERPRISE_COMMERCIALIZATION_COMPLETE_ID } from "../../../commercialization/p8/freeze/freeze.lock";
import { ENTERPRISE_LAUNCH_READINESS_COMPLETE_ID } from "../../../launch/readiness/l5/freeze/freeze.lock";
import { ENTERPRISE_OPERATIONS_COMPLETE_ID } from "../../../operations/o5/freeze/freeze.lock";
import { PRODUCT_P3_AI_PROJECT_CREATION_ID } from "../../p3/project/project.constants";
import {
  BUDGET_TARGET_STATUSES,
  CONSTRAINT_KINDS,
  EQUIPMENT_PREFERENCE_LEVELS,
  P4_MANAGER_STATUSES,
  P4_READINESS_VERDICTS,
  PRODUCT_P4_COLLECTION_FREEZE_VERSION,
  PRODUCT_P4_REQUIREMENT_COLLECTION_BASE,
  PRODUCT_P4_REQUIREMENT_COLLECTION_FREEZE_VERSION,
  PRODUCT_P4_REQUIREMENT_COLLECTION_ID,
  PRODUCT_P4_REQUIREMENT_COLLECTION_VERSION,
  QUESTIONNAIRE_STATUSES,
  SPACE_ANALYSIS_STATUSES,
  STAKEHOLDER_ROLES,
  SURVEY_STATUSES,
  VALIDATION_VERDICTS,
} from "../questionnaire/questionnaire.constants";
import {
  assertP4RequirementCollectionReadinessReady,
  clearP4RequirementCollectionLayer,
  createP4RequirementCollectionManager,
  getP4RegistryManifest,
} from "../requirement.manager";

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

export const PRODUCT_P4_SIGNOFF_VERSION = "product-p4-signoff-1" as const;

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
  clearP4RequirementCollectionLayer();
}

export function checkProductP4ReleaseGate(): ReleaseGateResult {
  const checks: GateCheckItem[] = [];

  checks.push(
    check(
      "P4-CONSTANTS",
      "questionnaire",
      "Product P4 requirement collection version constants",
      PRODUCT_P4_REQUIREMENT_COLLECTION_ID ===
        "enterprise-product-p4-requirement-collection-v1" &&
        PRODUCT_P4_REQUIREMENT_COLLECTION_VERSION === "product-p4-1" &&
        PRODUCT_P4_REQUIREMENT_COLLECTION_BASE ===
          PRODUCT_P3_AI_PROJECT_CREATION_ID &&
        PRODUCT_P4_REQUIREMENT_COLLECTION_FREEZE_VERSION ===
          "product-p4-requirement-collection-freeze-1" &&
        PRODUCT_P4_COLLECTION_FREEZE_VERSION ===
          "product-p4-requirement-collection-freeze-1" &&
        QUESTIONNAIRE_STATUSES.length === 4 &&
        SURVEY_STATUSES.length === 4 &&
        STAKEHOLDER_ROLES.length === 6 &&
        CONSTRAINT_KINDS.length === 5 &&
        SPACE_ANALYSIS_STATUSES.length === 3 &&
        EQUIPMENT_PREFERENCE_LEVELS.length === 4 &&
        BUDGET_TARGET_STATUSES.length === 4 &&
        VALIDATION_VERDICTS.length === 3 &&
        P4_READINESS_VERDICTS.length === 3 &&
        P4_MANAGER_STATUSES.length === 4,
      `id=${PRODUCT_P4_REQUIREMENT_COLLECTION_ID} base=${PRODUCT_P4_REQUIREMENT_COLLECTION_BASE}`,
    ),
  );

  const platform = buildPlatformV1Manifest();
  checks.push(
    check(
      "P4-PLATFORM",
      "platform-v1",
      "Platform v1 baseline aligned",
      platform.aligned === true,
      platform.summary,
    ),
  );

  checks.push(
    check(
      "P4-P3-BASE",
      "product-p3",
      "P3 AI project creation BASE preserved",
      PRODUCT_P4_REQUIREMENT_COLLECTION_BASE ===
        "enterprise-product-p3-ai-project-creation-v1" &&
        ENTERPRISE_OPERATIONS_COMPLETE_ID ===
          "enterprise-operations-complete-v1" &&
        ENTERPRISE_LAUNCH_READINESS_COMPLETE_ID ===
          "enterprise-launch-readiness-complete-v1" &&
        ENTERPRISE_COMMERCIALIZATION_COMPLETE_ID ===
          "enterprise-commercialization-complete-v1",
      `base=${PRODUCT_P4_REQUIREMENT_COLLECTION_BASE}`,
    ),
  );

  checks.push(
    check(
      "P4-UPSTREAM",
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
    const mgr = createP4RequirementCollectionManager({
      managerId: "prod-p4-gate",
    });
    mgr.initialize();
    mgr.start();

    const projectRef = "acme-ai-coaching";
    const questionnaire = mgr.registerQuestionnaire({
      id: "p4.gate.qnr",
      projectRef,
      title: "Acme Requirement Intake",
      questionCount: 12,
    });
    mgr.updateQuestionnaireStatus({
      questionnaireId: questionnaire.id,
      status: "PUBLISHED",
    });
    const survey = mgr.submitSurvey({
      id: "p4.gate.srv",
      questionnaireId: questionnaire.id,
      respondent: "coach.alex",
      responseCount: 12,
    });
    mgr.updateSurveyStatus({
      surveyId: survey.id,
      status: "REVIEWED",
    });
    mgr.registerStakeholder({
      id: "p4.gate.stk",
      projectRef,
      name: "Jordan Lee",
      email: "jordan@acme.test",
      role: "SPONSOR",
    });
    mgr.captureConstraint({
      id: "p4.gate.cst",
      projectRef,
      kind: "SPACE",
      title: "Ceiling height limit",
      description: "Max 3.2m clear height in downtown site",
      severity: 4,
    });
    mgr.analyzeSpace({
      id: "p4.gate.spc",
      projectRef,
      siteLabel: "Acme Downtown",
      areaSqm: 850,
      usableRatio: 78,
    });
    mgr.recordEquipmentPreference({
      id: "p4.gate.eqp",
      projectRef,
      equipmentKey: "cable-machine",
      level: "REQUIRED",
      notes: "Must support AI form cues",
    });
    const budget = mgr.setBudgetTarget({
      id: "p4.gate.bud",
      projectRef,
      currency: "USD",
      amount: 250000,
    });
    mgr.updateBudgetTargetStatus({
      budgetId: budget.id,
      status: "APPROVED",
    });
    const validation = mgr.validateRequirements({
      id: "p4.gate.val",
      projectRef,
    });

    const readiness = mgr.evaluateReadiness();
    const registry = getP4RegistryManifest();

    const ok =
      (validation.verdict === "PASS" || validation.verdict === "WARN") &&
      readiness.verdict === "READY" &&
      registry.foundationId === PRODUCT_P4_REQUIREMENT_COLLECTION_ID &&
      registry.base === PRODUCT_P4_REQUIREMENT_COLLECTION_BASE &&
      registry.questionnaireCount >= 1 &&
      registry.surveyCount >= 1 &&
      registry.stakeholderCount >= 1 &&
      registry.constraintCount >= 1 &&
      registry.spaceAnalysisCount >= 1 &&
      registry.equipmentPreferenceCount >= 1 &&
      registry.budgetTargetCount >= 1 &&
      registry.validationCount >= 1;

    try {
      assertP4RequirementCollectionReadinessReady(readiness);
      checks.push(
        check(
          "P4-STACK",
          "collection",
          "Questionnaire / survey / stakeholder / constraint / space / equipment / budget / validation",
          ok,
          `verdict=${validation.verdict} readiness=${readiness.verdict}`,
        ),
      );
    } catch (error) {
      checks.push(
        check(
          "P4-STACK",
          "collection",
          "Questionnaire / survey / stakeholder / constraint / space / equipment / budget / validation",
          false,
          error instanceof Error
            ? error.message
            : "p4 requirement collection not ready",
        ),
      );
    }

    mgr.stop();
    cleanup();
  } catch (error) {
    checks.push(
      check(
        "P4-STACK",
        "collection",
        "Questionnaire / survey / stakeholder / constraint / space / equipment / budget / validation",
        false,
        error instanceof Error
          ? error.message
          : "p4 requirement collection probe failed",
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
      `product-p4-gate result=${result}`,
      `pass=${passCount}/${checks.length}`,
      `fail=${failCount}`,
    ].join(" "),
  };
}

export function assertProductP4ReleaseGatePass(
  gate: ReleaseGateResult = checkProductP4ReleaseGate(),
): asserts gate is ReleaseGateResult & { result: "PASS" } {
  if (gate.result !== "PASS") {
    throw new Error(`Product P4 release gate failed: ${gate.summary}`);
  }
}
