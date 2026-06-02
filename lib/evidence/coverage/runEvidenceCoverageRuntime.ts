import type {
  EvidenceCoverageRuntimeInput,
  EvidenceCoverageRuntimeResult,
} from "../types";
import { COVERAGE_RUNTIME_VERSION } from "../types";
import { analyzeRequirementCoverage } from "./analyzeCoverage";
import { appendCoverageEvent, createCoverageTrace } from "./coverageTrace";
import { buildCoverageSummary, buildTenderValidation } from "./buildTenderValidation";
import { buildRequirementCoverageResult } from "./resolveCoverageStatus";
import { toLegacyCoverageRecords, toLegacyCoverageSummary } from "./toLegacyCoverage";

function newCoverageRunId() {
  return `ecr-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

/**
 * V3.4-E4 Evidence Coverage Runtime
 *
 * Evidence Match → Coverage Analysis → Coverage Status → Tender Validation
 */
export function runEvidenceCoverageRuntime(
  input: EvidenceCoverageRuntimeInput,
): EvidenceCoverageRuntimeResult {
  const started = Date.now();
  const runId = input.runId || input.linking.runId || newCoverageRunId();
  const ranAt = new Date().toISOString();
  let trace = createCoverageTrace(runId);

  trace = appendCoverageEvent(trace, "analyze", "开始覆盖分析");

  const linkingById = new Map(
    input.linking.results.map((r) => [r.requirementId, r]),
  );

  const requirements: EvidenceCoverageRuntimeResult["requirements"] = [];

  for (const req of input.requirements) {
    const linkingResult = linkingById.get(req.id) || {
      requirementId: req.id,
      requirementTitle: req.title,
      mapping: {
        requirementId: req.id,
        keywords: req.keywords,
        expandedTerms: req.keywords,
        sources: [],
      },
      matches: [],
      bestScore: 0,
      coverageLevel: "unsupported" as const,
      coverageNotes: [],
    };

    trace = appendCoverageEvent(
      trace,
      "analyze",
      `分析需求 ${req.id}`,
      req.id,
      { matches: linkingResult.matches.length },
    );

    const analysis = analyzeRequirementCoverage(req, linkingResult);
    const result = buildRequirementCoverageResult(req, analysis, input.policy);

    trace = appendCoverageEvent(
      trace,
      "resolve_status",
      `状态 ${result.status}`,
      req.id,
      { bestScore: analysis.bestScore, legacy: result.legacyLevel },
    );

    requirements.push(result);
  }

  const summary = buildCoverageSummary(requirements);
  trace = appendCoverageEvent(trace, "validate", "招标证据校验", undefined, {
    coverageRatio: summary.coverageRatio,
    score: summary.validationScore,
  });

  const validation = buildTenderValidation(requirements, summary, input.policy);
  trace = appendCoverageEvent(trace, "validate", `校验结论 ${validation.verdict}`);

  const legacyCoverage = toLegacyCoverageRecords(requirements);
  const legacySummary = toLegacyCoverageSummary(legacyCoverage);

  return {
    version: COVERAGE_RUNTIME_VERSION,
    runId,
    ranAt,
    durationMs: Date.now() - started,
    requirements,
    summary,
    validation,
    legacyCoverage,
    legacySummary,
    trace,
  };
}
