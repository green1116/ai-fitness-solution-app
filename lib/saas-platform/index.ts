export * as foundation from "./foundation";
export * as runtime from "./runtime";
export * as lifecycle from "./lifecycle";
export * as commercial from "./commercial";
export * as rbac from "./rbac";
export * as subscription from "./subscription";
export * as portal from "./portal";

export const SAAS_PLATFORM_META = {
  version: "v48-production-saas-foundation",
  tag: "v48-production-saas-foundation",
  phases: [
    "v48-saas-foundation-p1",
    "v48-saas-runtime-p2",
    "v48-saas-lifecycle-p3",
    "v48-saas-commercial-adapter-p4",
    "v48-saas-rbac-p5",
    "v48-saas-subscription-p6",
    "v48-saas-portal-p7",
  ],
} as const;
