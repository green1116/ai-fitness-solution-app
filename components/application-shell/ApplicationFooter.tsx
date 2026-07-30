/**
 * Optional non-primary Entry chrome (PD-4.1 SHELL-FOOTER).
 * Brand only — SCR-01 owns goal and continuity zones in MAIN.
 */
export function ApplicationFooter() {
  return (
    <footer
      data-shell-region="footer"
      data-cmp="CMP-SHELL-FOOTER"
      className="border-t border-slate-200 bg-slate-50 text-slate-600"
    >
      <div className="mx-auto flex w-full max-w-7xl flex-wrap items-center justify-between gap-2 px-6 py-4 text-xs">
        <p>AI Fitness Solution</p>
        <p>Enterprise fitness planning workspace</p>
      </div>
    </footer>
  );
}
