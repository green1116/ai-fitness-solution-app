import type { StrategicInitiative } from "../initiatives";
import type { StrategicObjective } from "../objectives";

export interface RoadmapSnapshot {
  snapshotId: string;
  objectives: StrategicObjective[];
  initiatives: StrategicInitiative[];
  roadmapScore: number;
}
