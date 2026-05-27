import { ECOLOGY_RUNTIME_PIPELINE } from "./contract";
import {
  formatClosedLoopDebugSummary,
  orchestrationSummaryFromPass,
  runEcologicalClosedLoop,
} from "./adaptation";
import { formatEvolutionSummary, runEcologicalEvolution } from "./evolution";
import {
  applyAssimilationBiasToInput,
  formatAssimilationSummary,
  runEvolutionFeedbackAssimilation,
} from "./evolution/assimilation";
import {
  applyEvolutionFeedbackToInput,
  formatEvolutionFeedbackSummary,
  runEvolutionFeedbackClosure,
} from "./evolution/feedback";
import {
  applyArchivePreservationToInput,
  applyCatalogNavigationToInput,
  applyQueryContextToInput,
  applyResponseRelayToInput,
  applySessionContinuationToInput,
  applyTransitionHandoffToInput,
  applyContinuationResumeToInput,
  applyPersistenceStabilizationToInput,
  applyRecoveryRepairToInput,
  applyReconstructionRegenerationToInput,
  applyRegenerationVitalityToInput,
  applyFlourishingProsperityToInput,
  applyAscensionElevationToInput,
  applyIntegrationUnificationToInput,
  applyConvergenceClosureToInput,
  applyHarmonizationResonanceToInput,
  applyEcologicalResonanceExcitationToInput,
  applyEcologicalTrackingTrajectToInput,
  applyEcologicalObservationTrackToInput,
  applyEcologicalQuarantineObserveToInput,
  applyEcologicalContainmentQuarantineToInput,
  applyEcologicalInterceptionBlockToInput,
  applyEcologicalSafeguardingSentinelToInput,
  applyEcologicalPreservationSafeguardToInput,
  applyEcologicalRetentionHoldToInput,
  applyEcologicalLatchingRetentionToInput,
  applyEcologicalEmbeddingStructuralBindingToInput,
  applyEcologicalInfiltrationInjectionToInput,
  applyEcologicalPermeationInfiltrationToInput,
  applyEcologicalDiffusionSpreadToInput,
  applyEcologicalPropagationBroadcastToInput,
  applyAmplificationPropagationToInput,
  applyAutonomousClosureToInput,
  applyContinuityPreservationToInput,
  applyGovernanceDirectiveToInput,
  applyCivilizationalMemoryRecallToInput,
  applyIdentityAnchorToInput,
  applyLineageInheritanceToInput,
  formatArchiveSummary,
  formatCatalogSummary,
  formatQuerySummary,
  formatResponseSummary,
  formatSessionSummary,
  formatTransitionSummary,
  formatEcologicalContinuationSummary,
  formatEcologicalPersistenceSummary,
  formatEcologicalRecoverySummary,
  formatEcologicalReconstructionSummary,
  formatEcologicalRegenerationSummary,
  formatEcologicalFlourishingSummary,
  formatEcologicalAscensionSummary,
  formatEcologicalIntegrationSummary,
  formatEcologicalConvergenceSummary,
  formatEcologicalHarmonizationSummary,
  formatEcologicalResonanceSummary,
  formatEcologicalTrackingSummary,
  formatEcologicalObservationSummary,
  formatEcologicalQuarantineSummary,
  formatEcologicalContainmentSummary,
  formatEcologicalInterceptionSummary,
  formatEcologicalSafeguardingSummary,
  formatEcologicalPreservationSummary,
  formatEcologicalRetentionSummary,
  formatEcologicalLatchingSummary,
  formatEcologicalEmbeddingSummary,
  formatEcologicalInfiltrationSummary,
  formatEcologicalPermeationSummary,
  formatEcologicalDiffusionSummary,
  formatEcologicalPropagationSummary,
  formatEcologicalAmplificationSummary,
  formatAutonomousClosureSummary,
  formatContinuitySummary,
  formatGovernanceSummary,
  formatIdentitySummary,
  formatLineageSummary,
  formatMemorySummary,
  runAutonomousGovernanceClosure,
  runCivilizationalArchive,
  runCivilizationalCatalog,
  runCivilizationalQuery,
  runCivilizationalResponse,
  runCivilizationalSession,
  runCivilizationalTransition,
  runCivilizationalContinuation,
  runCivilizationalPersistence,
  runCivilizationalEcologicalRecovery,
  runCivilizationalEcologicalReconstruction,
  runCivilizationalEcologicalRegeneration,
  runCivilizationalEcologicalFlourishing,
  runCivilizationalEcologicalAscension,
  runCivilizationalEcologicalIntegration,
  runCivilizationalEcologicalConvergence,
  runCivilizationalEcologicalHarmonization,
  runCivilizationalEcologicalResonance,
  runCivilizationalEcologicalTracking,
  runCivilizationalEcologicalObservation,
  runCivilizationalEcologicalQuarantine,
  runCivilizationalEcologicalContainment,
  runCivilizationalEcologicalInterception,
  runCivilizationalEcologicalSafeguarding,
  runCivilizationalEcologicalPreservation,
  runCivilizationalEcologicalRetention,
  runCivilizationalEcologicalLatching,
  runCivilizationalEcologicalEmbedding,
  runCivilizationalEcologicalInfiltration,
  runCivilizationalEcologicalPermeation,
  runCivilizationalEcologicalDiffusion,
  runCivilizationalEcologicalPropagation,
  runCivilizationalEcologicalResonanceAmplification,
  runCivilizationalContinuity,
  runCivilizationalIdentity,
  runCivilizationalLineage,
  runCivilizationalMemory,
  runEcologicalGovernance,
} from "./evolution/governance";
import {
  applyStabilizationAnchorToInput,
  formatStabilizationSummary,
  runEcologicalStabilization,
} from "./evolution/stabilization";
import {
  formatTransmissionSummary,
  runEvolutionTransmission,
} from "./evolution/transmission";
import {
  buildEcologyRuntimeIntelligence,
} from "./intelligence";
import { buildEcologyRuntimeTraces } from "./traces";
import type {
  CivilizationEcologyRuntimeResult,
  EcologyRuntimeInput,
} from "./types";
import {
  formatCommercializationFreezeHook,
  runCommercializationFreezeLayer,
} from "../../commercialization";
import {
  formatDeploymentRuntimeHook,
  runDeploymentRuntimeFoundation,
} from "../../commercialization/deployment";
import {
  formatObservabilityRuntimeHook,
  runObservabilityFoundation,
} from "../../commercialization/observability";
import {
  formatReliabilityRuntimeHook,
  runReliabilityFoundation,
} from "../../commercialization/reliability";
import {
  formatCommercialGovernanceHook,
  runCommercialGovernanceFoundation,
} from "../../commercialization/governance";
import {
  formatDeliveryRuntimeHook,
  formatPackagingRuntimeHook,
  runPackagingFoundation,
} from "../../commercialization/packaging";
import {
  formatGatewayRuntimeHook,
  runCommercialGatewayFoundation,
} from "../../commercialization/gateway";
import {
  formatCommercialStackSealedHook,
  formatCompatibilityVerifiedHook,
  formatFinalizationRuntimeHook,
  formatFreezeClosedHook,
  runCommercialFinalizationFoundation,
} from "../../commercialization/finalization";
import {
  formatPublicManifestHook,
  formatPublicSurfaceRuntimeHook,
  runCommercialPublicSurfaceFoundation,
} from "../../commercialization/public";
import {
  formatHttpRuntimeHook,
  runCommercialHttpFoundation,
} from "../../commercialization/http";
import {
  formatOpenApiRuntimeHook,
  runCommercialOpenApiFoundation,
} from "../../commercialization/openapi";
import {
  formatSdkRuntimeHook,
  runCommercialSdkFoundation,
} from "../../commercialization/sdk";
import {
  formatIntegrationRuntimeHook,
  formatIntegrationVerifiedHook,
  runCommercialIntegrationFoundation,
} from "../../commercialization/integration";
import {
  formatClientDemoReadyHook,
  formatClientRuntimeHook,
  runCommercialClientFoundation,
} from "../../commercialization/client";
import {
  formatReleaseBundlePublishedHook,
  formatReleasePortalRuntimeHook,
  runCommercialReleaseFoundation,
} from "../../commercialization/release";
import {
  formatDiscoveryRuntimeHook,
  formatSearchIndexReadyHook,
  runCommercialDiscoveryFoundation,
} from "../../commercialization/discovery";
import {
  formatFeedbackIntakeReadyHook,
  formatIssueIntakeReadyHook,
  formatSupportPortalReadyHook,
  runCommercialSupportFoundation,
} from "../../commercialization/support";
import {
  formatLegalNoticeReadyHook,
  formatPrivacyNoticeReadyHook,
  formatSecurityPostureReadyHook,
  formatTrustCenterReadyHook,
  runCommercialTrustFoundation,
} from "../../commercialization/trust";
import {
  formatMetricsSnapshotReadyHook,
  formatPublicAuditReadyHook,
  formatPublicReportingReadyHook,
  formatTransparencyCenterReadyHook,
  runCommercialTransparencyFoundation,
} from "../../commercialization/transparency";
import {
  formatArchiveReadyHook,
  formatSurfaceSealedHook,
  formatV36PhaseClosedHook,
  formatVersionLockReadyHook,
  runCommercialClosureFoundation,
} from "../../commercialization/closure";
import {
  formatEntitlementModelReadyHook,
  formatProductCatalogReadyHook,
  formatProductSurfaceReadyHook,
  formatWorkspaceReadyHook,
  runCommercialProductFoundation,
} from "../../commercialization/product";
import {
  formatCommercialTermsReadyHook,
  formatPricingSurfaceReadyHook,
  formatPricingTableReadyHook,
  formatQuoteBuilderReadyHook,
  runCommercialCommerceFoundation,
} from "../../commercialization/commerce";
import {
  formatOnboardingReadyHook,
  formatOperationsSurfaceReadyHook,
  formatOrderModelReadyHook,
  formatSubscriptionModelReadyHook,
  formatTrialModelReadyHook,
  runCommercialOperationsFoundation,
} from "../../commercialization/operations";
import {
  formatAccountSurfaceReadyHook,
  formatBillingSurfaceReadyHook,
  formatCustomerPortalReadyHook,
  formatInvoiceSurfaceReadyHook,
  formatPortalSurfaceReadyHook,
  runCommercialPortalFoundation,
} from "../../commercialization/portal";
import {
  formatV37ClosureReadyHook,
  formatV37FreezeReadyHook,
  formatV37PhaseClosedHook,
  formatV37RegistryReadyHook,
  formatV37SurfaceSealedHook,
  runCommercialV37ClosureFoundation,
} from "../../commercialization/closure";
import {
  formatCustomerSuccessReadyHook,
  formatEscalationReadyHook,
  formatFeedbackModelReadyHook,
  formatOperationalGovernanceReadyHook,
  formatSupportModelReadyHook,
  formatV37SupportSurfaceReadyHook,
  runCommercialV37SupportFoundation,
} from "../../commercialization/support";
import {
  formatFinalSurfaceReadyHook,
  formatPublicIndexReadyHook,
  formatReleasePackReadyHook,
  formatStableFreezeReadyHook,
  formatV37FinalClosedHook,
  runCommercialV37FinalFoundation,
} from "../../commercialization/final";
import {
  formatAggregateVerificationReadyHook,
  formatCommercialProductizationPhaseClosedHook,
  formatSurfaceLockReadyHook as formatV37PhaseSurfaceLockReadyHook,
  formatVersionFreezeReadyHook as formatV37PhaseVersionFreezeReadyHook,
  formatV37PhaseClosureReadyHook,
  runCommercialV37PhaseClosureFoundation,
} from "../../commercialization/v37";
import {
  formatHandoffReadyHook,
  formatLaunchCandidateReadyHook,
  formatLaunchSurfaceReadyHook,
  formatMaintenanceReadyHook,
  formatPublicReadinessReadyHook,
  runCommercialV37LaunchFoundation,
} from "../../commercialization/launch";
import {
  formatArchiveReadyHook as formatV37OperatingArchiveReadyHook,
  formatLongTermSupportReadyHook,
  formatOperatingStateReadyHook,
  formatOperatingSurfaceReadyHook,
  formatRenewalReadyHook as formatV37RenewalReadyHook,
  runCommercialV37OperatingFoundation,
} from "../../commercialization/operations-v37";
import {
  formatAuditTrailReadyHook,
  formatDecommissionReadyHook,
  formatRetentionReadyHook,
  formatSunsetReadyHook,
  formatSunsetSurfaceReadyHook,
  runCommercialV37SunsetFoundation,
} from "../../commercialization/sunset";
import {
  formatArchiveSurfaceReadyHook,
  formatHistoricalReferenceReadyHook as formatV37ArchiveHistoricalReferenceReadyHook,
  formatImmutableSnapshotReadyHook,
  formatReadonlyArchiveReadyHook,
  formatRetirementReadyHook,
  runCommercialV37ArchiveFoundation,
} from "../../commercialization/archive";
import {
  formatEndOfLifeReadyHook,
  formatImmutableReferenceReadyHook,
  formatLegacySupportReadyHook,
  formatPublicHistoryReadyHook,
  formatTerminalSurfaceReadyHook,
  runCommercialV37LegacyFoundation,
} from "../../commercialization/legacy";
import {
  formatFullLifecycleMapReadyHook,
  formatMasterAtlasReadyHook,
  formatMasterSurfaceReadyHook,
  formatPublicOverviewReadyHook,
  formatUnifiedIndexReadyHook,
  runCommercialV37AtlasFoundation,
} from "../../commercialization/atlas";
import {
  formatCanonicalReferenceReadyHook,
  formatFinalFreezeReadyHook,
  formatHubSurfaceReadyHook,
  formatImmutableEntryReadyHook,
  formatUnifiedPortalReadyHook,
  formatHubFreezeReadyHook,
  runCommercialV37HubFoundation,
} from "../../commercialization/hub";
import {
  formatConsolidationReadyHook,
  formatFreezeBoundaryReadyHook,
  formatRegressionBaselineReadyHook,
  formatStabilizationReleaseReadyHook,
  formatStabilizationSurfaceReadyHook,
  runCommercialV37StabilizationFoundation,
} from "../../commercialization/stabilization";
import { CIVILIZATION_ECOLOGY_SKELETON_VERSION } from "./version";

/**
 * 文明生态运行时引擎：E27-B–AT（编排 / 闭环 / 演化 / 传递 / 反馈 / 吸收 / 稳定化 / 治理 / 自治闭环 / 连续性 / 谱系 / 身份 / 记忆 / 档案 / 编目 / 查询 / 响应 / 会话 / 转接 / 延续 / 持久 / 恢复 / 重建 / 再生 / 繁盛 / 跃迁 / 整合 / 收敛 / 和谐 / 共振 / 放大 / 传播 / 扩散 / 渗透 / 侵入 / 嵌入 / 拉接 / 保留 / 保全 / 守护 / 拦截 / 隔离 / 检疫 / 观察 / 追踪）。
 * 不依赖 evidence 治理层；仅消费 EcologyRuntimeInput 标量信号。
 */
export function runCivilizationEcologyEngine(
  input: EcologyRuntimeInput,
): CivilizationEcologyRuntimeResult {
  const trackingInput = applyEcologicalTrackingTrajectToInput(input);
  const observationInput = applyEcologicalObservationTrackToInput(trackingInput);
  const quarantineInput = applyEcologicalQuarantineObserveToInput(observationInput);
  const containmentInput = applyEcologicalContainmentQuarantineToInput(quarantineInput);
  const interceptionInput = applyEcologicalInterceptionBlockToInput(containmentInput);
  const safeguardingInput = applyEcologicalSafeguardingSentinelToInput(interceptionInput);
  const preservationInput = applyEcologicalPreservationSafeguardToInput(safeguardingInput);
  const retentionInput = applyEcologicalRetentionHoldToInput(preservationInput);
  const latchingInput = applyEcologicalLatchingRetentionToInput(retentionInput);
  const embeddingInput = applyEcologicalEmbeddingStructuralBindingToInput(latchingInput);
  const infiltrationInput = applyEcologicalInfiltrationInjectionToInput(embeddingInput);
  const permeationInput = applyEcologicalPermeationInfiltrationToInput(infiltrationInput);
  const diffusionInput = applyEcologicalDiffusionSpreadToInput(permeationInput);
  const propagationInput = applyEcologicalPropagationBroadcastToInput(diffusionInput);
  const amplificationInput = applyAmplificationPropagationToInput(propagationInput);
  const resonanceInput = applyEcologicalResonanceExcitationToInput(amplificationInput);
  const harmonizationInput = applyHarmonizationResonanceToInput(resonanceInput);
  const convergenceInput = applyConvergenceClosureToInput(harmonizationInput);
  const integrationInput = applyIntegrationUnificationToInput(convergenceInput);
  const ascensionInput = applyAscensionElevationToInput(integrationInput);
  const flourishingInput = applyFlourishingProsperityToInput(ascensionInput);
  const regenerationInput = applyRegenerationVitalityToInput(flourishingInput);
  const reconstructionInput = applyReconstructionRegenerationToInput(regenerationInput);
  const recoveryInput = applyRecoveryRepairToInput(reconstructionInput);
  const persistenceInput = applyPersistenceStabilizationToInput(recoveryInput);
  const continuationInput = applyContinuationResumeToInput(persistenceInput);
  const transitionInput = applyTransitionHandoffToInput(continuationInput);
  const sessionInput = applySessionContinuationToInput(transitionInput);
  const responseInput = applyResponseRelayToInput(sessionInput);
  const queryInput = applyQueryContextToInput(responseInput);
  const catalogInput = applyCatalogNavigationToInput(queryInput);
  const archiveInput = applyArchivePreservationToInput(catalogInput);
  const memoryInput = applyCivilizationalMemoryRecallToInput(archiveInput);
  const identityInput = applyIdentityAnchorToInput(memoryInput);
  const lineageInput = applyLineageInheritanceToInput(identityInput);
  const continuityInput = applyContinuityPreservationToInput(lineageInput);
  const closureInput = applyAutonomousClosureToInput(continuityInput);
  const governedInput = applyGovernanceDirectiveToInput(closureInput);
  const stabilizedInput = applyStabilizationAnchorToInput(governedInput);
  const assimilationInput = applyAssimilationBiasToInput(stabilizedInput);
  const { input: loopInput, consumedPending } =
    applyEvolutionFeedbackToInput(assimilationInput);

  const loop = runEcologicalClosedLoop(loopInput);
  const { finalPass, adaptation } = loop;

  const evolution = runEcologicalEvolution({
    civilizationId: input.civilizationId,
    finalPass,
    adaptation,
  });

  const transmission = runEvolutionTransmission({ evolution });

  const feedback = runEvolutionFeedbackClosure({
    civilizationId: input.civilizationId,
    transmission,
    baseSignals: loopInput.signals ?? {},
    consumedPendingGeneration: consumedPending?.generation ?? null,
  });

  const assimilation = runEvolutionFeedbackAssimilation({
    civilizationId: input.civilizationId,
    feedback,
    transmission,
    evolution,
  });

  const stabilization = runEcologicalStabilization({
    civilizationId: input.civilizationId,
    assimilation,
    evolution,
    feedback,
    ecologyIndex: finalPass.ecologyIndex,
    ecologicalState: finalPass.ecologicalState,
    currentSignals: loopInput.signals ?? {},
  });

  const governance = runEcologicalGovernance({
    civilizationId: input.civilizationId,
    stabilization,
    assimilation,
    evolution,
    ecologicalState: finalPass.ecologicalState,
  });

  const closure = runAutonomousGovernanceClosure({
    civilizationId: input.civilizationId,
    governance,
    stabilization,
    assimilation,
  });

  const continuity = runCivilizationalContinuity({
    civilizationId: input.civilizationId,
    closure,
    evolution,
    governance,
    ecologyIndex: finalPass.ecologyIndex,
  });

  const lineage = runCivilizationalLineage({
    civilizationId: input.civilizationId,
    continuity,
    evolution,
    governance,
  });

  const identity = runCivilizationalIdentity({
    civilizationId: input.civilizationId,
    lineage,
    continuity,
    evolution,
  });

  const memory = runCivilizationalMemory({
    civilizationId: input.civilizationId,
    identity,
    lineage,
    continuity,
    evolution,
    stabilization,
    ecologyIndex: finalPass.ecologyIndex,
  });

  const archive = runCivilizationalArchive({
    civilizationId: input.civilizationId,
    memory,
    identity,
  });

  const catalog = runCivilizationalCatalog({
    civilizationId: input.civilizationId,
    archive,
    memory,
  });

  const query = runCivilizationalQuery({
    civilizationId: input.civilizationId,
    catalog,
  });

  const response = runCivilizationalResponse({
    civilizationId: input.civilizationId,
    query,
  });

  const session = runCivilizationalSession({
    civilizationId: input.civilizationId,
    response,
  });

  const transition = runCivilizationalTransition({
    civilizationId: input.civilizationId,
    session,
  });

  const ecologyContinuation = runCivilizationalContinuation({
    civilizationId: input.civilizationId,
    transition,
  });

  const ecologyPersistence = runCivilizationalPersistence({
    civilizationId: input.civilizationId,
    continuation: ecologyContinuation,
  });

  const ecologyRecovery = runCivilizationalEcologicalRecovery({
    civilizationId: input.civilizationId,
    persistence: ecologyPersistence,
  });

  const ecologyReconstruction = runCivilizationalEcologicalReconstruction({
    civilizationId: input.civilizationId,
    recovery: ecologyRecovery,
  });

  const ecologyRegeneration = runCivilizationalEcologicalRegeneration({
    civilizationId: input.civilizationId,
    reconstruction: ecologyReconstruction,
  });

  const ecologyFlourishing = runCivilizationalEcologicalFlourishing({
    civilizationId: input.civilizationId,
    regeneration: ecologyRegeneration,
  });

  const ecologyAscension = runCivilizationalEcologicalAscension({
    civilizationId: input.civilizationId,
    flourishing: ecologyFlourishing,
  });

  const ecologyIntegration = runCivilizationalEcologicalIntegration({
    civilizationId: input.civilizationId,
    ascension: ecologyAscension,
  });

  const ecologyConvergence = runCivilizationalEcologicalConvergence({
    civilizationId: input.civilizationId,
    integration: ecologyIntegration,
  });

  const ecologyHarmonization = runCivilizationalEcologicalHarmonization({
    civilizationId: input.civilizationId,
    convergence: ecologyConvergence,
  });

  const ecologyResonance = runCivilizationalEcologicalResonance({
    civilizationId: input.civilizationId,
    harmonization: ecologyHarmonization,
  });

  const ecologyAmplification = runCivilizationalEcologicalResonanceAmplification({
    civilizationId: input.civilizationId,
    resonance: ecologyResonance,
  });

  const ecologyPropagation = runCivilizationalEcologicalPropagation({
    civilizationId: input.civilizationId,
    amplification: ecologyAmplification,
  });

  const ecologyDiffusion = runCivilizationalEcologicalDiffusion({
    civilizationId: input.civilizationId,
    propagation: ecologyPropagation,
  });

  const ecologyPermeation = runCivilizationalEcologicalPermeation({
    civilizationId: input.civilizationId,
    diffusion: ecologyDiffusion,
  });

  const ecologyInfiltration = runCivilizationalEcologicalInfiltration({
    civilizationId: input.civilizationId,
    permeation: ecologyPermeation,
  });

  const ecologyEmbedding = runCivilizationalEcologicalEmbedding({
    civilizationId: input.civilizationId,
    infiltration: ecologyInfiltration,
  });

  const ecologyLatching = runCivilizationalEcologicalLatching({
    civilizationId: input.civilizationId,
    embedding: ecologyEmbedding,
  });

  const ecologyRetention = runCivilizationalEcologicalRetention({
    civilizationId: input.civilizationId,
    latching: ecologyLatching,
  });

  const ecologyPreservation = runCivilizationalEcologicalPreservation({
    civilizationId: input.civilizationId,
    retention: ecologyRetention,
  });

  const ecologySafeguarding = runCivilizationalEcologicalSafeguarding({
    civilizationId: input.civilizationId,
    preservation: ecologyPreservation,
  });

  const ecologyInterception = runCivilizationalEcologicalInterception({
    civilizationId: input.civilizationId,
    safeguarding: ecologySafeguarding,
  });

  const ecologyContainment = runCivilizationalEcologicalContainment({
    civilizationId: input.civilizationId,
    interception: ecologyInterception,
  });

  const ecologyQuarantine = runCivilizationalEcologicalQuarantine({
    civilizationId: input.civilizationId,
    containment: ecologyContainment,
  });

  const ecologyObservation = runCivilizationalEcologicalObservation({
    civilizationId: input.civilizationId,
    quarantine: ecologyQuarantine,
  });

  const ecologyTracking = runCivilizationalEcologicalTracking({
    civilizationId: input.civilizationId,
    observation: ecologyObservation,
  });

  const slices = finalPass.slices;
  const traces = buildEcologyRuntimeTraces(slices, finalPass.ctx.ranAt);
  const intelligence = buildEcologyRuntimeIntelligence({
    ecologyIndex: finalPass.ecologyIndex,
    ecologicalState: finalPass.ecologicalState,
    slices,
  });

  const commercialFreeze = runCommercializationFreezeLayer({
    deploymentId: input.civilizationId,
    ecologyNodeHint: ecologyTracking.record.currentSlice.nodeCount,
  });

  const deploymentFoundation = runDeploymentRuntimeFoundation({
    deploymentId: input.civilizationId,
    deployEnv: process.env.DEPLOY_ENV ?? process.env.NODE_ENV,
  });

  const observabilityFoundation = runObservabilityFoundation({
    deploymentId: input.civilizationId,
    traceId: finalPass.ctx.traceId,
    lastRunMs: 0,
  });

  const reliabilityFoundation = runReliabilityFoundation({
    deploymentId: input.civilizationId,
    failureCount: observabilityFoundation.monitoring.failures.totalFailures,
    latencyP95Ms: observabilityFoundation.monitoring.latency.p95Ms,
  });

  const governanceFoundation = runCommercialGovernanceFoundation({
    deploymentId: input.civilizationId,
    nodeCount: ecologyTracking.record.currentSlice.nodeCount,
    depth: 32,
    traceId: finalPass.ctx.traceId,
    deployEnv: process.env.DEPLOY_ENV ?? process.env.NODE_ENV,
    layers: {
      freeze: commercialFreeze,
      deployment: deploymentFoundation,
      observability: observabilityFoundation,
      reliability: reliabilityFoundation,
    },
  });

  const packagingFoundation = runPackagingFoundation({
    deploymentId: input.civilizationId,
    tier: "enterprise",
    governance: governanceFoundation,
  });

  const gatewayFoundation = runCommercialGatewayFoundation({
    deploymentId: input.civilizationId,
    tier: "enterprise",
    governance: governanceFoundation,
    packaging: packagingFoundation,
  });

  const finalizationFoundation = runCommercialFinalizationFoundation({
    deploymentId: input.civilizationId,
    tier: "enterprise",
    layers: {
      freeze: commercialFreeze,
      deployment: deploymentFoundation,
      observability: observabilityFoundation,
      reliability: reliabilityFoundation,
      governance: governanceFoundation,
      packaging: packagingFoundation,
      gateway: gatewayFoundation,
    },
  });

  const publicSurfaceFoundation = runCommercialPublicSurfaceFoundation({
    deploymentId: input.civilizationId,
    tier: "enterprise",
    finalization: finalizationFoundation,
    packaging: packagingFoundation,
    gateway: gatewayFoundation,
  });

  const httpFoundation = runCommercialHttpFoundation({
    deploymentId: input.civilizationId,
    publicSurface: publicSurfaceFoundation,
  });

  const openApiFoundation = runCommercialOpenApiFoundation({
    http: httpFoundation,
  });

  const sdkFoundation = runCommercialSdkFoundation({
    deploymentId: input.civilizationId,
    tier: "enterprise",
    http: httpFoundation,
    openapi: openApiFoundation,
  });

  const integrationFoundation = runCommercialIntegrationFoundation({
    deploymentId: input.civilizationId,
    publicSurface: publicSurfaceFoundation,
    http: httpFoundation,
    openapi: openApiFoundation,
    sdk: sdkFoundation,
  });

  const clientFoundation = runCommercialClientFoundation({
    deploymentId: input.civilizationId,
    tier: "enterprise",
    integration: integrationFoundation,
    sdk: sdkFoundation,
  });

  const releaseFoundation = runCommercialReleaseFoundation({
    deploymentId: input.civilizationId,
    tier: "enterprise",
    publicSurface: publicSurfaceFoundation,
    finalization: finalizationFoundation,
    http: httpFoundation,
    integration: integrationFoundation,
    client: clientFoundation,
  });

  const discoveryFoundation = runCommercialDiscoveryFoundation({
    deploymentId: input.civilizationId,
    release: releaseFoundation,
    sampleQuery: "commercial api",
  });

  const supportFoundation = runCommercialSupportFoundation({
    deploymentId: input.civilizationId,
    discovery: discoveryFoundation,
    sampleFeedback: { category: "api", subject: "ecology hook", body: "stub" },
  });

  const trustFoundation = runCommercialTrustFoundation({
    deploymentId: input.civilizationId,
    support: supportFoundation,
  });

  const transparencyFoundation = runCommercialTransparencyFoundation({
    deploymentId: input.civilizationId,
    release: releaseFoundation,
    trust: trustFoundation,
  });

  const v36ObservedHooks = [
    formatPublicSurfaceRuntimeHook(publicSurfaceFoundation),
    formatHttpRuntimeHook(httpFoundation),
    formatIntegrationRuntimeHook(integrationFoundation),
    formatClientRuntimeHook(clientFoundation),
    formatReleasePortalRuntimeHook(releaseFoundation),
    formatDiscoveryRuntimeHook(discoveryFoundation),
    formatSupportPortalReadyHook(supportFoundation),
    formatTrustCenterReadyHook(trustFoundation),
    formatTransparencyCenterReadyHook(transparencyFoundation),
  ];

  const closureFoundation = runCommercialClosureFoundation({
    deploymentId: input.civilizationId,
    finalization: finalizationFoundation,
    discovery: discoveryFoundation,
    transparency: transparencyFoundation,
    observedHooks: v36ObservedHooks,
  });

  const productFoundation = runCommercialProductFoundation({
    deploymentId: input.civilizationId,
    tier: "enterprise",
    closure: closureFoundation,
  });

  const commerceFoundation = runCommercialCommerceFoundation({
    deploymentId: input.civilizationId,
    tier: "enterprise",
    product: productFoundation,
  });

  const operationsFoundation = runCommercialOperationsFoundation({
    deploymentId: input.civilizationId,
    tier: "enterprise",
    product: productFoundation,
    commerce: commerceFoundation,
  });

  const portalFoundation = runCommercialPortalFoundation({
    deploymentId: input.civilizationId,
    tier: "enterprise",
    product: productFoundation,
    commerce: commerceFoundation,
    operations: operationsFoundation,
  });

  const v37ClosureFoundation = runCommercialV37ClosureFoundation({
    deploymentId: input.civilizationId,
    v36Closure: closureFoundation,
    product: productFoundation,
    commerce: commerceFoundation,
    operations: operationsFoundation,
    portal: portalFoundation,
    observedHooks: [
      formatProductSurfaceReadyHook(productFoundation),
      formatPricingSurfaceReadyHook(commerceFoundation),
      formatOperationsSurfaceReadyHook(operationsFoundation),
      formatPortalSurfaceReadyHook(portalFoundation),
    ],
  });

  const v37SupportFoundation = runCommercialV37SupportFoundation({
    deploymentId: input.civilizationId,
    tier: "enterprise",
    product: productFoundation,
    portal: portalFoundation,
    v37Closure: v37ClosureFoundation,
  });

  const v37FinalFoundation = runCommercialV37FinalFoundation({
    deploymentId: input.civilizationId,
    v37Closure: v37ClosureFoundation,
    v37Support: v37SupportFoundation,
    observedHooks: [
      formatProductSurfaceReadyHook(productFoundation),
      formatPricingSurfaceReadyHook(commerceFoundation),
      formatOperationsSurfaceReadyHook(operationsFoundation),
      formatPortalSurfaceReadyHook(portalFoundation),
      formatV37ClosureReadyHook(v37ClosureFoundation),
      formatV37SupportSurfaceReadyHook(v37SupportFoundation),
    ],
  });

  const v37PhaseClosureFoundation = runCommercialV37PhaseClosureFoundation({
    deploymentId: input.civilizationId,
    v37Final: v37FinalFoundation,
    observedHooks: [
      formatProductSurfaceReadyHook(productFoundation),
      formatPricingSurfaceReadyHook(commerceFoundation),
      formatOperationsSurfaceReadyHook(operationsFoundation),
      formatPortalSurfaceReadyHook(portalFoundation),
      formatV37ClosureReadyHook(v37ClosureFoundation),
      formatV37SupportSurfaceReadyHook(v37SupportFoundation),
      formatFinalSurfaceReadyHook(v37FinalFoundation),
    ],
  });

  const v37LaunchFoundation = runCommercialV37LaunchFoundation({
    deploymentId: input.civilizationId,
    v37PhaseClosure: v37PhaseClosureFoundation,
    v37Final: v37FinalFoundation,
    observedHooks: [
      formatProductSurfaceReadyHook(productFoundation),
      formatPricingSurfaceReadyHook(commerceFoundation),
      formatOperationsSurfaceReadyHook(operationsFoundation),
      formatPortalSurfaceReadyHook(portalFoundation),
      formatV37ClosureReadyHook(v37ClosureFoundation),
      formatV37SupportSurfaceReadyHook(v37SupportFoundation),
      formatFinalSurfaceReadyHook(v37FinalFoundation),
      formatV37PhaseClosureReadyHook(v37PhaseClosureFoundation),
    ],
  });

  const v37OperatingFoundation = runCommercialV37OperatingFoundation({
    deploymentId: input.civilizationId,
    v37Launch: v37LaunchFoundation,
    v37PhaseClosure: v37PhaseClosureFoundation,
    assistive: true,
  });

  const v37SunsetFoundation = runCommercialV37SunsetFoundation({
    deploymentId: input.civilizationId,
    v37Operating: v37OperatingFoundation,
    v37PhaseClosure: v37PhaseClosureFoundation,
  });

  const v37ArchiveFoundation = runCommercialV37ArchiveFoundation({
    deploymentId: input.civilizationId,
    v37Sunset: v37SunsetFoundation,
    v37PhaseClosure: v37PhaseClosureFoundation,
  });

  const v37LegacyFoundation = runCommercialV37LegacyFoundation({
    deploymentId: input.civilizationId,
    v37Archive: v37ArchiveFoundation,
  });

  const v37AtlasFoundation = runCommercialV37AtlasFoundation({
    deploymentId: input.civilizationId,
    v37Legacy: v37LegacyFoundation,
    phaseClosed: v37PhaseClosureFoundation.phaseClosed,
  });

  const v37HubFoundation = runCommercialV37HubFoundation({
    deploymentId: input.civilizationId,
    v37Atlas: v37AtlasFoundation,
    phaseClosed: v37PhaseClosureFoundation.phaseClosed,
  });

  const v37StabilizationFoundation = runCommercialV37StabilizationFoundation({
    deploymentId: input.civilizationId,
    v37Hub: v37HubFoundation,
  });

  const debugSummary = [
    `Civilization Ecology Skeleton ${CIVILIZATION_ECOLOGY_SKELETON_VERSION}`,
    formatCommercializationFreezeHook(commercialFreeze),
    formatDeploymentRuntimeHook(deploymentFoundation),
    formatObservabilityRuntimeHook(observabilityFoundation),
    formatReliabilityRuntimeHook(reliabilityFoundation),
    formatCommercialGovernanceHook(governanceFoundation),
    formatPackagingRuntimeHook(packagingFoundation),
    formatDeliveryRuntimeHook(packagingFoundation),
    formatGatewayRuntimeHook(gatewayFoundation),
    formatFinalizationRuntimeHook(finalizationFoundation),
    formatCommercialStackSealedHook(finalizationFoundation),
    formatFreezeClosedHook(finalizationFoundation),
    formatCompatibilityVerifiedHook(finalizationFoundation),
    formatPublicSurfaceRuntimeHook(publicSurfaceFoundation),
    formatPublicManifestHook(publicSurfaceFoundation),
    formatHttpRuntimeHook(httpFoundation),
    formatOpenApiRuntimeHook(openApiFoundation),
    formatSdkRuntimeHook(sdkFoundation),
    formatIntegrationRuntimeHook(integrationFoundation),
    formatIntegrationVerifiedHook(integrationFoundation),
    formatClientRuntimeHook(clientFoundation),
    formatClientDemoReadyHook(clientFoundation),
    formatReleasePortalRuntimeHook(releaseFoundation),
    formatReleaseBundlePublishedHook(releaseFoundation),
    formatDiscoveryRuntimeHook(discoveryFoundation),
    formatSearchIndexReadyHook(discoveryFoundation),
    formatSupportPortalReadyHook(supportFoundation),
    formatFeedbackIntakeReadyHook(supportFoundation),
    formatIssueIntakeReadyHook(supportFoundation),
    formatTrustCenterReadyHook(trustFoundation),
    formatSecurityPostureReadyHook(trustFoundation),
    formatPrivacyNoticeReadyHook(trustFoundation),
    formatLegalNoticeReadyHook(trustFoundation),
    formatTransparencyCenterReadyHook(transparencyFoundation),
    formatPublicAuditReadyHook(transparencyFoundation),
    formatPublicReportingReadyHook(transparencyFoundation),
    formatMetricsSnapshotReadyHook(transparencyFoundation),
    formatV36PhaseClosedHook(closureFoundation),
    formatSurfaceSealedHook(closureFoundation),
    formatArchiveReadyHook(closureFoundation),
    formatVersionLockReadyHook(closureFoundation),
    formatProductCatalogReadyHook(productFoundation),
    formatEntitlementModelReadyHook(productFoundation),
    formatWorkspaceReadyHook(productFoundation),
    formatProductSurfaceReadyHook(productFoundation),
    formatPricingTableReadyHook(commerceFoundation),
    formatQuoteBuilderReadyHook(commerceFoundation),
    formatCommercialTermsReadyHook(commerceFoundation),
    formatPricingSurfaceReadyHook(commerceFoundation),
    formatOrderModelReadyHook(operationsFoundation),
    formatSubscriptionModelReadyHook(operationsFoundation),
    formatTrialModelReadyHook(operationsFoundation),
    formatOnboardingReadyHook(operationsFoundation),
    formatOperationsSurfaceReadyHook(operationsFoundation),
    formatCustomerPortalReadyHook(portalFoundation),
    formatBillingSurfaceReadyHook(portalFoundation),
    formatInvoiceSurfaceReadyHook(portalFoundation),
    formatAccountSurfaceReadyHook(portalFoundation),
    formatPortalSurfaceReadyHook(portalFoundation),
    formatV37PhaseClosedHook(v37ClosureFoundation),
    formatV37SurfaceSealedHook(v37ClosureFoundation),
    formatV37FreezeReadyHook(v37ClosureFoundation),
    formatV37RegistryReadyHook(v37ClosureFoundation),
    formatV37ClosureReadyHook(v37ClosureFoundation),
    formatSupportModelReadyHook(v37SupportFoundation),
    formatCustomerSuccessReadyHook(v37SupportFoundation),
    formatFeedbackModelReadyHook(v37SupportFoundation),
    formatEscalationReadyHook(v37SupportFoundation),
    formatOperationalGovernanceReadyHook(v37SupportFoundation),
    formatV37SupportSurfaceReadyHook(v37SupportFoundation),
    formatV37FinalClosedHook(v37FinalFoundation),
    formatReleasePackReadyHook(v37FinalFoundation),
    formatPublicIndexReadyHook(v37FinalFoundation),
    formatStableFreezeReadyHook(v37FinalFoundation),
    formatFinalSurfaceReadyHook(v37FinalFoundation),
    formatCommercialProductizationPhaseClosedHook(v37PhaseClosureFoundation),
    formatAggregateVerificationReadyHook(v37PhaseClosureFoundation),
    formatV37PhaseSurfaceLockReadyHook(v37PhaseClosureFoundation),
    formatV37PhaseVersionFreezeReadyHook(v37PhaseClosureFoundation),
    formatV37PhaseClosureReadyHook(v37PhaseClosureFoundation),
    formatLaunchCandidateReadyHook(v37LaunchFoundation),
    formatHandoffReadyHook(v37LaunchFoundation),
    formatMaintenanceReadyHook(v37LaunchFoundation),
    formatPublicReadinessReadyHook(v37LaunchFoundation),
    formatLaunchSurfaceReadyHook(v37LaunchFoundation),
    formatOperatingStateReadyHook(v37OperatingFoundation),
    formatV37RenewalReadyHook(v37OperatingFoundation),
    formatV37OperatingArchiveReadyHook(v37OperatingFoundation),
    formatLongTermSupportReadyHook(v37OperatingFoundation),
    formatOperatingSurfaceReadyHook(v37OperatingFoundation),
    formatSunsetReadyHook(v37SunsetFoundation),
    formatDecommissionReadyHook(v37SunsetFoundation),
    formatRetentionReadyHook(v37SunsetFoundation),
    formatAuditTrailReadyHook(v37SunsetFoundation),
    formatSunsetSurfaceReadyHook(v37SunsetFoundation),
    formatReadonlyArchiveReadyHook(v37ArchiveFoundation),
    formatRetirementReadyHook(v37ArchiveFoundation),
    formatV37ArchiveHistoricalReferenceReadyHook(v37ArchiveFoundation),
    formatImmutableSnapshotReadyHook(v37ArchiveFoundation),
    formatArchiveSurfaceReadyHook(v37ArchiveFoundation),
    formatLegacySupportReadyHook(v37LegacyFoundation),
    formatEndOfLifeReadyHook(v37LegacyFoundation),
    formatPublicHistoryReadyHook(v37LegacyFoundation),
    formatImmutableReferenceReadyHook(v37LegacyFoundation),
    formatTerminalSurfaceReadyHook(v37LegacyFoundation),
    formatMasterAtlasReadyHook(v37AtlasFoundation),
    formatUnifiedIndexReadyHook(v37AtlasFoundation),
    formatFullLifecycleMapReadyHook(v37AtlasFoundation),
    formatPublicOverviewReadyHook(v37AtlasFoundation),
    formatMasterSurfaceReadyHook(v37AtlasFoundation),
    formatCanonicalReferenceReadyHook(v37HubFoundation),
    formatUnifiedPortalReadyHook(v37HubFoundation),
    formatImmutableEntryReadyHook(v37HubFoundation),
    formatFinalFreezeReadyHook(v37HubFoundation),
    formatHubSurfaceReadyHook(v37HubFoundation),
    formatHubFreezeReadyHook(v37HubFoundation.hubFreeze),
    formatConsolidationReadyHook(v37StabilizationFoundation),
    formatFreezeBoundaryReadyHook(v37StabilizationFoundation),
    formatRegressionBaselineReadyHook(v37StabilizationFoundation),
    formatStabilizationReleaseReadyHook(v37StabilizationFoundation),
    formatStabilizationSurfaceReadyHook(v37StabilizationFoundation),
    formatEcologicalTrackingSummary(ecologyTracking),
    formatEcologicalObservationSummary(ecologyObservation),
    formatEcologicalQuarantineSummary(ecologyQuarantine),
    formatEcologicalContainmentSummary(ecologyContainment),
    formatEcologicalInterceptionSummary(ecologyInterception),
    formatEcologicalSafeguardingSummary(ecologySafeguarding),
    formatEcologicalPreservationSummary(ecologyPreservation),
    formatEcologicalRetentionSummary(ecologyRetention),
    formatEcologicalLatchingSummary(ecologyLatching),
    formatEcologicalEmbeddingSummary(ecologyEmbedding),
    formatEcologicalInfiltrationSummary(ecologyInfiltration),
    formatEcologicalPermeationSummary(ecologyPermeation),
    formatEcologicalDiffusionSummary(ecologyDiffusion),
    formatEcologicalPropagationSummary(ecologyPropagation),
    formatEcologicalAmplificationSummary(ecologyAmplification),
    formatEcologicalResonanceSummary(ecologyResonance),
    formatEcologicalHarmonizationSummary(ecologyHarmonization),
    formatEcologicalConvergenceSummary(ecologyConvergence),
    formatEcologicalIntegrationSummary(ecologyIntegration),
    formatEcologicalAscensionSummary(ecologyAscension),
    formatEcologicalFlourishingSummary(ecologyFlourishing),
    formatEcologicalRegenerationSummary(ecologyRegeneration),
    formatEcologicalReconstructionSummary(ecologyReconstruction),
    formatEcologicalRecoverySummary(ecologyRecovery),
    formatEcologicalPersistenceSummary(ecologyPersistence),
    formatEcologicalContinuationSummary(ecologyContinuation),
    formatTransitionSummary(transition),
    formatSessionSummary(session),
    formatResponseSummary(response),
    formatQuerySummary(query),
    formatCatalogSummary(catalog),
    formatArchiveSummary(archive),
    formatMemorySummary(memory),
    formatIdentitySummary(identity),
    formatLineageSummary(lineage),
    formatContinuitySummary(continuity),
    formatAutonomousClosureSummary(closure),
    formatGovernanceSummary(governance),
    formatStabilizationSummary(stabilization),
    formatAssimilationSummary(assimilation),
    formatEvolutionFeedbackSummary(feedback),
    formatTransmissionSummary(transmission),
    formatEvolutionSummary(evolution),
    formatClosedLoopDebugSummary(
      adaptation,
      orchestrationSummaryFromPass(finalPass),
    ),
    ...ECOLOGY_RUNTIME_PIPELINE.map((s) => s.label),
    `index=${finalPass.ecologyIndex} state=${finalPass.ecologicalState} synergistic=${intelligence.ecologicallySynergistic}`,
  ].join("\n");

  return {
    version: CIVILIZATION_ECOLOGY_SKELETON_VERSION,
    civilizationId: input.civilizationId,
    traceId: finalPass.ctx.traceId,
    correlationId: finalPass.ctx.correlationId,
    ranAt: finalPass.ctx.ranAt,
    ecologyIndex: finalPass.ecologyIndex,
    ecologicalState: finalPass.ecologicalState,
    slices,
    traces,
    intelligence,
    debug: { summary: debugSummary, skeleton: true },
  };
}
