/**
 * V61.1 P5 — Launch re-verification (aggregates blocker closure reports)
 */

import { validateMigrationIntegrity } from "../validation/migration-validation.engine";
import { validateSchemaMigrations } from "../validation/schema-validation.engine";
import { validateAuthClosure } from "../auth/auth-closure.engine";
import { validateCommercialRegistration } from "../validation/commercial-registration.engine";
import { evaluateGoNoGo } from "@/lib/portal/v61/launch/go-no-go.engine";
import { buildLaunchChecklist } from "@/lib/portal/v61/launch/launch-checklist.engine";
import { validateUserJourney } from "@/lib/portal/v61/validation/journey-validation.engine";
import { validateCommercialWorkflow } from "@/lib/portal/v61/validation/commercial-workflow.engine";
import { validateProductionEnvironment } from "@/lib/portal/v61/validation/environment-validation.engine";

export type LaunchVerificationReport = {
  migration: Awaited<ReturnType<typeof validateMigrationIntegrity>>;
  schema: Awaited<ReturnType<typeof validateSchemaMigrations>>;
  auth: ReturnType<typeof validateAuthClosure>;
  commercial: ReturnType<typeof validateCommercialRegistration>;
  journey: ReturnType<typeof validateUserJourney>;
  commercialWorkflow: ReturnType<typeof validateCommercialWorkflow>;
  environment: Awaited<ReturnType<typeof validateProductionEnvironment>>;
  checklist: Awaited<ReturnType<typeof buildLaunchChecklist>>;
  goNoGo: Awaited<ReturnType<typeof evaluateGoNoGo>>;
  allBlockers: string[];
  launchScore: number;
  pass: boolean;
  evaluatedAt: string;
};

export async function runLaunchReverification(
  organizationId?: string,
): Promise<LaunchVerificationReport> {
  const [migration, environment, checklist, goNoGo] = await Promise.all([
    validateMigrationIntegrity(),
    validateProductionEnvironment(),
    buildLaunchChecklist(),
    evaluateGoNoGo(organizationId),
  ]);

  const schema = await validateSchemaMigrations();
  const auth = validateAuthClosure();
  const commercial = validateCommercialRegistration();
  const journey = validateUserJourney();
  const commercialWorkflow = validateCommercialWorkflow();

  const allBlockers = [
    ...migration.blockers,
    ...schema.blockers,
    ...auth.blockers,
    ...commercial.blockers,
    ...goNoGo.blockers,
  ];

  const launchScore = Math.round(
    migration.score * 0.2 +
      schema.score * 0.15 +
      auth.score * 0.15 +
      commercial.score * 0.2 +
      environment.score * 0.1 +
      commercialWorkflow.score * 0.1 +
      goNoGo.overallLaunchScore * 0.1,
  );

  const pass =
    allBlockers.length === 0 &&
    goNoGo.decision === "GO" &&
    journey.complete &&
    checklist.ready;

  return {
    migration,
    schema,
    auth,
    commercial,
    journey,
    commercialWorkflow,
    environment,
    checklist,
    goNoGo,
    allBlockers: [...new Set(allBlockers)],
    launchScore,
    pass,
    evaluatedAt: new Date().toISOString(),
  };
}
