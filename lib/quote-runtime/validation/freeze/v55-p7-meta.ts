import { WORKSPACE_QUOTE_RUNTIME_P6_TAG } from "../../ports/freeze/v55-p6-meta";
import {
  WORKSPACE_QUOTE_RUNTIME_P1_TAG,
  WORKSPACE_QUOTE_RUNTIME_VERSION,
} from "../../shared/quote-constants";
import { WORKSPACE_QUOTE_RUNTIME_P2_TAG } from "../../freeze/v55-p2-meta";
import { WORKSPACE_QUOTE_RUNTIME_P3_TAG } from "../../domain/freeze/v55-p3-meta";
import { WORKSPACE_QUOTE_RUNTIME_P4_TAG } from "../../lifecycle/freeze/v55-p4-meta";
import { WORKSPACE_QUOTE_RUNTIME_P5_TAG } from "../../assembly/freeze/v55-p5-meta";

export const WORKSPACE_QUOTE_RUNTIME_P7_TAG = "v55-workspace-quote-p7" as const;

export const WORKSPACE_QUOTE_VERIFICATION_VERSION = "v55-p7" as const;

export const V55_FOUNDATION_INTEGRITY_LOCKED = "V55_FOUNDATION_INTEGRITY_LOCKED" as const;

export const V55_QUOTE_FOUNDATION_LAYER_STACK = [
  { phase: "P1", name: "Quote Bridge Foundation", tag: WORKSPACE_QUOTE_RUNTIME_P1_TAG },
  { phase: "P2", name: "Quote Context Foundation", tag: WORKSPACE_QUOTE_RUNTIME_P2_TAG },
  { phase: "P3", name: "Quote Domain Foundation", tag: WORKSPACE_QUOTE_RUNTIME_P3_TAG },
  { phase: "P4", name: "Quote Lifecycle Foundation", tag: WORKSPACE_QUOTE_RUNTIME_P4_TAG },
  { phase: "P5", name: "Quote Assembly Foundation", tag: WORKSPACE_QUOTE_RUNTIME_P5_TAG },
  { phase: "P6", name: "Quote Port Foundation", tag: WORKSPACE_QUOTE_RUNTIME_P6_TAG },
] as const;

export const V55_QUOTE_FOUNDATION_DEPENDENCY_CHAIN = [
  "BRIDGE_ONLY_TO_CONTEXT",
  "CONTEXT_ONLY_TO_DOMAIN",
  "DOMAIN_ONLY_TO_LIFECYCLE",
  "LIFECYCLE_ONLY_TO_ASSEMBLY",
  "ASSEMBLY_ONLY_TO_PORTS",
] as const;

export const V55_QUOTE_P7_VERIFY_CHECKS = [
  "HAS_BRIDGE_LAYER",
  "HAS_CONTEXT_LAYER",
  "HAS_DOMAIN_LAYER",
  "HAS_LIFECYCLE_LAYER",
  "HAS_ASSEMBLY_LAYER",
  "HAS_PORT_LAYER",
  "V55_FOUNDATION_INTEGRITY_LOCKED",
  "NO_WORKFLOW_RUNTIME",
  "NO_PERSISTENCE",
  "NO_API_HANDLER",
  "NO_PRISMA_IMPORT",
] as const;

export const WORKSPACE_QUOTE_RUNTIME_P7_META = {
  tag: WORKSPACE_QUOTE_RUNTIME_P7_TAG,
  version: WORKSPACE_QUOTE_RUNTIME_VERSION,
  verificationVersion: WORKSPACE_QUOTE_VERIFICATION_VERSION,
  phase: "v55-workspace-quote-p7",
  status: "quote-verification-foundation",
  frozen: false,
  dependencyTag: WORKSPACE_QUOTE_RUNTIME_P6_TAG,
  verifyChecks: V55_QUOTE_P7_VERIFY_CHECKS,
  layerStack: V55_QUOTE_FOUNDATION_LAYER_STACK,
  dependencyChain: V55_QUOTE_FOUNDATION_DEPENDENCY_CHAIN,
  integrityLock: V55_FOUNDATION_INTEGRITY_LOCKED,
  nextHorizon: "Quote workspace alignment foundation (not started)",
  note: "V55 P7 locks frozen P1-P6 quote runtime foundation integrity",
} as const;
