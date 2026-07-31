/**
 * PI-5.4 — Contract stack exposure bindings (PD-6.2 §1.1).
 * Closed C0–C7 — no new contract families.
 */
import type { IntegrationPointId } from "../foundation/integration-points";
import type { IntegrationPipelineStage } from "../foundation/pipeline-stages";

export const INTEGRATION_CONTRACT_IDS = [
  "C0",
  "C1",
  "C2",
  "C3",
  "C4",
  "C5",
  "C6",
  "C7",
] as const;

export type IntegrationContractId =
  (typeof INTEGRATION_CONTRACT_IDS)[number];

export type ContractExposureBinding = Readonly<{
  contractId: IntegrationContractId;
  name: string;
  stageId: IntegrationPipelineStage | "CROSS";
  /** Existing seam points that expose this contract. */
  pointIds: readonly IntegrationPointId[];
  notes: string;
}>;

export const CONTRACT_EXPOSURE_BINDINGS = [
  {
    contractId: "C0",
    name: "Product Intent Contract",
    stageId: "UI",
    pointIds: ["INTP-FE-ADAPTER"],
    notes: "INT-* / ACT-* / Command names",
  },
  {
    contractId: "C1",
    name: "Presentation Contract",
    stageId: "UI",
    pointIds: ["INTP-FE-ADAPTER"],
    notes: "OBJ-* / ST-* presentation",
  },
  {
    contractId: "C2",
    name: "Transport Contract",
    stageId: "API",
    pointIds: ["INTP-FE-ADAPTER", "INTP-API-SURFACE"],
    notes: "Existing HTTP APIs",
  },
  {
    contractId: "C3",
    name: "Application Contract",
    stageId: "SERVICE",
    pointIds: ["INTP-API-SURFACE", "INTP-SERVICE-LAYER"],
    notes: "Service Command/Query handlers",
  },
  {
    contractId: "C4",
    name: "Domain Contract",
    stageId: "DOMAIN",
    pointIds: ["INTP-SERVICE-LAYER", "INTP-DOMAIN-PORTS"],
    notes: "M11–M15 capabilities",
  },
  {
    contractId: "C5",
    name: "Persistence Contract",
    stageId: "PERSISTENCE",
    pointIds: ["INTP-DATA-REPOSITORY", "INTP-DATA-RUNTIME"],
    notes: "Domain ports / STF-*",
  },
  {
    contractId: "C6",
    name: "Error Contract",
    stageId: "CROSS",
    pointIds: ["INTP-API-SURFACE", "INTP-FE-ADAPTER"],
    notes: "Safe envelopes → ST-META",
  },
  {
    contractId: "C7",
    name: "Compatibility Contract",
    stageId: "CROSS",
    pointIds: ["INTP-API-SURFACE", "INTP-FE-ADAPTER"],
    notes: "Version / Kind rules",
  },
] as const satisfies readonly ContractExposureBinding[];
