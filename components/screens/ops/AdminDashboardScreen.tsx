import { AdminOpsFeature } from "@/components/features/AdminOpsFeature";
import { LayoutHost } from "@/components/layout-host/LayoutHost";
import type { OpsAreaId } from "@/lib/frontend/navigation";

type AdminDashboardScreenProps = Readonly<{
  area?: OpsAreaId | "";
}>;

/**
 * SCRCMP-ADMIN — SCR-09.
 * Composes FEATCMP-ADMIN-OPS into LAYCMP-OPS.
 */
export function AdminDashboardScreen({
  area = "",
}: AdminDashboardScreenProps) {
  return (
    <section
      data-scrcmp="SCRCMP-ADMIN"
      data-screen="SCR-09"
      data-page="PG-ADMIN"
      data-layout="LAY-OPS"
      data-ops-area={area || "all"}
    >
      <LayoutHost
        screenId="SCR-09"
        areas={<AdminOpsFeature activeArea={area} />}
      />
    </section>
  );
}
