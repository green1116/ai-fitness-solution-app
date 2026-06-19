import type { WorkflowEvent, WorkflowEventType } from "../shared/workflow-runtime-types";

const workflowEvents: WorkflowEvent[] = [];

function generateEventId(): string {
  return `wf-event-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

export function recordWorkflowEvent(input: Omit<WorkflowEvent, "eventId" | "timestamp">): WorkflowEvent {
  const event: WorkflowEvent = {
    ...input,
    eventId: generateEventId(),
    timestamp: new Date().toISOString(),
  };
  workflowEvents.push(event);
  return { ...event };
}

export function listWorkflowEvents(workflowId?: string): WorkflowEvent[] {
  const events = workflowId
    ? workflowEvents.filter((event) => event.workflowId === workflowId)
    : [...workflowEvents];
  return events.map((event) => ({ ...event }));
}

export function clearWorkflowEvents(): void {
  workflowEvents.length = 0;
}

export function getWorkflowEventCount(): number {
  return workflowEvents.length;
}

export function hasWorkflowEvent(workflowId: string, eventType: WorkflowEventType): boolean {
  return workflowEvents.some((event) => event.workflowId === workflowId && event.eventType === eventType);
}
