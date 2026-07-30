/**
 * Presentation Sign In affordance for GRD-SESSION redirects (ACT-01-01 path cue).
 * Remains on Entry `/` — does not invent a new product route.
 * VIS-SIGNED-OUT (PD-4.6) — visibility only, not authorization.
 */
export function SignInAffordance() {
  return (
    <div
      data-guard="GRD-SESSION"
      data-affordance="signin"
      data-vis="VIS-SIGNED-OUT"
      data-action-id="ACT-01-01"
      data-int-id="INT-ACCESS-SIGNIN"
      className="border-b border-slate-200 bg-slate-50"
    >
      <div className="mx-auto flex w-full max-w-7xl flex-wrap items-center gap-3 px-6 py-3 text-sm">
        <p className="text-slate-700">Sign in to continue your workspace path.</p>
        <span className="font-semibold text-slate-950">Sign In</span>
      </div>
    </div>
  );
}
