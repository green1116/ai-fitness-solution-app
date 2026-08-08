/** V80 scaffold — production release tag */
export const SCAFFOLD_TAG = "v80-code-release-1" as const;

/** @deprecated scaffold-only 501 */
export function scaffoldNotImplemented(route: string, method: string) {
  return Response.json(
    { ok: false, scaffold: true, route, method, hint: "Use lib/scaffold/v80/ runtime handlers" },
    { status: 501 },
  );
}
