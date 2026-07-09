import { handleTenderIntake } from "../api/handlers";
import { withHandler } from "../api/handler.util";

export async function POST(req: Request) {
  return withHandler("/api/v80/tender/intake", handleTenderIntake, req);
}
