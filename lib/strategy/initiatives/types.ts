export type InitiativeStatus = "planned" | "active" | "completed";

export interface StrategicInitiative {
  id: string;
  name: string;
  objectiveId: string;
  status: InitiativeStatus;
}
