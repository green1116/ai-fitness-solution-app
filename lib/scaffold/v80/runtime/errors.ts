/** V80 CODE P2 — runtime errors */
export class V80RuntimeError extends Error {
  constructor(
    message: string,
    readonly code: string,
    readonly status: number = 400,
  ) {
    super(message);
    this.name = "V80RuntimeError";
  }
}
