export const WORKSPACE_BUSINESS_RUNTIME_VERSION = "v54-workspace-business-runtime" as const;

export const WORKSPACE_BUSINESS_RUNTIME_P1_TAG = "v54-workspace-business-p1" as const;

export const WORKSPACE_BUSINESS_BRIDGE_VERSION = "v54-p1" as const;

export const V53_RUNTIME_FINAL_DEPENDENCY_TAG = "v53-workspace-runtime-final" as const;

export const BUSINESS_SURFACE_KEYS = ["workspace", "quote", "project", "report"] as const;

export type BusinessSurfaceKey = (typeof BUSINESS_SURFACE_KEYS)[number];
