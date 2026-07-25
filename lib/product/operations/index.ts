/**
 * Product Operations — Operational Console public exports
 * Isolated namespace: lib/product/operations
 */

export {
  OPERATIONS_MANAGER_STATUSES,
  OPERATIONS_READINESS_VERDICTS,
  OPS_CONSOLE_KINDS,
  OPS_CONSOLE_STATUSES,
  OPS_DISPATCH_STATUSES,
  OPS_INCIDENT_SEVERITIES,
  OPS_INCIDENT_STATUSES,
  OPS_PLAYBOOK_KINDS,
  PRODUCT_OPERATIONS_CONSOLE_BASE,
  PRODUCT_OPERATIONS_CONSOLE_FREEZE_VERSION,
  PRODUCT_OPERATIONS_CONSOLE_ID,
  PRODUCT_OPERATIONS_CONSOLE_VERSION,
  PRODUCT_OPERATIONS_FREEZE_VERSION,
} from "./console/console.constants";

export type {
  OperationsManagerStatus,
  OperationsReadinessCheck,
  OperationsReadinessResult,
  OperationsReadinessVerdict,
  OperationsRegistryManifest,
} from "./console/console.types";

export type {
  OpsConsoleKind,
  OpsConsoleStatus,
  OpsSurface,
  RegisterOpsSurfaceInput,
  SurfaceMetadata,
  UpdateOpsSurfaceStatusInput,
} from "./surface/surface.types";

export {
  clearOpsSurfaces,
  getOpsSurface,
  listOpsSurfaces,
  registerOpsSurface,
  updateOpsSurfaceStatus,
} from "./surface/surface.registry";

export type {
  IncidentMetadata,
  OpenOpsIncidentInput,
  OpsIncident,
  OpsIncidentSeverity,
  OpsIncidentStatus,
  UpdateOpsIncidentStatusInput,
} from "./incident/incident.types";

export {
  clearOpsIncidents,
  getOpsIncident,
  listOpsIncidents,
  openOpsIncident,
  updateOpsIncidentStatus,
} from "./incident/incident.registry";

export type {
  OpsPlaybook,
  OpsPlaybookKind,
  PlaybookMetadata,
  RegisterOpsPlaybookInput,
} from "./playbook/playbook.types";

export {
  clearOpsPlaybooks,
  getOpsPlaybook,
  listOpsPlaybooks,
  registerOpsPlaybook,
} from "./playbook/playbook.registry";

export type {
  DispatchMetadata,
  OpsDispatch,
  OpsDispatchStatus,
  QueueOpsDispatchInput,
  RunOpsDispatchInput,
} from "./dispatch/dispatch.types";

export {
  clearOpsDispatches,
  getOpsDispatch,
  listOpsDispatches,
  queueOpsDispatch,
  runOpsDispatch,
} from "./dispatch/dispatch.registry";

export {
  assertOperationsConsoleReadinessReady,
  evaluateOperationsConsoleReadiness,
} from "./console/console.readiness";

export {
  clearOperationsConsoleLayer,
  createOperationsManager,
  getOperationsRegistryManifest,
  type OperationsManager,
  type OperationsManagerSnapshot,
} from "./operations.manager";

export {
  assertProductOperationsReleaseGatePass,
  checkProductOperationsReleaseGate,
  PRODUCT_OPERATIONS_SIGNOFF_VERSION,
  type GateCheckItem,
  type GateVerdict,
  type ReleaseGateResult,
} from "./verify/product.release.gate";
