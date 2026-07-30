/**
 * CMP-ACCESS-SIGNIN / CMP-ACCESS-LANGUAGE — SCR-01 access zone.
 * Presentation affordances only; no auth provider or locale pipeline ownership.
 */
export function AccessControls() {
  return (
    <div
      data-cmp="CMP-ACCESS"
      className="flex flex-wrap items-center gap-4"
      aria-label="Access"
    >
      <a
        href="/?signin=1"
        data-cmp="CMP-ACCESS-SIGNIN"
        data-int-id="INT-ACCESS-SIGNIN"
        data-action-id="ACT-01-01"
        className="text-sm font-semibold text-slate-950 underline underline-offset-4"
      >
        Sign In
      </a>
      <label
        data-cmp="CMP-ACCESS-LANGUAGE"
        data-int-id="INT-ACCESS-LANGUAGE"
        data-action-id="ACT-01-02"
        className="flex items-center gap-2 text-sm text-slate-600"
      >
        <span>Language</span>
        <select
          className="rounded-md border border-slate-300 bg-white px-2 py-1 text-slate-950"
          defaultValue="en"
          aria-label="Select language"
        >
          <option value="en">English</option>
          <option value="zh">中文</option>
        </select>
      </label>
    </div>
  );
}
