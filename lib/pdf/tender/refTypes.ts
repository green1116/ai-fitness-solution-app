export type TenderResponseRefKind = "technical" | "business";

export type TenderResponseRefRow = {
  refId: string;
  kind: TenderResponseRefKind;
  clause: string;
  status?: string;
  response?: string;
  remark?: string;
};

export type TenderDeviationRefRow = {
  refId?: string;
  clause: string;
  status?: string;
  deviation?: string;
  riskLevel?: string;
  adviceAttachments?: string;
};

export type TenderScoreRefRow = {
  scoreId: string;
  scoreItem: string;
  responseSection: string;
  responseRefIds?: string[];
  evidence: string;
  risk: string;
};

