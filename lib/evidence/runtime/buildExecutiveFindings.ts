import type {
  BuildExecutiveOversightInput,
  ExecutiveFinding,
  ExecutiveRiskLevel,
} from "../types";

let findingSeq = 0;

function finding(
  category: ExecutiveFinding["category"],
  level: ExecutiveRiskLevel,
  summary: string,
  extra?: Partial<ExecutiveFinding>,
): ExecutiveFinding {
  findingSeq += 1;
  return {
    id: `ef-${findingSeq}`,
    category,
    level,
    summary,
    ...extra,
  };
}

function governancePassed(input: BuildExecutiveOversightInput): boolean {
  return input.governance?.posture === "proceed";
}

function auditPassed(input: BuildExecutiveOversightInput): boolean {
  return input.audit?.governanceStatus !== "blocked";
}

function hasCriticalCompliance(input: BuildExecutiveOversightInput): boolean {
  return (
    (input.validation?.summary.criticalCount ?? 0) > 0 ||
    input.validation?.findings.some((f) => f.severity === "critical") === true ||
    input.governance?.riskLevel === "critical"
  );
}

function ocrTraceabilityComplete(input: BuildExecutiveOversightInput): boolean {
  const docs = input.ocrDocuments || [];
  if (!docs.length) return false;
  const hasBlocks = docs.some((d) => d.blocks.length > 0);
  const hasCoords = docs.every(
    (d) => d.blocks.length === 0 || d.blocks.every((b) => b.coordinates.width > 0),
  );
  const locRatio =
    input.linking && input.linking.matches.length
      ? input.linking.matches.filter((m) => m.locations.length > 0).length /
        input.linking.matches.length
      : 0;
  return hasBlocks && hasCoords && locRatio >= 0.5;
}

export { governancePassed, auditPassed, hasCriticalCompliance, ocrTraceabilityComplete };

/**
 * 从各层运行时收集 ExecutiveFinding
 */
export function buildExecutiveFindings(
  input: BuildExecutiveOversightInput,
): ExecutiveFinding[] {
  findingSeq = 0;
  const findings: ExecutiveFinding[] = [];

  const cov = input.coverage;
  if (cov) {
    for (const req of cov.requirements) {
      if (req.status === "missing" || req.status === "conflict") {
        findings.push(
          finding(
            "coverage",
            req.analysis.mandatory ? "critical" : "high",
            `覆盖 ${req.status}：${req.requirementTitle}`,
            {
              affectedRequirements: [req.requirementId],
            },
          ),
        );
      } else if (req.status === "partial") {
        findings.push(
          finding("coverage", "attention", `部分覆盖：${req.requirementTitle}`, {
            affectedRequirements: [req.requirementId],
          }),
        );
      }
    }
  }

  const val = input.validation;
  if (val) {
    for (const f of val.findings.filter((x) => x.severity !== "info")) {
      findings.push(
        finding(
          "validation",
          f.severity === "critical"
            ? "critical"
            : f.severity === "error"
              ? "high"
              : "attention",
          f.message,
          {
            affectedRequirements: f.requirementId ? [f.requirementId] : undefined,
          },
        ),
      );
    }
    for (const c of val.complianceChecks.filter((c) => !c.passed)) {
      findings.push(
        finding(
          "compliance",
          c.severity === "critical" ? "critical" : "attention",
          c.message,
        ),
      );
    }
  }

  const audit = input.audit;
  if (audit?.governanceStatus === "blocked") {
    findings.push(finding("audit", "critical", audit.message));
  }

  const gov = input.governance;
  if (gov && gov.posture !== "proceed") {
    findings.push(
      finding(
        "governance",
        gov.riskLevel === "critical" ? "critical" : "attention",
        `治理姿态 ${gov.posture}：${gov.message}`,
      ),
    );
  }

  if (!ocrTraceabilityComplete(input)) {
    const missingLoc = input.linking?.matches.filter((m) => !m.locations.length) ?? [];
    findings.push(
      finding("traceability", "attention", "OCR 块级定位不完整", {
        ocrRefs: missingLoc
          .flatMap((m) => m.locations)
          .slice(0, 3)
          .map((l) => ({ page: l.page, blockId: l.blockId })),
      }),
    );
    if (!input.ocrDocuments?.length) {
      findings.push(
        finding("traceability", "high", "Missing: Acceptance OCR trace"),
      );
    }
  }

  const dec = input.decision;
  if (dec?.status === "rejected") {
    findings.push(finding("governance", "critical", dec.message));
  }

  return findings;
}
