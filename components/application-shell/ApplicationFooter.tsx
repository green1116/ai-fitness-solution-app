import { ContinuityEntryNavigation } from "@/components/navigation/ContinuityEntryNavigation";
import { GoalEntryNavigation } from "@/components/navigation/GoalEntryNavigation";

/**
 * Optional non-primary Entry chrome (PD-4.1 SHELL-FOOTER).
 * Hosts goal + continuity navigation skeleton without altering Screen MAIN content.
 */
export function ApplicationFooter() {
  return (
    <footer
      data-shell-region="footer"
      className="border-t border-slate-200 bg-slate-50 text-slate-600"
    >
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-6 py-8">
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
          <p>AI Fitness Solution</p>
          <p>Enterprise fitness planning workspace</p>
        </div>

        <div data-nav-skeleton="entry" className="grid gap-8 md:grid-cols-2">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
              Goals
            </p>
            <div className="mt-3">
              <GoalEntryNavigation />
            </div>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
              Continuity
            </p>
            <div className="mt-3">
              <ContinuityEntryNavigation />
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
