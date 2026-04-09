export type TenderDeviationStatus =
  | "满足"
  | "响应"
  | "待确认"
  | "部分满足"
  | "偏离"
  | "无此项";

export type TenderRiskLevel = "低" | "中" | "高";

export type TenderDeviationScene = "technical_deviation" | "business_deviation";

export type TenderDeviationRow = {
  refId?: string;
  clause: string;
  status?: string;
  deviation?: string;
  riskLevel?: TenderRiskLevel | string;
  adviceAttachments?: string;
  remark?: string;
};

