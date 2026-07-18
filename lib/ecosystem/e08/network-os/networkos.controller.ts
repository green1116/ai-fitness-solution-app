/**
 * E08-P7 — Enterprise Network OS Controller
 * Composes ordered market-agent control plans from Network OS definitions
 */

import { getMarketAgentById } from "../market/market.registry";
import { assertNetworkOsDefinition } from "./networkos.registry";
import type {
  NetworkOsControlPlan,
  NetworkOsControlSlot,
  NetworkOsDefinition,
} from "./networkos.types";

export function controlNetworkOs(
  definition: NetworkOsDefinition,
): NetworkOsControlPlan {
  assertNetworkOsDefinition(definition);

  const slots: NetworkOsControlSlot[] = definition.marketAgentIds.map(
    (marketAgentId, index) => {
      const agent = getMarketAgentById(marketAgentId);
      if (!agent) {
        throw new Error(
          `unknown market agent ${marketAgentId} on ${definition.id}`,
        );
      }
      return {
        id: `${definition.id}.slot-${index + 1}`,
        order: index + 1,
        marketAgentId: agent.id,
        marketMission: agent.mission,
        intelligenceId: agent.intelligenceId,
        title: agent.name,
        detail: `${agent.description} → ${agent.intelligenceId}`,
        readOnly: true,
      };
    },
  );

  const narrative = [
    `${definition.name} controls ${slots.length} market agent slots`,
    `for mission "${definition.mission}"`,
    `(${slots.map((s) => s.marketMission).join(" → ")})`,
  ].join(" ");

  return {
    networkOsId: definition.id,
    kind: definition.kind,
    mission: definition.mission,
    slotCount: slots.length,
    slots: Object.freeze([...slots]) as NetworkOsControlSlot[],
    narrative,
    readOnly: true,
  };
}
