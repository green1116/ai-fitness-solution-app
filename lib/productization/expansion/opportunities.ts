import { buildExpansionOpportunities } from "./expansion";
import { buildRenewalOpportunity } from "./renewal";

export function buildRenewalAndExpansionOpportunities(input?: {
  deploymentId?: string;
  customerId?: string;
}) {
  const renewal = buildRenewalOpportunity(input);
  const expansion = buildExpansionOpportunities(input);
  return { renewal, expansion };
}
