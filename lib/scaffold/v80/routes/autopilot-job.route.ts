import { handleAutopilotJob } from "../api/handlers";
import { withHandler } from "../api/handler.util";

export async function POST(req: Request) {
  return withHandler("/api/v80/autopilot/job/run", handleAutopilotJob, req);
}
