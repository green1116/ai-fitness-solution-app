import type { SeatAllocation } from "./types";

export function buildSeatAllocation(input?: {
  deploymentId?: string;
  licensedSeats?: number;
  activeSeats?: number;
}): SeatAllocation {
  const deploymentId = input?.deploymentId ?? "seat-default";
  const licensedSeats = input?.licensedSeats ?? 25;
  const activeSeats = input?.activeSeats ?? 18;
  const availableSeats = Math.max(0, licensedSeats - activeSeats);
  const utilizationRate =
    licensedSeats > 0
      ? Math.round((activeSeats / licensedSeats) * 1000) / 10
      : 0;

  return {
    allocationId: `seat-allocation-${deploymentId}`,
    tenantId: `tenant-${deploymentId}`,
    licensedSeats,
    activeSeats,
    availableSeats,
    utilizationRate,
  };
}
