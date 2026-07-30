/**
 * FE-4.3 — Security Presentation verification (PD-4.6).
 */
import fs from "node:fs";
import path from "node:path";

import {
  AUTH_PRESENTATION_CLASSES,
  FORBIDDEN_SECURITY_ROUTES,
  SAFE_QUERY_CUE_KEYS,
  SECURITY_BASELINE_ID,
  SECURITY_FALLBACK_ROUTES,
  SENSITIVE_FIELD_KEYS,
  VISIBILITY_KEYS,
  assertsNoRbacEngineInModule,
  authClassUserMessage,
  classifyAuthSignal,
  clearSessionPresentation,
  isAllowedSecurityFallback,
  isSafeQueryCueKey,
  isSensitiveFieldKey,
  presentSessionFromObservation,
  resolveGuardSecurityDecision,
  resolvePermissionVisibility,
  scrubSensitiveFields,
  sessionInvalidationTargets,
  settleSecuritySignal,
  shouldShowOpsShellNav,
} from "../lib/frontend/presentation-security";
import { settleAdapterFailure } from "../lib/frontend/presentation-adapter";
import { PRESENTATION_GUARD_IDS } from "../lib/frontend/presentation-guards";
import { STATE_CLASS_IDS } from "../lib/frontend/state-taxonomy";

function assert(cond: boolean, msg: string) {
  if (!cond) throw new Error(msg);
}

assert(SECURITY_BASELINE_ID === "product-frontend-security-v1", "baseline id");
assert(VISIBILITY_KEYS.length === 6, "VIS catalogue");
assert(AUTH_PRESENTATION_CLASSES.length === 4, "auth classes");
assert(SECURITY_FALLBACK_ROUTES.length === 3, "fallback routes");
assert(PRESENTATION_GUARD_IDS.length === 5, "GRD catalogue reused");
console.log("PASS PD-4.6 security catalogues");

const signedOut = resolvePermissionVisibility({ session: null });
assert(signedOut.showSignIn && !signedOut.showOpsChrome, "VIS-SIGNED-OUT");
assert(signedOut.keys.includes("VIS-SIGNED-OUT"), "signed-out key");

const signedIn = resolvePermissionVisibility({
  session: { presentedSession: true, presentedOpsCapability: false },
});
assert(signedIn.showCustomerAffordances && !signedIn.showOpsChrome, "customer");
assert(signedIn.keys.includes("VIS-OPS-DENIED"), "ops denied");

const ops = resolvePermissionVisibility({
  session: { presentedSession: true, presentedOpsCapability: true },
  projectCue: "p1",
});
assert(ops.showOpsChrome && ops.keys.includes("VIS-OPS"), "VIS-OPS");

const disabled = resolvePermissionVisibility({
  session: { signedIn: true, displayName: "A", opsCapable: false },
  meta: { loading: "loading", error: null, empty: false },
});
assert(disabled.actionDisabled, "VIS-ACTION-DISABLED");
console.log("PASS permission visibility (≠ authorization)");

assert(classifyAuthSignal({ status: 401 }) === "UNAUTH", "401");
assert(classifyAuthSignal({ status: 403 }) === "FORBIDDEN", "403");
assert(classifyAuthSignal({ code: "EXPIRED" }) === "EXPIRED", "expired");
assert(classifyAuthSignal({ code: "NETWORK" }) === "UNAVAILABLE", "network");
assert(authClassUserMessage("FORBIDDEN") === "Access unavailable", "copy");
console.log("PASS UNAUTH/FORBIDDEN/EXPIRED/UNAVAILABLE mapping");

const unauth = settleSecuritySignal({
  status: 401,
  context: "customer-command",
  resumePath: "/workspace",
});
assert(unauth.authClass === "UNAUTH", "settle unauth");
assert(!unauth.session.signedIn, "session cleared");
assert(unauth.fallback?.offerSignIn === true, "sign-in offer");
assert(
  isAllowedSecurityFallback(unauth.fallback!.to),
  "fallback allowed",
);

const opsDeny = settleSecuritySignal({
  code: "FORBIDDEN",
  context: "grd-ops",
});
assert(opsDeny.fallback?.to === "/", "ops fail closed to entry");

const bootDown = settleSecuritySignal({
  code: "UNAVAILABLE",
  context: "boot",
});
assert(bootDown.fallback?.to === "/unavailable", "boot unavailable");

for (const bad of FORBIDDEN_SECURITY_ROUTES) {
  assert(!isAllowedSecurityFallback(bad), `no ${bad}`);
}
console.log("PASS safe fallbacks (no /forbidden)");

const cleared = clearSessionPresentation();
assert(!cleared.signedIn && !cleared.opsCapable, "clear session");
const presented = presentSessionFromObservation({
  presentedSession: true,
  presentedOpsCapability: false,
  }, "Ada");
assert(presented.signedIn && presented.displayName === "Ada", "observe→SES");
assert(
  sessionInvalidationTargets().includes("session"),
  "sign-in-out invalidation",
);
console.log("PASS session presentation handling");

const grd = resolveGuardSecurityDecision({
  pathname: "/admin",
  session: { presentedSession: true, presentedOpsCapability: false },
});
assert(grd.action === "redirect" && grd.reason === "GRD-OPS", "GRD-OPS meaning");

const ctx = resolveGuardSecurityDecision({
  pathname: "/workspace",
  projectId: null,
  session: { presentedSession: true, presentedOpsCapability: false },
});
assert(ctx.action === "soft-context", "GRD-CONTEXT soft, not auth deny");
console.log("PASS GRD-* security reading");

assert(
  !shouldShowOpsShellNav({
    shellMode: "work",
    visibility: ops,
  }),
  "no admin in customer chrome",
);
assert(
  shouldShowOpsShellNav({
    shellMode: "ops",
    visibility: ops,
  }),
  "ops chrome on ops shell",
);
console.log("PASS customer vs ops shell separation");

assert(isSensitiveFieldKey("password"), "password sensitive");
assert(isSensitiveFieldKey("accessToken"), "token sensitive");
const scrubbed = scrubSensitiveFields({
  projectId: "p1",
  password: "secret",
  otp: "123456",
  goalCue: "Builder",
});
assert(scrubbed.projectId === "p1" && scrubbed.goalCue === "Builder", "keep cues");
assert(!("password" in scrubbed) && !("otp" in scrubbed), "scrub secrets");
assert(isSafeQueryCueKey("projectId") && !isSafeQueryCueKey("token"), "query cues");
assert(SAFE_QUERY_CUE_KEYS.includes("category"), "category cue");
assert(SENSITIVE_FIELD_KEYS.length >= 8, "sensitive catalogue");
console.log("PASS sensitive data handling");

const adapterFail = settleAdapterFailure({ status: 403 });
assert(
  adapterFail.meta.error === "Access unavailable" && !adapterFail.wroteServer,
  "adapter failure uses security copy; no fake Objects",
);
console.log("PASS FE-4.2 adapter × FE-4.3 security settle");

assert(STATE_CLASS_IDS.length === 7, "no new state taxonomy");
assert(assertsNoRbacEngineInModule() === true, "no RBAC engine module");

const root = path.resolve(__dirname, "..");
const securityFile = path.join(root, "lib/frontend/presentation-security.ts");
const text = fs.readFileSync(securityFile, "utf8");
assert(!/\bfetch\s*\(/.test(text), "no fetch ownership in FE-4.3");
assert(!/\baxios\b/.test(text), "no axios");
assert(!/\bprisma\b/i.test(text), "no prisma");
assert(
  !/from\s+["']@\/lib\/(services|product|tender|saas|billing|operations|persistence)/.test(
    text,
  ),
  "no Domain imports",
);
assert(
  !/\b(evaluatePermission|checkEntitlement|roleMatrix|hasRole\s*\()/.test(text),
  "no RBAC policy engine",
);
assert(!text.includes("export const STATE_CLASS_IDS"), "no taxonomy redefine");
console.log("PASS no business logic / no Domain/API ownership");

console.log("\nFE-4.3 security presentation verification complete");
