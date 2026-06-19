import { DashboardKpiCards } from "../components/dashboard-kpi-cards";
import { MOCK_PORTAL_KPI } from "../hooks/use-portal-kpi";

export function DashboardPageContent() {
  return (
    <div className="space-y-6">
      <section className="space-y-2">
        <h3 className="text-2xl font-semibold">Enterprise Portal</h3>
        <p className="text-sm text-zinc-400">
          V52 P2 session wired · functional surfaces remain in future V52 phases (not started).
        </p>
      </section>

      <DashboardKpiCards kpis={MOCK_PORTAL_KPI} />
    </div>
  );
}
