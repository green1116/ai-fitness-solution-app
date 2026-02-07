// lib/api-response.ts
import { NextResponse } from "next/server";

export type ApiErrorCode =
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "TOKEN_INVALID"
  | "TOKEN_EXPIRED"
  | "TOKEN_REVOKED"
  | "LICENSE_NOT_FOUND"
  | "LICENSE_EXCEEDED"
  | "RATE_LIMITED"
  | "BAD_REQUEST"
  | "INTERNAL_ERROR";

export function requestIdFromHeaders(headers: Headers) {
  // 允许从反代透传，也允许自生成
  return (
    headers.get("x-request-id") ||
    headers.get("x-vercel-id") ||
    crypto.randomUUID()
  );
}

export function ok(data: any, init?: ResponseInit) {
  return NextResponse.json({ ok: true, ...data }, init);
}

export function fail(
  code: ApiErrorCode,
  message: string,
  status: number,
  requestId: string,
  extra?: Record<string, any>
) {
  return NextResponse.json(
    { ok: false, code, message, requestId, ...(extra || {}) },
    { status }
  );
}

