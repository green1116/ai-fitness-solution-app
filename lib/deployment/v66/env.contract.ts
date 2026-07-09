/**
 * V66 P1 — Environment variable contract (declarative, read-only)
 */
import { ENV_VAR_INVENTORY, type EnvCategory, type EnvVarContract } from "./env.inventory";

export const V66_ENV_CONTRACT_VERSION = "v66-env-contract-1" as const;

export type { EnvCategory, EnvVarContract };

export type EnvContractManifest = {
  version: typeof V66_ENV_CONTRACT_VERSION;
  variableCount: number;
  categoryCount: number;
  requiredInProduction: string[];
  forbiddenInProduction: string[];
  variables: EnvVarContract[];
  contractComplete: boolean;
  summary: string;
};

export function buildEnvContractManifest(): EnvContractManifest {
  const variables = ENV_VAR_INVENTORY;
  const categories = new Set(variables.map((v) => v.category));
  const requiredInProduction = variables
    .filter((v) => v.requiredIn.includes("production"))
    .map((v) => v.key);
  const forbiddenInProduction = variables
    .filter((v) => v.forbiddenInProduction)
    .map((v) => v.key);

  const contractComplete =
    variables.length >= 20 &&
    requiredInProduction.length >= 5 &&
    forbiddenInProduction.length >= 4 &&
    categories.size >= 6;

  return {
    version: V66_ENV_CONTRACT_VERSION,
    variableCount: variables.length,
    categoryCount: categories.size,
    requiredInProduction,
    forbiddenInProduction,
    variables,
    contractComplete,
    summary: [
      `env-contract vars=${variables.length}`,
      `required-prod=${requiredInProduction.length}`,
      `forbidden-prod=${forbiddenInProduction.length}`,
      `complete=${contractComplete}`,
    ].join(" "),
  };
}

export function isEnvKeyForbiddenInProduction(key: string): boolean {
  const entry = ENV_VAR_INVENTORY.find((v) => v.key === key);
  return entry?.forbiddenInProduction === true;
}

export function getRequiredProductionEnvKeys(): string[] {
  return ENV_VAR_INVENTORY.filter((v) => v.requiredIn.includes("production")).map(
    (v) => v.key,
  );
}
