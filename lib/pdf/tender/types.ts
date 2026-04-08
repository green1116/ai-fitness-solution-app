export type RequirementType =
  | "space"
  | "equipment"
  | "capacity"
  | "service"
  | "safety"
  | "implementation"
  | "acceptance"
  | "other";

export type RequirementPriority = "must" | "preferred" | "optional";

export type TechnicalStatus = "满足" | "部分满足" | "偏离" | "无此项";
export type TechnicalResponseStatus = TechnicalStatus;

export type TenderRequirement = {
  id: string;
  chapter?: string;
  category?: string;
  text: string;
  requirementType?: RequirementType;
  priority?: RequirementPriority;
  keywords?: string[];
};

export type TechnicalEvidenceCategory =
  | "space"
  | "equipment"
  | "service"
  | "implementation"
  | "budget"
  | "safety"
  | "other";

export type TechnicalEvidenceBlock = {
  key: string;
  title: string;
  category: TechnicalEvidenceCategory;
  text: string;
  sectionId?: string;
  pageLabel?: string;
  tags?: string[];
};

export type TechnicalResponseRow = {
  id: string;
  requirement: string;
  response: string;
  proof: string;
  status: TechnicalStatus;
  matchedEvidenceKeys: string[];
  confidence: number;
  sourceKeys?: string[];
  pageHint?: string;
  note?: string;
};

export type BusinessRequirementType =
  | "pricing"
  | "payment"
  | "delivery"
  | "service"
  | "other";

export type BusinessRequirement = {
  id: string;
  text: string;
  requirementType?: BusinessRequirementType;
  priority?: RequirementPriority;
  keywords?: string[];
};

export type BusinessResponseRow = {
  id: string;
  clause: string;
  response: string;
  status: TechnicalStatus;
  matchedEvidenceKeys: string[];
  confidence: number;
  note?: string;
};

export type DeviationStatus = "无偏离" | "有偏离";
export type DeviationType = "完全响应" | "正偏离" | "负偏离" | "说明";

export type TechnicalDeviationRow = {
  id: string;
  clause: string;
  responseSummary: string;
  deviationStatus: DeviationStatus;
  deviationType: DeviationType;
  note?: string;
};

export type BusinessDeviationRow = {
  id: string;
  clause: string;
  responseSummary: string;
  deviationStatus: DeviationStatus;
  deviationType: DeviationType;
  note?: string;
};

export type ScoreMappingRow = {
  id: string;
  scoreItem: string;
  criteria: string;
  proof: string;
  responseSummary: string;
  confidence?: number;
  note?: string;
};

export type ScoreCriterion = {
  id: string;
  scoreItem: string;
  criteria: string;
  keywords?: string[];
  category?: "technical" | "business" | "service" | "implementation" | "price" | "other";
};

