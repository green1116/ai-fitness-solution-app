import type { GovernanceMechanismScore, GovernanceModuleOptimization } from "./optimization-types";

export function prioritizeModuleOptimizations(input: {
  deploymentId: string;
  mechanisms: GovernanceMechanismScore[];
}): GovernanceModuleOptimization[] {
  return input.mechanisms.map((mechanism) => {
    const shouldOptimize =
      mechanism.effectiveness === "low" ||
      mechanism.effectiveness === "ineffective" ||
      mechanism.trend === "declining";

    let tuningAction = "monitor-only";
    if (mechanism.effectiveness === "ineffective") tuningAction = "major-retune-required";
    else if (mechanism.effectiveness === "low") tuningAction = "incremental-tuning";
    else if (mechanism.trend === "declining") tuningAction = "stabilize-and-retune";

    return {
      moduleId: `module-opt-${mechanism.module}-${input.deploymentId}`,
      moduleName: mechanism.module,
      shouldOptimize,
      tuningAction,
      impactScore: shouldOptimize ? 100 - mechanism.score : mechanism.score,
    };
  });
}
