/**
 * V3.5 contracts compat barrel.
 * Minimal pass-through for index.ts `export * from "./contracts"`.
 */

export const CONTRACTS_FOUNDATION_VERSION = "3.5-contracts-1" as const;

export type {
  ContractFreezeBundleInput,
  ContractFreezeBundleResult,
} from "./contracts/contract-freeze";
