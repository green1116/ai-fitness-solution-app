import Link from "next/link";

import { OpsArea } from "@/components/screens/ops/OpsArea";
import {
  buildAdminHref,
  OPS_AREA_IDS,
  type OpsAreaId,
} from "@/lib/frontend/navigation";

const OPS_AREAS = [
  {
    id: "organizations" as const,
    title: "Organizations",
    description: "Observe organization inventory for platform operations.",
    actionId: "ACT-09-02",
  },
  {
    id: "users" as const,
    title: "Users",
    description: "Observe user membership cues across organizations.",
    actionId: "ACT-09-03",
  },
  {
    id: "usage" as const,
    title: "Usage",
    description: "Observe usage and capacity presentation for the platform.",
    actionId: "ACT-09-04",
  },
  {
    id: "security" as const,
    title: "Security",
    description: "Observe security posture signals for operations review.",
    actionId: "ACT-09-05",
  },
  {
    id: "governance" as const,
    title: "Governance",
    description: "Observe governance and policy status for the platform.",
    actionId: "ACT-09-06",
  },
] as const satisfies readonly Readonly<{
  id: OpsAreaId;
  title: string;
  description: string;
  actionId: string;
}>[];

type OpsAreasProps = Readonly<{
  activeArea?: OpsAreaId | "";
}>;

/**
 * SCR-09 ops areas set — five CMP-OPS-AREA panels on one Screen (CR-08).
 */
export function OpsAreas({ activeArea = "" }: OpsAreasProps) {
  return (
    <div data-cmp="CMP-OPS-AREA-SET" data-action-id="ACT-09-01">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
        Operations
      </p>
      <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
        Admin dashboard
      </h1>
      <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600">
        Platform operations areas remain on this screen. Focus is optional and
        does not create new routes.
      </p>
      <ul className="mt-6 flex flex-wrap gap-3 text-sm">
        <li>
          <Link
            href={buildAdminHref()}
            data-ops-area="all"
            className={
              !activeArea
                ? "font-semibold text-slate-950 underline underline-offset-4"
                : "font-semibold text-slate-600 underline underline-offset-4"
            }
          >
            All areas
          </Link>
        </li>
        {OPS_AREA_IDS.map((areaId) => {
          const meta = OPS_AREAS.find((area) => area.id === areaId);
          const active = activeArea === areaId;
          return (
            <li key={areaId}>
              <Link
                href={buildAdminHref(areaId)}
                data-ops-area={areaId}
                data-active={active ? "true" : "false"}
                className={
                  active
                    ? "font-semibold text-slate-950 underline underline-offset-4"
                    : "font-semibold text-slate-600 underline underline-offset-4"
                }
              >
                {meta?.title ?? areaId}
              </Link>
            </li>
          );
        })}
      </ul>
      <div className="mt-10 flex flex-col gap-8">
        {OPS_AREAS.map((area) => (
          <OpsArea
            key={area.id}
            id={area.id}
            title={area.title}
            description={area.description}
            actionId={area.actionId}
            active={activeArea === area.id}
          />
        ))}
      </div>
    </div>
  );
}
