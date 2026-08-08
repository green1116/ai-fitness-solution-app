/**
 * V80 Pilot P6 — Clarification loop schema (session-local, no Project/Quote/Tender changes)
 */

export type ClarificationRequirementListKey =
  | "functionalRequirements"
  | "technicalRequirements"
  | "equipment"
  | "space"
  | "quantity"
  | "constraints"
  | "compliance"
  | "standards"
  | "evaluation"
  | "optionalItems";

export type ClarificationGapKind =
  | "missing"
  | "ambiguous"
  | "low_confidence"
  | "incomplete";

export type ClarificationSeverity = "blocking" | "advisory";

export type ClarificationGap = {
  id: string;
  kind: ClarificationGapKind;
  fieldPath: string;
  severity: ClarificationSeverity;
  message: string;
  relatedItemIds?: string[];
};

export type ClarificationMergeTarget =
  | {
      type: "scalar";
      key: "projectName" | "organization" | "location" | "industry" | "scope";
    }
  | { type: "budget"; key: "min" | "max" | "notes" }
  | { type: "schedule"; key: "deadline" }
  | {
      type: "string_list";
      key: "objectives" | "deliverables" | "risks";
      mode: "append" | "replace";
    }
  | {
      type: "requirement_item";
      listKey: ClarificationRequirementListKey;
      itemId?: string;
      mode: "append" | "patch_text";
    };

export type ClarificationQuestionStatus = "open" | "answered" | "skipped";

export type ClarificationQuestion = {
  id: string;
  gapId: string;
  fieldPath: string;
  question: string;
  suggestedTarget: ClarificationMergeTarget;
  status: ClarificationQuestionStatus;
  severity: ClarificationSeverity;
  round: number;
  answer?: string;
  answeredAt?: string;
  answeredBy?: string;
};

export type ClarificationState = {
  round: number;
  gaps: ClarificationGap[];
  questions: ClarificationQuestion[];
  updatedAt: string;
};

export type ClarificationAnswerInput = {
  questionId: string;
  answer: string;
};
