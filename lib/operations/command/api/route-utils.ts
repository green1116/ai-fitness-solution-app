import { NextResponse } from "next/server";

export function commandApiResponse(data: unknown, status = 200) {
  return NextResponse.json(data, { status });
}

export function commandApiError(message: string, status = 400) {
  return NextResponse.json({ ok: false, error: message }, { status });
}

export async function parseCommandApiBody<T extends Record<string, unknown>>(
  request: Request,
): Promise<T | null> {
  try {
    return (await request.json()) as T;
  } catch {
    return null;
  }
}

export function deploymentIdFromRequest(request: Request, body?: { deploymentId?: string }): string | undefined {
  const url = new URL(request.url);
  return body?.deploymentId ?? url.searchParams.get("deploymentId") ?? undefined;
}
