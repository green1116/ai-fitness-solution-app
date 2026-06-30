/**
 * V65 P5 — Runtime risk gate types
 */
export const V65_RUNTIME_RISK_LAYER_VERSION = "v65-runtime-risk-layer-1" as const;

export type RuntimeRiskId = "RT-001" | "RT-002" | "RT-003" | "RT-004" | "RT-005";

export type RuntimeRiskMitigation = {
  id: RuntimeRiskId;
  area: string;
  summary: string;
  mitigated: boolean;
  guard: string;
  notes?: string;
};

export type RuntimeRiskReport = {
  version: typeof V65_RUNTIME_RISK_LAYER_VERSION;
  reportId: string;
  generatedAt: string;
  deploymentId: string;
  mitigations: RuntimeRiskMitigation[];
  openRiskCount: number;
  runtimeRiskOk: boolean;
  summary: string;
};
