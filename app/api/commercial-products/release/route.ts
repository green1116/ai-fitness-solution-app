import { NextRequest, NextResponse } from "next/server";
import {
  CP_RELEASE_TAG,
  type ReleaseCreateInput,
} from "@/lib/commercial-products/release/release-types";
import {
  createReleaseHeavy,
  getReleaseHeavy,
  listReleasesHeavy,
  publishReleaseHeavy,
} from "@/lib/commercial-products/release/heavy-release-runtime";
import { NO_STORE_HEADERS, runtime, dynamic } from "@/lib/runtime/api-route-policy";

export { runtime, dynamic };

export async function GET(req: NextRequest) {
  try {
    const params = req.nextUrl.searchParams;
    const releaseId = params.get("releaseId")?.trim() || undefined;
    const tag = params.get("tag")?.trim() || undefined;
    const version = params.get("version")?.trim() || undefined;

    if (releaseId || tag || version) {
      const result = await getReleaseHeavy({ releaseId, tag, version });
      return NextResponse.json(result, { headers: NO_STORE_HEADERS });
    }

    const result = await listReleasesHeavy();
    return NextResponse.json(result, { headers: NO_STORE_HEADERS });
  } catch (error) {
    const message = error instanceof Error ? error.message : "release lookup failed";
    return NextResponse.json(
      { ok: false, code: "RELEASE_LOOKUP_FAILED", message },
      { status: 404, headers: NO_STORE_HEADERS },
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;
    const action = String(body.action ?? "create").trim();

    if (action === "publish") {
      const releaseId = String(body.releaseId ?? "").trim();
      if (!releaseId) {
        return NextResponse.json(
          { ok: false, code: "MISSING_RELEASE_ID", message: "缺少 releaseId" },
          { status: 400, headers: NO_STORE_HEADERS },
        );
      }
      const result = await publishReleaseHeavy({ releaseId });
      return NextResponse.json(result, { headers: NO_STORE_HEADERS });
    }

    const input: ReleaseCreateInput = {
      version: body.version ? String(body.version) : undefined,
      tag: body.tag ? String(body.tag) : CP_RELEASE_TAG,
      features: Array.isArray(body.features) ? body.features.map(String) : undefined,
      verification:
        body.verification && typeof body.verification === "object"
          ? {
              tsc: Boolean((body.verification as Record<string, unknown>).tsc),
              build: Boolean((body.verification as Record<string, unknown>).build),
              verify: Boolean((body.verification as Record<string, unknown>).verify),
            }
          : undefined,
    };

    const result = await createReleaseHeavy(input);
    return NextResponse.json(result, { headers: NO_STORE_HEADERS });
  } catch (error) {
    const message = error instanceof Error ? error.message : "release action failed";
    return NextResponse.json(
      { ok: false, code: "RELEASE_ACTION_FAILED", message },
      { status: 400, headers: NO_STORE_HEADERS },
    );
  }
}
