/**
 * V3.4-E27-A ecology skeleton — runtime pipeline contract (compat entry).
 * Labels are used only for debug summary lines in engine.ts.
 */

export type EcologyRuntimePipelineStage = {
  readonly id: string;
  readonly label: string;
};

/** Eight-stage ecology skeleton pipeline (E27-A). */
export const ECOLOGY_RUNTIME_PIPELINE: readonly EcologyRuntimePipelineStage[] = [
  { id: "niche_mapping", label: "niche_mapping" },
  { id: "symbiosis_network", label: "symbiosis_network" },
  { id: "biodiversity_assessment", label: "biodiversity_assessment" },
  { id: "trophic_flow_analysis", label: "trophic_flow_analysis" },
  { id: "habitat_health", label: "habitat_health" },
  { id: "cooperation_balance", label: "cooperation_balance" },
  { id: "succession_tracking", label: "succession_tracking" },
  {
    id: "sustainability_ecology_linkage",
    label: "sustainability_ecology_linkage",
  },
] as const;
