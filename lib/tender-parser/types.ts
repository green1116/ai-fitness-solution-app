export type ParsedTenderResult = {
  sourceName?: string;
  sections: ParsedTenderSection[];
  technicalRequirements: ParsedTechnicalRequirement[];
  businessRequirements: ParsedBusinessRequirement[];
  scoreCriteria: ParsedScoreCriterion[];
  warnings?: string[];
};

export type ParsedTenderSection = {
  id: string;
  title: string;
  category:
    | "notice"
    | "technical"
    | "business"
    | "evaluation"
    | "qualification"
    | "contract"
    | "other";
  text: string;
  pageHint?: string;
};

export type ParsedTechnicalRequirement = {
  id: string;
  sectionTitle?: string;
  text: string;
  requirementType?:
    | "space"
    | "equipment"
    | "capacity"
    | "service"
    | "safety"
    | "implementation"
    | "acceptance"
    | "other";
  keywords?: string[];
  priority?: "must" | "preferred" | "optional";
  sourceSectionId?: string;
};

export type ParsedBusinessRequirement = {
  id: string;
  sectionTitle?: string;
  text: string;
  requirementType?: "pricing" | "payment" | "delivery" | "service" | "other";
  keywords?: string[];
  priority?: "must" | "preferred" | "optional";
  sourceSectionId?: string;
};

export type ParsedScoreCriterion = {
  id: string;
  scoreItem: string;
  criteria: string;
  keywords?: string[];
  category?: "technical" | "business" | "service" | "implementation" | "price" | "other";
  sourceSectionId?: string;
};

export type TenderTextBlock = {
  id: string;
  heading?: string;
  text: string;
  index: number;
};

