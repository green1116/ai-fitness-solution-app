import { NextRequest, NextResponse } from "next/server";

import {
  RUNTIME_EVENT_INTELLIGENCE_VERSION,
  buildRuntimeEventIntelligence,
  runExternalEvidenceRuntime,
  runtimeSnapshotFromSuccess,
} from "@/lib/evidence";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function json(status: number, body: unknown) {
  return NextResponse.json(body, { status });
}

export async function GET() {
  return json(200, {
    ok: true,
    version: RUNTIME_EVENT_INTELLIGENCE_VERSION,
    capabilities: [
      "timeline",
      "correlation",
      "risk",
      "governance-hotspots",
      "release-stability",
      "health",
      "anomalies",
    ],
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json().catch(() => null)) || {};

    if (body.orchestration?.records) {
      const intelligence = buildRuntimeEventIntelligence({
        orchestration: body.orchestration,
        priorSnapshots: body.priorSnapshots,
        runtimeSnapshot: body.runtimeSnapshot,
      });
      return json(200, { ok: true, intelligence });
    }

    const text = String(body.text || body.tenderRawText || "").trim();
    if (!text) {
      return json(400, {
        ok: false,
        code: "INPUT_REQUIRED",
        message: "请提供 orchestration 或 text/tenderRawText",
      });
    }

    const runtimeResult = await runExternalEvidenceRuntime({
      attachments: [
        {
          buffer: Buffer.from(text, "utf8"),
          fileName: body.fileName || "tender.txt",
          mimeType: "text/plain",
        },
      ],
      requirementItems: body.requirementItems ?? [
        {
          id: "req-intel-1",
          title: "招标文件",
          text: text.slice(0, 500),
          keywords: ["招标", "投标"],
          mandatory: true,
          category: "qualification" as const,
        },
      ],
      tenderDocument: {
        documentId: body.documentId || `intel-${Date.now()}`,
        tenderTitle: body.tenderTitle || "Event Intelligence",
      },
      correlationId: body.correlationId,
    });

    if (!runtimeResult.ok) {
      return json(422, runtimeResult);
    }

    const intelligence =
      runtimeResult.runtimeEventIntelligence ??
      buildRuntimeEventIntelligence({
        orchestration: runtimeResult.runtimeEventOrchestration!,
        runtimeSnapshot: runtimeSnapshotFromSuccess(runtimeResult),
        priorSnapshots: body.priorSnapshots,
      });

    return json(200, {
      ok: true,
      runId: runtimeResult.runId,
      intelligence,
      healthLine: intelligence.debug.summary.split("\n").slice(0, 5),
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "intelligence failed";
    return json(500, { ok: false, code: "INTERNAL_ERROR", message });
  }
}
