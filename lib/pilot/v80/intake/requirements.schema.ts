/**
 * V80 Pilot P1/P5 — Tender requirement schema (maps to Project / Quote, no duplicate models)
 */

export type RequirementReviewStatus = "pending" | "confirmed" | "rejected";

export type ConfidenceBand = "high" | "medium" | "low";

/** Source span linking an extracted item back to PDF/DOCX page text */
export type RequirementEvidenceSpan = {
  page: number;
  excerpt: string;
  start?: number;
  end?: number;
  /** P7 — which document this span came from */
  documentId?: string;
  documentName?: string;
};

export type RequirementItem = {
  id: string;
  text: string;
  pageRef?: string;
  priority?: "must" | "preferred" | "optional";
  /** P2 — item-level review disposition */
  reviewStatus?: RequirementReviewStatus;
  /** P5 — page spans supporting this extraction */
  evidence?: RequirementEvidenceSpan[];
  /** P5 — deterministic score in [0, 1] */
  confidence?: number;
  confidenceBand?: ConfidenceBand;
  /** P5 — reviewer acknowledges weak evidence / low confidence */
  evidenceOverride?: boolean;
  evidenceOverrideNote?: string;
  /** P7 — originating document in multi-doc intake */
  sourceDocumentId?: string;
  sourceDocumentName?: string;
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

/** Client-safe list keys for item-level review editors */
export type RequirementItemListKey = keyof Pick<
  TenderRequirements,
  | "functionalRequirements"
  | "technicalRequirements"
  | "equipment"
  | "space"
  | "quantity"
  | "constraints"
  | "compliance"
  | "standards"
  | "evaluation"
  | "optionalItems"
>;

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
