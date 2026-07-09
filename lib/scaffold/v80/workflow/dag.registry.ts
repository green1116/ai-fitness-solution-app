/** @scaffold BLP-WFL-001 tender-pack-complete DAG */
export const TENDER_PACK_DAG = [
  "tender-upload",
  "tender-intelligence",
  "proposal-generation",
  "budget-calculate",
  "plan-pdf",
  "budget-pdf",
  "proposal-pdf",
  "enterprise-zip",
] as const;

export type TenderPackStep = (typeof TENDER_PACK_DAG)[number];
