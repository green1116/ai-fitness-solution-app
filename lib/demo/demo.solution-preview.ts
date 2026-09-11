/**
 * Map formal pure buildPlan output → demo solution preview fields only.
 */
import type { PlanResult } from "@/lib/plan/types";

import type { DemoSolutionPreview } from "./demo.types";

export function solutionPreviewFromPlan(plan: PlanResult): DemoSolutionPreview {
  const equipmentRationale = Object.entries(plan.equipments).flatMap(
    ([zone, items]) =>
      items.map((item) => ({
        zone,
        name: item.name,
        qty: item.qty,
        rationale: item.rationale,
      })),
  );

  return {
    rationale: [plan.positioning, ...plan.executiveSummary, plan.recommendation],
    zones: Object.keys(plan.equipments),
    equipmentRationale,
    implementation: plan.implementation.map((step) => ({
      name: step.name,
      duration: step.duration,
      desc: step.desc,
    })),
  };
}
