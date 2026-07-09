/**
 * V80 Pilot P1 — Tender requirement schema (maps to Project / Quote, no duplicate models)
 */

export type RequirementItem = {
  id: string;
  text: string;
  pageRef?: string;
  priority?: "must" | "preferred" | "optional";
};

export type PageRef = {
  page: number;
  excerpt: string;
};

export type TenderBudgetHint = {
  min?: number;
  max?: number;
  currency: string;
  notes: string;
};

export type TenderScheduleHint = {
  deadline?: string;
  milestones: string[];
};

/** Structured extraction output — every top-level field maps to Project / Quote / Tender metadata */
export type TenderRequirements = {
  projectName: string;
  organization: string;
  industry: string;
  location: string;
  objectives: string[];
  scope: string;
  functionalRequirements: RequirementItem[];
  technicalRequirements: RequirementItem[];
  equipment: RequirementItem[];
  space: RequirementItem[];
  quantity: RequirementItem[];
  constraints: RequirementItem[];
  compliance: RequirementItem[];
  standards: RequirementItem[];
  budget: TenderBudgetHint;
  schedule: TenderScheduleHint;
  evaluation: RequirementItem[];
  deliverables: string[];
  risks: string[];
  optionalItems: RequirementItem[];
  sourceRefs: PageRef[];
};

export const EMPTY_TENDER_REQUIREMENTS: TenderRequirements = {
  projectName: "",
  organization: "",
  industry: "",
  location: "",
  objectives: [],
  scope: "",
  functionalRequirements: [],
  technicalRequirements: [],
  equipment: [],
  space: [],
  quantity: [],
  constraints: [],
  compliance: [],
  standards: [],
  budget: { currency: "CNY", notes: "" },
  schedule: { milestones: [] },
  evaluation: [],
  deliverables: [],
  risks: [],
  optionalItems: [],
  sourceRefs: [],
};
