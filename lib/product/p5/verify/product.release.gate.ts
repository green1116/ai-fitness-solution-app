/**
 * Product P5 — AI Proposal Generation Release Gate
 * BASE: enterprise-product-p4-requirement-collection-v1
 * Isolated — product layer only
 */

import { buildPlatformV1Manifest } from "../../../platform/v1/platform.manifest";
import { E12_PRODUCTIZATION_COMPLETE_ID } from "../../e12/signoff/governance.freeze.lock";
import { ENTERPRISE_LAUNCH_COMPLETE_ID } from "../../../launch/signoff/governance.freeze.lock";
import { ENTERPRISE_EVOLUTION_COMPLETE_ID } from "../../../evolution/signoff/governance.freeze.lock";
import { ENTERPRISE_COMMERCIALIZATION_COMPLETE_ID } from "../../../commercialization/p8/freeze/freeze.lock";
import { ENTERPRISE_LAUNCH_READINESS_COMPLETE_ID } from "../../../launch/readiness/l5/freeze/freeze.lock";
import { ENTERPRISE_OPERATIONS_COMPLETE_ID } from "../../../operations/o5/freeze/freeze.lock";
import { PRODUCT_P4_REQUIREMENT_COLLECTION_ID } from "../../p4/questionnaire/questionnaire.constants";
import {
  BUILDER_STATUSES,
  GENERATOR_STATUSES,
  P5_MANAGER_STATUSES,
  P5_READINESS_VERDICTS,
  PRODUCT_P5_AI_PROPOSAL_GENERATION_BASE,
  PRODUCT_P5_AI_PROPOSAL_GENERATION_FREEZE_VERSION,
  PRODUCT_P5_AI_PROPOSAL_GENERATION_ID,
  PRODUCT_P5_AI_PROPOSAL_GENERATION_VERSION,
  PRODUCT_P5_PROPOSAL_FREEZE_VERSION,
  PROPOSAL_SECTION_KINDS,
  PROPOSAL_STATUSES,
  PROPOSAL_TEMPLATE_KINDS,
} from "../proposal/proposal.constants";
import {
  assertP5AiProposalGenerationReadinessReady,
  clearP5AiProposalGenerationLayer,
  createP5AiProposalManager,
  getP5RegistryManifest,
} from "../proposal.manager";

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

export const PRODUCT_P5_SIGNOFF_VERSION = "product-p5-signoff-1" as const;

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
  clearP5AiProposalGenerationLayer();
}

export function checkProductP5ReleaseGate(): ReleaseGateResult {
  const checks: GateCheckItem[] = [];

  checks.push(
    check(
      "P5-CONSTANTS",
      "proposal",
      "Product P5 AI proposal generation version constants",
      PRODUCT_P5_AI_PROPOSAL_GENERATION_ID ===
        "enterprise-product-p5-ai-proposal-generation-v1" &&
        PRODUCT_P5_AI_PROPOSAL_GENERATION_VERSION === "product-p5-1" &&
        PRODUCT_P5_AI_PROPOSAL_GENERATION_BASE ===
          PRODUCT_P4_REQUIREMENT_COLLECTION_ID &&
        PRODUCT_P5_AI_PROPOSAL_GENERATION_FREEZE_VERSION ===
          "product-p5-ai-proposal-generation-freeze-1" &&
        PRODUCT_P5_PROPOSAL_FREEZE_VERSION ===
          "product-p5-ai-proposal-generation-freeze-1" &&
        PROPOSAL_STATUSES.length === 5 &&
        PROPOSAL_TEMPLATE_KINDS.length === 5 &&
        PROPOSAL_SECTION_KINDS.length === 6 &&
        BUILDER_STATUSES.length === 4 &&
        GENERATOR_STATUSES.length === 3 &&
        P5_READINESS_VERDICTS.length === 3 &&
        P5_MANAGER_STATUSES.length === 4,
      `id=${PRODUCT_P5_AI_PROPOSAL_GENERATION_ID} base=${PRODUCT_P5_AI_PROPOSAL_GENERATION_BASE}`,
    ),
  );

  const platform = buildPlatformV1Manifest();
  checks.push(
    check(
      "P5-PLATFORM",
      "platform-v1",
      "Platform v1 baseline aligned",
      platform.aligned === true,
      platform.summary,
    ),
  );

  checks.push(
    check(
      "P5-P4-BASE",
      "product-p4",
      "P4 requirement collection BASE preserved",
      PRODUCT_P5_AI_PROPOSAL_GENERATION_BASE ===
        "enterprise-product-p4-requirement-collection-v1" &&
        ENTERPRISE_OPERATIONS_COMPLETE_ID ===
          "enterprise-operations-complete-v1" &&
        ENTERPRISE_LAUNCH_READINESS_COMPLETE_ID ===
          "enterprise-launch-readiness-complete-v1" &&
        ENTERPRISE_COMMERCIALIZATION_COMPLETE_ID ===
          "enterprise-commercialization-complete-v1",
      `base=${PRODUCT_P5_AI_PROPOSAL_GENERATION_BASE}`,
    ),
  );

  checks.push(
    check(
      "P5-UPSTREAM",
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
    const mgr = createP5AiProposalManager({ managerId: "prod-p5-gate" });
    mgr.initialize();
    mgr.start();

    const template = mgr.registerTemplate({
      id: "p5.gate.tmpl",
      kind: "ENTERPRISE",
      name: "Enterprise AI Fitness Proposal",
      description: "Standard enterprise proposal template",
    });
    const proposal = mgr.createProposal({
      id: "p5.gate.prp",
      projectRef: "acme-ai-coaching",
      title: "Acme AI Coaching Proposal",
      owner: "ae.sam",
      templateId: template.id,
    });
    mgr.updateProposalStatus({
      proposalId: proposal.id,
      status: "BUILDING",
    });
    const build = mgr.startBuild({
      id: "p5.gate.bld",
      proposalId: proposal.id,
    });
    const summary = mgr.createExecutiveSummary({
      id: "p5.gate.sum",
      proposalId: proposal.id,
      headline: "Accelerate coach productivity with AI",
      narrative: "Deploy AI coaching workflows across Acme sites.",
      keyPoints: ["Faster programming", "Higher retention"],
    });
    const overview = mgr.createSolutionOverview({
      id: "p5.gate.ovw",
      proposalId: proposal.id,
      approach: "Phased AI rollout with coach console",
      capabilities: ["Program generation", "Form cues"],
      outcomes: ["Activation ≥ 80%"],
    });
    const differentiator = mgr.createDifferentiator({
      id: "p5.gate.dif",
      proposalId: proposal.id,
      title: "Fitness-native AI stack",
      claim: "Purpose-built for enterprise gym operations",
      evidence: ["Domain models", "Coach workflows"],
    });
    const sec1 = mgr.generateSection({
      id: "p5.gate.sec1",
      proposalId: proposal.id,
      kind: "EXECUTIVE_SUMMARY",
      title: "Executive Summary",
      body: summary.narrative,
    });
    const sec2 = mgr.generateSection({
      id: "p5.gate.sec2",
      proposalId: proposal.id,
      kind: "SOLUTION_OVERVIEW",
      title: "Solution Overview",
      body: overview.approach,
    });
    const sec3 = mgr.generateSection({
      id: "p5.gate.sec3",
      proposalId: proposal.id,
      kind: "DIFFERENTIATOR",
      title: "Why Us",
      body: differentiator.claim,
    });
    mgr.completeBuild({
      buildId: build.id,
      sectionIds: [sec1.id, sec2.id, sec3.id],
    });
    mgr.updateProposalStatus({
      proposalId: proposal.id,
      status: "READY",
    });

    const readiness = mgr.evaluateReadiness();
    const registry = getP5RegistryManifest();

    const ok =
      readiness.verdict === "READY" &&
      registry.foundationId === PRODUCT_P5_AI_PROPOSAL_GENERATION_ID &&
      registry.base === PRODUCT_P5_AI_PROPOSAL_GENERATION_BASE &&
      registry.proposalCount >= 1 &&
      registry.templateCount >= 1 &&
      registry.builderCount >= 1 &&
      registry.sectionCount >= 3 &&
      registry.executiveSummaryCount >= 1 &&
      registry.solutionOverviewCount >= 1 &&
      registry.differentiatorCount >= 1;

    try {
      assertP5AiProposalGenerationReadinessReady(readiness);
      checks.push(
        check(
          "P5-STACK",
          "proposal",
          "Template / proposal / builder / sections / summary / overview / differentiator",
          ok,
          `readiness=${readiness.verdict} sections=${registry.sectionCount}`,
        ),
      );
    } catch (error) {
      checks.push(
        check(
          "P5-STACK",
          "proposal",
          "Template / proposal / builder / sections / summary / overview / differentiator",
          false,
          error instanceof Error
            ? error.message
            : "p5 ai proposal generation not ready",
        ),
      );
    }

    mgr.stop();
    cleanup();
  } catch (error) {
    checks.push(
      check(
        "P5-STACK",
        "proposal",
        "Template / proposal / builder / sections / summary / overview / differentiator",
        false,
        error instanceof Error
          ? error.message
          : "p5 ai proposal generation probe failed",
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
      `product-p5-gate result=${result}`,
      `pass=${passCount}/${checks.length}`,
      `fail=${failCount}`,
    ].join(" "),
  };
}

export function assertProductP5ReleaseGatePass(
  gate: ReleaseGateResult = checkProductP5ReleaseGate(),
): asserts gate is ReleaseGateResult & { result: "PASS" } {
  if (gate.result !== "PASS") {
    throw new Error(`Product P5 release gate failed: ${gate.summary}`);
  }
}
