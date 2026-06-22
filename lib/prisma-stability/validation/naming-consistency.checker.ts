/**
 * Prisma Stability — naming consistency checker
 */

import type { ParsedSchema } from "../core/schema.parser";
import { validateModelNamingPolicy, type NamingViolation } from "../conventions/naming.policy";

export function validateNamingConsistency(schema: ParsedSchema): NamingViolation[] {
  return validateModelNamingPolicy(schema.models.map((m) => m.name));
}
