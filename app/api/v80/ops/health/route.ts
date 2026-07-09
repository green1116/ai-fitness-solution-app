import { buildV80DeploymentBinding } from "@/lib/scaffold/v80/ops/deployment.model";
import { runV80IntegrityCheck } from "@/lib/scaffold/v80/ops/governance";
import { getV80PersistenceMode } from "@/lib/scaffold/v80/runtime/store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const binding = buildV80DeploymentBinding();
  const persistence = await getV80PersistenceMode();
  const integrity = await runV80IntegrityCheck();

  return Response.json({
    ok: integrity.ok,
    runtime: "v80-code-release-1",
    deployment: binding,
    persistence,
    integrity,
  });
}
