/**
 * V80 Pilot P8 — Knowledge reference & compliance validation schema (session-local)
 */

export type KnowledgeDomain =
  | "standards"
  | "certification"
  | "safety"
  | "equipment"
  | "space"
  | "commercial"
  | "process";

export type KnowledgeReference = {
  id: string;
  domain: KnowledgeDomain;
  title: string;
  code?: string;
  summary: string;
  keywords: string[];
  /** When true, matching/absence may drive blocking rules */
  mandatoryHint?: boolean;
};

export type ComplianceSeverity = "blocking" | "warning" | "info";

export type ComplianceRiskLevel = "critical" | "high" | "medium" | "low" | "none";

export type ComplianceRuleCategory =
  | "consistency"
  | "standards"
  | "certification"
  | "safety"
  | "completeness"
  | "commercial";

export type ComplianceRule = {
  id: string;
  category: ComplianceRuleCategory;
  severity: ComplianceSeverity;
  title: string;
  description: string;
  knowledgeRefIds?: string[];
  /** Deterministic matcher id handled by evaluator */
  matcher:
    | "require_project_basics"
    | "require_tech_or_func"
    | "require_standard_mention"
    | "require_certification_when_compliance"
    | "flag_ambiguous_quantity"
    | "flag_missing_budget"
    | "flag_space_without_area"
    | "flag_equipment_without_safety"
    | "consistency_budget_vs_scope"
    | "require_location_for_fitness";
};

export type ComplianceFinding = {
  id: string;
  ruleId: string;
  category: ComplianceRuleCategory;
  severity: ComplianceSeverity;
  risk: ComplianceRiskLevel;
  title: string;
  message: string;
  recommendation: string;
  fieldPath?: string;
  relatedItemIds?: string[];
  knowledgeRefIds?: string[];
  /** Reviewer acknowledged warning (does not clear blocking) */
  acknowledged?: boolean;
};

export type ComplianceValidationReport = {
  evaluatedAt: string;
  knowledgeRefCount: number;
  ruleCount: number;
  findings: ComplianceFinding[];
  blockingCount: number;
  warningCount: number;
  infoCount: number;
  overallRisk: ComplianceRiskLevel;
  passed: boolean;
  summary: string;
};

export type IntakeComplianceState = {
  report: ComplianceValidationReport;
  /** Acknowledged warning finding ids */
  acknowledgedFindingIds: string[];
  updatedAt: string;
};
