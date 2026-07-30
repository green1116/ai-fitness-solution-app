import { AdminDashboardScreen } from "@/components/screens/ops/AdminDashboardScreen";
import { OPS_AREA_IDS, type OpsAreaId } from "@/lib/frontend/navigation";

type AdminPageProps = Readonly<{
  searchParams: Promise<{ area?: string | string[] }>;
}>;

function readArea(value: string | string[] | undefined): OpsAreaId | "" {
  const raw = Array.isArray(value)
    ? (value[0]?.trim().toLowerCase() ?? "")
    : (value?.trim().toLowerCase() ?? "");
  if ((OPS_AREA_IDS as readonly string[]).includes(raw)) {
    return raw as OpsAreaId;
  }
  return "";
}

/**
 * PG-ADMIN → SCR-09 Admin Dashboard (PD-4.2 RT-ADMIN).
 * Optional `area` focus stays on SCR-09; GRD-OPS remains FE-1 PresentationGuardHost.
 */
export default async function AdminPage({ searchParams }: AdminPageProps) {
  const params = await searchParams;
  return <AdminDashboardScreen area={readArea(params.area)} />;
}
