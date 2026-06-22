/**
 * Prisma Stability — naming policy
 */

import { BUSINESS_DOMAIN_MAP, getModelOwnership } from "./business-domain.map";

export type NamingViolation = {
  model: string;
  line?: number;
  rule: string;
  message: string;
  suggestion?: string;
};

const RESERVED_DUPLICATE_PATTERNS = [
  /^CustomerV\d+$/i,
  /^LeadV\d+$/i,
  /^MarketingLeadV\d+$/i,
  /^CRMCustomer$/i,
];

const FORBIDDEN_LEAD_ALIASES = ["CRMLead", "SalesLeadModel", "MarketingLeadDuplicate"];

export function validateModelNamingPolicy(modelNames: string[]): NamingViolation[] {
  const violations: NamingViolation[] = [];
  const seenConcepts = new Map<string, string>();

  for (const name of modelNames) {
    if (RESERVED_DUPLICATE_PATTERNS.some((p) => p.test(name))) {
      violations.push({
        model: name,
        rule: "no_versioned_duplicate",
        message: `Model ${name} looks like a duplicate naming fork`,
        suggestion: "Use single canonical model with @@map for table rename",
      });
    }

    if (FORBIDDEN_LEAD_ALIASES.includes(name)) {
      violations.push({
        model: name,
        rule: "lead_semantic_boundary",
        message: `Ambiguous lead model ${name}`,
        suggestion: "Use Lead (CRM) or MarketingLead (marketing) only",
      });
    }

    const ownership = getModelOwnership(name);
    if (ownership) {
      const prev = seenConcepts.get(ownership.concept);
      if (prev && prev !== name) {
        violations.push({
          model: name,
          rule: "single_concept_owner",
          message: `Concept ${ownership.concept} already owned by ${prev}`,
          suggestion: `Keep ${prev}; do not add parallel ${name}`,
        });
      } else {
        seenConcepts.set(ownership.concept, name);
      }
    }
  }

  for (const entry of BUSINESS_DOMAIN_MAP) {
    if (!modelNames.includes(entry.model)) continue;
    if (entry.model === "Lead" && modelNames.includes("MarketingLead")) {
      // allowed pair — different concepts
    }
  }

  return violations;
}

export function describeNamingPolicy(): string[] {
  return [
    "CRM sales lead → Lead (@@map crm_lead)",
    "Marketing lead → MarketingLead",
    "CRM customer → Customer (@@map crm_customer)",
    "Organization → tenant container",
    "No CustomerV2 / LeadV2 parallel models",
  ];
}
