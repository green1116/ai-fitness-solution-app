import {
  PERSISTENCE_ERROR_CODES,
  isSaasProductPersistenceError,
} from "@/lib/saas-product-persistence";
import { API_ERROR_CODES, SaasProductApiError, apiNotFound, apiValidationFailed } from "./api-errors";

export function mapPersistenceError(error: unknown): never {
  if (isSaasProductPersistenceError(error)) {
    if (
      error.code === PERSISTENCE_ERROR_CODES.PERSISTENCE_NOT_FOUND ||
      error.code === PERSISTENCE_ERROR_CODES.PERSISTENCE_TENANT_MISMATCH
    ) {
      throw apiNotFound(error.message);
    }
    if (error.code === PERSISTENCE_ERROR_CODES.PERSISTENCE_INVALID_TRANSITION) {
      throw apiValidationFailed(error.message);
    }
  }
  if (error instanceof SaasProductApiError) {
    throw error;
  }
  const message = error instanceof Error ? error.message : "Persistence operation failed";
  throw new SaasProductApiError(API_ERROR_CODES.API_INTERNAL_ERROR, message, 500);
}

export async function withPersistence<T>(operation: () => Promise<T>): Promise<T> {
  try {
    return await operation();
  } catch (error) {
    mapPersistenceError(error);
  }
}
