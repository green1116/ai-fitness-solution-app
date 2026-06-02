import type { CaseStudy, CaseStudyCatalog } from "./types";
import { SALES_ENABLEMENT_VERSION } from "./types";

const CASE_STUDIES: readonly Omit<CaseStudy, "id">[] = [
  {
    segment: "small-office",
    title: "Small Office Wellness Upgrade",
    problem: "A 45-person office lacked structured fitness planning and budget visibility for wellness initiatives.",
    solution: "Deployed AI Fitness Solution Starter tier with plan generation and proposal PDF export.",
    budget: "¥180,000",
    outcome: "Reduced planning cycle from 3 weeks to 3 days; standardized proposal format for leadership review.",
    roi: 142,
  },
  {
    segment: "medium-enterprise",
    title: "Medium Enterprise Campus Program",
    problem: "A 320-employee campus needed coordinated fitness solution planning across multiple buildings.",
    solution: "Implemented Professional tier with tender package support and multi-workspace collaboration.",
    budget: "¥680,000",
    outcome: "Achieved 68% utilization in pilot quarter; unified budget and tender deliverables across sites.",
    roi: 198,
  },
  {
    segment: "large-enterprise",
    title: "Large Enterprise National Rollout",
    problem: "A 2,400-employee enterprise required enterprise-grade planning, governance alignment, and dedicated support.",
    solution: "Deployed Enterprise tier with unlimited generation, full tender package, and dedicated account support.",
    budget: "¥2,400,000",
    outcome: "National rollout across 12 locations; 22% productivity uplift in wellness program coordination.",
    roi: 256,
  },
];

export function buildCaseStudyCatalog(input?: { deploymentId?: string }): CaseStudyCatalog {
  const deploymentId = input?.deploymentId ?? "sales-enablement-default";
  const caseStudies: CaseStudy[] = CASE_STUDIES.map((study) => ({
    id: `case-study-${study.segment}`,
    ...study,
  }));

  return {
    catalogId: `case-study-catalog-${deploymentId}`,
    version: SALES_ENABLEMENT_VERSION,
    caseStudies,
    summary: `case-study-catalog count=${caseStudies.length} segments=small-office,medium-enterprise,large-enterprise`,
  };
}

export function getCaseStudyBySegment(segment: CaseStudy["segment"]): CaseStudy {
  const catalog = buildCaseStudyCatalog();
  const study = catalog.caseStudies.find((c) => c.segment === segment);
  if (!study) {
    throw new Error(`Unknown case study segment: ${segment}`);
  }
  return study;
}
