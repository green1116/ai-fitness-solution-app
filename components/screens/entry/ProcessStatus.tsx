/**
 * CMP-STATUS-PROCESS — SCR-03 status zone.
 * Presentation status only; no extraction outcome decisions.
 */
export function ProcessStatus() {
  return (
    <div
      data-cmp="CMP-STATUS-PROCESS"
      data-int-id="INT-INTAKE-STATUS"
      data-action-id="ACT-03-02"
      aria-live="polite"
    >
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
        Processing status
      </p>
      <p className="mt-3 text-sm text-slate-700">
        Status: <span className="font-semibold text-slate-950">Idle</span>
      </p>
      <p className="mt-1 text-sm text-slate-600">
        Upload a tender document to begin understanding.
      </p>
    </div>
  );
}
