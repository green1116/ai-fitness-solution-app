import type {
  BuildRuntimeCorrelationInput,
  RuntimeCorrelationEdge,
  RuntimeCorrelationImpact,
  RuntimeCorrelationPackage,
  RuntimeNodeType,
} from "../types";
import { RUNTIME_CORRELATION_INTELLIGENCE_VERSION } from "../types";
import { formatRuntimeCorrelationDebug } from "../debug/runtimeCorrelationDebug";
import {
  auditPassed,
  governancePassed,
  hasCriticalCompliance,
  ocrTraceabilityComplete,
} from "../runtime/buildExecutiveFindings";

let edgeSeq = 0;

function edge(
  source: RuntimeNodeType,
  target: RuntimeNodeType,
  reason: string,
  impact: RuntimeCorrelationImpact,
): RuntimeCorrelationEdge {
  edgeSeq += 1;
  return {
    source,
    target,
    reason,
    impact,
    deterministic: true,
  };
}

function buildDependencyEdges(input: BuildRuntimeCorrelationInput): RuntimeCorrelationEdge[] {
  edgeSeq = 0;
  const edges: RuntimeCorrelationEdge[] = [];
  const cov = input.coverageRuntime;
  const val = input.tenderValidation;
  const audit = input.tenderAudit;
  const gov = input.tenderGovernance;
  const oversight = input.executiveOversight;
  const gate = input.executiveApprovalGate;
  const release = input.executiveReleaseSurface;

  const weakOcr = !ocrTraceabilityComplete(input);
  const mandatoryMissing = (cov?.summary.mandatoryMissing ?? 0) > 0;
  const partialCoverage = (cov?.summary.partial ?? 0) > 0 || (cov?.summary.missing ?? 0) > 0;
  const validationUnresolved =
    val?.outcome === "conditional" ||
    val?.outcome === "rejected" ||
    (val?.complianceChecks.some((c) => !c.passed) ?? false);
  const auditBlocked = audit?.governanceStatus === "blocked";
  const auditReview = audit?.governanceStatus === "review_required";
  const govFailed = !governancePassed(input);
  const criticalCompliance = hasCriticalCompliance(input);

  // OCR → downstream
  if (weakOcr) {
    edges.push(
      edge(
        "ocr",
        "coverage",
        "Weak OCR traceability reduces evidence-to-requirement linkage confidence",
        "high",
      ),
    );
    edges.push(
      edge(
        "ocr",
        "validation",
        "Incomplete OCR coordinates block acceptance trace verification",
        "moderate",
      ),
    );
    edges.push(
      edge(
        "ocr",
        "executive",
        "OCR traceability gap lowers executive score weighting",
        "moderate",
      ),
    );
  }

  // Coverage → downstream
  if (mandatoryMissing) {
    edges.push(
      edge(
        "coverage",
        "validation",
        "Missing mandatory evidence triggers validation failure",
        "critical",
      ),
    );
    edges.push(
      edge(
        "coverage",
        "governance",
        "Mandatory coverage gap fails governance control",
        "critical",
      ),
    );
    edges.push(
      edge(
        "coverage",
        "executive",
        "Critical evidence gap surfaces in executive findings",
        "critical",
      ),
    );
    edges.push(
      edge(
        "coverage",
        "gate",
        "Missing critical evidence blocks release gate",
        "critical",
      ),
    );
  } else if (partialCoverage) {
    edges.push(
      edge(
        "coverage",
        "validation",
        "Partial coverage yields conditional validation outcome",
        "moderate",
      ),
    );
    edges.push(
      edge(
        "coverage",
        "executive",
        "Partial evidence gaps constrain executive approval",
        "moderate",
      ),
    );
  }

  // Validation → downstream
  if (validationUnresolved) {
    edges.push(
      edge(
        "validation",
        "audit",
        "Unresolved validation issues elevate audit governance risk",
        "high",
      ),
    );
    edges.push(
      edge(
        "validation",
        "governance",
        "Validation gate inconsistency fails governance alignment",
        "high",
      ),
    );
    edges.push(
      edge(
        "validation",
        "executive",
        "Validation inconsistency requires executive review",
        "high",
      ),
    );
    edges.push(
      edge(
        "validation",
        "gate",
        "Unresolved validation blocks unconditional release",
        "high",
      ),
    );
  }

  if (criticalCompliance) {
    edges.push(
      edge(
        "validation",
        "executive",
        "Critical compliance issue forces executive reject path",
        "critical",
      ),
    );
  }

  // Audit → downstream
  if (auditBlocked) {
    edges.push(
      edge(
        "audit",
        "governance",
        "Blocked audit status prevents governance proceed posture",
        "critical",
      ),
    );
    edges.push(
      edge(
        "audit",
        "executive",
        "Audit failure propagates to executive denial",
        "critical",
      ),
    );
    edges.push(
      edge(
        "audit",
        "gate",
        "Failed audit triggers release gate block",
        "critical",
      ),
    );
  } else if (auditReview) {
    edges.push(
      edge(
        "audit",
        "governance",
        "Audit review_required escalates governance posture",
        "moderate",
      ),
    );
    edges.push(
      edge(
        "audit",
        "executive",
        "Audit review flag contributes to conditional executive path",
        "moderate",
      ),
    );
  }

  // Governance → executive / gate
  if (govFailed) {
    edges.push(
      edge(
        "governance",
        "executive",
        "Governance halt or hold blocks executive approval",
        "critical",
      ),
    );
    edges.push(
      edge(
        "governance",
        "gate",
        "Governance failure triggers release gate block",
        "critical",
      ),
    );
  } else if (gov?.posture === "escalate" || gov?.posture === "hold") {
    edges.push(
      edge(
        "governance",
        "executive",
        "Governance escalation requires executive conditional approval",
        "moderate",
      ),
    );
  }

  // Executive oversight → gate / release
  if (oversight?.recommendation === "reject") {
    edges.push(
      edge(
        "executive",
        "gate",
        "Executive oversight reject maps to gate block-release",
        "critical",
      ),
    );
  } else if (
    oversight?.recommendation === "conditional-approve" ||
    oversight?.recommendation === "review-required"
  ) {
    edges.push(
      edge(
        "executive",
        "gate",
        "Executive conditional path maps to conditional-release gate",
        "high",
      ),
    );
  } else if (oversight?.recommendation === "approve") {
    edges.push(
      edge(
        "executive",
        "gate",
        "Executive approve enables gate release path",
        "low",
      ),
    );
  }

  // Gate → release
  if (gate) {
    if (gate.recommendation === "block-release" || gate.status === "blocked") {
      edges.push(
        edge(
          "gate",
          "release",
          "Gate block-release denies tender package release",
          "critical",
        ),
      );
    } else if (
      gate.recommendation === "conditional-release" ||
      gate.status === "conditional"
    ) {
      edges.push(
        edge(
          "gate",
          "release",
          "Gate conditional-release holds package until conditions met",
          "high",
        ),
      );
    } else if (gate.recommendation === "release") {
      edges.push(
        edge(
          "gate",
          "release",
          "Gate release authorizes tender package surface",
          "low",
        ),
      );
    }
  }

  if (release && !release.releasable && gate?.recommendation !== "release") {
    edges.push(
      edge(
        "gate",
        "release",
        "Non-releasable surface confirms gate-to-release block chain",
        "critical",
      ),
    );
  }

  return edges;
}

function uniqueAffectedNodes(edges: RuntimeCorrelationEdge[]): number {
  const nodes = new Set<RuntimeNodeType>();
  for (const e of edges) {
    nodes.add(e.source);
    nodes.add(e.target);
  }
  return nodes.size;
}

function buildCriticalPaths(edges: RuntimeCorrelationEdge[]): string[] {
  const paths: string[] = [];
  const criticalEdges = edges.filter((e) => e.impact === "critical");

  const chains: string[][] = [
    ["ocr", "coverage", "validation", "audit", "governance", "executive", "gate", "release"],
    ["coverage", "validation", "governance", "executive", "gate", "release"],
    ["validation", "audit", "governance", "gate", "release"],
    ["governance", "executive", "gate", "release"],
    ["executive", "gate", "release"],
  ];

  for (const chain of chains) {
    const active = chain.filter((node) =>
      criticalEdges.some(
        (e) =>
          (e.source === node || e.target === node) &&
          chain.indexOf(e.source) >= 0 &&
          chain.indexOf(e.target) >= 0 &&
          chain.indexOf(e.source) < chain.indexOf(e.target),
      ),
    );
    if (active.length >= 2) {
      paths.push(active.join(" → "));
    }
  }

  if (criticalEdges.some((e) => e.source === "coverage" && e.target === "gate")) {
    paths.push("coverage → validation → governance → executive → gate → release");
  }

  if (criticalEdges.some((e) => e.source === "audit" && e.target === "gate")) {
    paths.push("audit → governance → executive → gate → release");
  }

  return [...new Set(paths)].slice(0, 8);
}

function buildCorrelationWarnings(edges: RuntimeCorrelationEdge[]): string[] {
  const warnings: string[] = [];

  for (const e of edges.filter((x) => x.impact === "critical" || x.impact === "high")) {
    warnings.push(`[${e.impact}] ${e.source} → ${e.target}: ${e.reason}`);
  }

  if (edges.filter((e) => e.source === "ocr").length >= 2) {
    warnings.push("OCR traceability issues cascade across multiple runtimes");
  }

  if (
    edges.some((e) => e.source === "governance" && e.target === "gate" && e.impact === "critical")
  ) {
    warnings.push("Governance failure will trigger release block (deterministic)");
  }

  if (edges.some((e) => e.source === "validation" && e.target === "audit")) {
    warnings.push("Validation issues correlate with elevated audit risk");
  }

  return [...new Set(warnings)].slice(0, 15);
}

/**
 * V3.4-E13 — 确定性跨 Runtime 关联图（无 AI 因果推断）
 */
export function buildRuntimeCorrelation(
  input: BuildRuntimeCorrelationInput,
): RuntimeCorrelationPackage {
  const edges = buildDependencyEdges(input);
  const affectedRuntimeCount = uniqueAffectedNodes(edges);
  const criticalPaths = buildCriticalPaths(edges);
  const correlationWarnings = buildCorrelationWarnings(edges);

  const result = {
    edges,
    affectedRuntimeCount,
    criticalPaths,
    correlationWarnings,
  };

  const debug = formatRuntimeCorrelationDebug(result);

  return {
    version: RUNTIME_CORRELATION_INTELLIGENCE_VERSION,
    ...result,
    debug,
  };
}
