import type { WorkflowP5Event } from "../shared/workflow-p5-types";

const p5Events: WorkflowP5Event[] = [];

export function recordWorkflowP5Event(
  input: Omit<WorkflowP5Event, "eventId" | "timestamp">,
): WorkflowP5Event {
  const event: WorkflowP5Event = {
    ...input,
    eventId: `wf-p5-event-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`,
    timestamp: new Date().toISOString(),
  };
  p5Events.push(event);
  return { ...event };
}

export function listWorkflowP5Events(workspaceProductId?: string): WorkflowP5Event[] {
  const events = workspaceProductId
    ? p5Events.filter((event) => event.workspaceProductId === workspaceProductId)
    : [...p5Events];
  return events.map((event) => ({ ...event }));
}

export function clearWorkflowP5Events(): void {
  p5Events.length = 0;
}

export function getWorkflowP5EventCount(): number {
  return p5Events.length;
}
