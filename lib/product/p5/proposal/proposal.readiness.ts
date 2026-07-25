/**
 * Product P5 — AI proposal generation readiness
 */

import { PRODUCT_P4_REQUIREMENT_COLLECTION_ID } from "../../p4/questionnaire/questionnaire.constants";
import { listProposalBuilds } from "../proposal-builder/builder.registry";
import { listProposalTemplates } from "../proposal-template/template.registry";
import { listDifferentiators } from "../differentiator/differentiator.registry";
import { listExecutiveSummaries } from "../executive-summary/summary.registry";
import { PRODUCT_P5_AI_PROPOSAL_GENERATION_BASE } from "./proposal.constants";
import { listProposals } from "./proposal.registry";
import type { P5ReadinessCheck, P5ReadinessResult } from "./proposal.types";
import { listProposalSections } from "../section-generator/section.registry";
import { listSolutionOverviews } from "../solution-overview/overview.registry";

function nowIso(): string {
  return new Date().toISOString();
}

function check(
  id: string,
  component: string,
  label: string,
  ok: boolean,
  detail: string,
): P5ReadinessCheck {
  return { id, component, label, ok, detail };
}

export function evaluateP5AiProposalGenerationReadiness(): P5ReadinessResult {
  const checks: P5ReadinessCheck[] = [];

  checks.push(
    check(
      "P5-BASE",
      "foundation",
      "P4 requirement collection baseline aligned",
      PRODUCT_P5_AI_PROPOSAL_GENERATION_BASE ===
        PRODUCT_P4_REQUIREMENT_COLLECTION_ID,
      `base=${PRODUCT_P5_AI_PROPOSAL_GENERATION_BASE}`,
    ),
  );

  const templates = listProposalTemplates();
  checks.push(
    check(
      "P5-TMPL",
      "proposal-template",
      "Proposal templates present",
      templates.length >= 1,
      `templates=${templates.length}`,
    ),
  );

  const proposals = listProposals();
  checks.push(
    check(
      "P5-PRP",
      "proposal",
      "Proposals present",
      proposals.length >= 1,
      `proposals=${proposals.length}`,
    ),
  );

  const builds = listProposalBuilds();
  checks.push(
    check(
      "P5-BLD",
      "proposal-builder",
      "Proposal builds complete",
      builds.some((b) => b.status === "COMPLETE"),
      `builds=${builds.length}`,
    ),
  );

  const sections = listProposalSections();
  checks.push(
    check(
      "P5-SEC",
      "section-generator",
      "Proposal sections present",
      sections.length >= 1,
      `sections=${sections.length}`,
    ),
  );

  const summaries = listExecutiveSummaries();
  checks.push(
    check(
      "P5-SUM",
      "executive-summary",
      "Executive summaries present",
      summaries.length >= 1,
      `summaries=${summaries.length}`,
    ),
  );

  const overviews = listSolutionOverviews();
  checks.push(
    check(
      "P5-OVW",
      "solution-overview",
      "Solution overviews present",
      overviews.length >= 1,
      `overviews=${overviews.length}`,
    ),
  );

  const differentiators = listDifferentiators();
  checks.push(
    check(
      "P5-DIF",
      "differentiator",
      "Differentiators present",
      differentiators.length >= 1,
      `differentiators=${differentiators.length}`,
    ),
  );

  const readyOrDelivered = proposals.some(
    (p) => p.status === "READY" || p.status === "DELIVERED",
  );
  checks.push(
    check(
      "P5-LIFE",
      "proposal",
      "Proposal lifecycle advanced to ready",
      readyOrDelivered,
      `advanced=${readyOrDelivered}`,
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
    summary: `p5-ai-proposal-generation readiness ${verdict.toLowerCase()}: pass=${passCount} fail=${failCount}`,
    evaluatedAt: nowIso(),
  };
}

export function assertP5AiProposalGenerationReadinessReady(
  result: P5ReadinessResult,
): asserts result is P5ReadinessResult & { verdict: "READY" } {
  if (result.verdict !== "READY") {
    throw new Error(
      `p5 ai proposal generation not ready: ${result.summary}`,
    );
  }
}
