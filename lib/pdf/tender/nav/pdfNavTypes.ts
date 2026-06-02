export type TenderNavTargetKind =
  | "section"
  | "responseRef"
  | "scoreRef"
  | "attachmentRef";

export type TenderNavTarget = {
  key: string;
  kind: TenderNavTargetKind;
  page: number;
};

export type TenderNavRect = {
  page: number;
  x: number;
  y: number;
  width: number;
  height: number;
  targetKey: string;
};

export type TenderNavMap = Record<string, TenderNavTarget>;

