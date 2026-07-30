import { OpsAreas } from "@/components/screens/ops/OpsAreas";
import type { OpsAreaId } from "@/lib/frontend/navigation";

/** FEATCMP-ADMIN-OPS — OPS-AREA ×5 */
export function AdminOpsFeature({
  activeArea = "",
}: Readonly<{ activeArea?: OpsAreaId | "" }>) {
  return (
    <div data-featcmp="FEATCMP-ADMIN-OPS">
      <OpsAreas activeArea={activeArea} />
    </div>
  );
}
