export type BidRiskLevel = "info" | "warn" | "block";

export type BidRiskTarget =
  | {
      type: "table-row";
      table: "technical" | "business" | "deviation";
      rowRef: string;
    }
  | {
      type: "attachment";
      attachmentCode: string;
    }
  | {
      type: "section";
      sectionId: string;
    };

export type BidRiskItem = {
  id: string;
  level: BidRiskLevel;
  title: string;
  reason: string;
  suggestion?: string;
  canAutoFix?: boolean;
  fixStrategy?: "rewrite" | "attachment" | "manual-confirm";
  section?:
    | "technical-response"
    | "business-response"
    | "attachments"
    | "qualification"
    | "pricing"
    | "delivery";
  fieldKey?: string;
  rowRef?: string;
  target?: BidRiskTarget;
};

export type BidDecisionGateResult = {
  action: "allow" | "warn" | "block";
  summary: string;
  score?: number;
  risks: BidRiskItem[];
};
