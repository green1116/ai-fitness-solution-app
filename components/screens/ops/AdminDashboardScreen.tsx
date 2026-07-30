import { LayoutHost } from "@/components/layout-host/LayoutHost";
import { OpsAreas } from "@/components/screens/ops/OpsAreas";
import type { OpsAreaId } from "@/lib/frontend/navigation";

type AdminDashboardScreenProps = Readonly<{
  area?: OpsAreaId | "";
}>;

/**
 * SCRCMP-ADMIN — SCR-09 Admin Dashboard (LAY-OPS).
 * Reuses FE-1 LayoutHost + GRD-OPS on `/admin`; presentation only.
 */
export function AdminDashboardScreen({
  area = "",
}: AdminDashboardScreenProps) {
  return (
    <section
      data-screen="SCR-09"
      data-page="PG-ADMIN"
      data-layout="LAY-OPS"
      data-ops-area={area || "all"}
    >
      <LayoutHost screenId="SCR-09" areas={<OpsAreas activeArea={area} />} />
    </section>
  );
}
