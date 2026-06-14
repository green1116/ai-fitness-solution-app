import { validateTransactionContextRegistry } from "./transaction-context";
import { validateTransactionLifecycleRegistry } from "./transaction-lifecycle";
import { validateTransactionQueryRegistry } from "./transaction-query";
import { validateTransactionRegistry } from "./transaction-registry";
import { validateTransactionSettlementRegistry } from "./transaction-settlement";
import type { IndustryTransactionValidation } from "./shared/types";

export function validateIndustryTransaction(): IndustryTransactionValidation {
  const transactionRegistry = validateTransactionRegistry();
  const transactionContext = validateTransactionContextRegistry();
  const transactionQuery = validateTransactionQueryRegistry();
  const transactionLifecycle = validateTransactionLifecycleRegistry();
  const transactionSettlement = validateTransactionSettlementRegistry();

  return {
    valid:
      transactionRegistry.valid &&
      transactionContext.valid &&
      transactionQuery.valid &&
      transactionLifecycle.valid &&
      transactionSettlement.valid,
    transactionRegistry,
    transactionContext,
    transactionQuery,
    transactionLifecycle,
    transactionSettlement,
  };
}
