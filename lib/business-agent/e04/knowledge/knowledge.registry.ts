/**
 * E04-P6 — Business Knowledge Registry
 * Seeds enterprise knowledge entities and relations
 */

import {
  E04_KNOWLEDGE_BASE,
  E04_KNOWLEDGE_FREEZE_VERSION,
  E04_KNOWLEDGE_RUNTIME_ID,
  E04_KNOWLEDGE_VERSION,
} from "./knowledge.constants";
import {
  linkKnowledgeRelation,
  listKnowledgeEntities,
  listKnowledgeRelations,
  resetKnowledgeGraph,
  upsertKnowledgeEntity,
} from "./knowledge.graph";
import type {
  KnowledgeEntity,
  KnowledgeRegistryManifest,
  KnowledgeRelation,
} from "./knowledge.types";

export type KnowledgeSeed = {
  entities: Array<Omit<KnowledgeEntity, "readOnly" | "tags" | "attributes"> & {
    tags?: string[];
    attributes?: Readonly<Record<string, unknown>>;
    memoryRef?: string;
  }>;
  relations: Array<
    Omit<KnowledgeRelation, "readOnly" | "attributes"> & {
      attributes?: Readonly<Record<string, unknown>>;
    }
  >;
};

export const KNOWLEDGE_SEED: KnowledgeSeed = {
  entities: [
    {
      id: "e04.know.project.xinghe",
      kind: "project",
      name: "星河科技园企业健身中心",
      description: "企业健身中心招采与交付项目",
      tags: ["xinghe", "fitness"],
      attributes: { region: "华南" },
    },
    {
      id: "e04.know.org.owner",
      kind: "organization",
      name: "星河科技园业主",
      description: "项目业主组织",
      tags: ["owner"],
    },
    {
      id: "e04.know.req.zone-split",
      kind: "requirement",
      name: "分区布局要求",
      description: "有氧/力量/团课分区清晰",
      tags: ["layout"],
    },
    {
      id: "e04.know.equip.treadmill",
      kind: "equipment",
      name: "商用跑步机",
      description: "核心有氧设备",
      tags: ["cardio"],
    },
    {
      id: "e04.know.cap.intake",
      kind: "capability",
      name: "招采 Intake Capability",
      description: "对齐 e04.cap.intake",
      tags: ["capability"],
      attributes: { capabilityId: "e04.cap.intake" },
    },
    {
      id: "e04.know.policy.compliance",
      kind: "policy",
      name: "合规门槛策略",
      description: "对齐 e04.policy.compliance-block",
      tags: ["policy"],
      attributes: { policyId: "e04.policy.compliance-block" },
    },
  ],
  relations: [
    {
      id: "e04.krel.owner-owns-project",
      kind: "owns",
      fromId: "e04.know.org.owner",
      toId: "e04.know.project.xinghe",
      label: "业主拥有项目",
    },
    {
      id: "e04.krel.project-requires-layout",
      kind: "requires",
      fromId: "e04.know.project.xinghe",
      toId: "e04.know.req.zone-split",
      label: "项目需要分区布局",
    },
    {
      id: "e04.krel.layout-supports-treadmill",
      kind: "supports",
      fromId: "e04.know.req.zone-split",
      toId: "e04.know.equip.treadmill",
      label: "布局支撑跑步机配置",
    },
    {
      id: "e04.krel.intake-references-project",
      kind: "references",
      fromId: "e04.know.cap.intake",
      toId: "e04.know.project.xinghe",
      label: "intake 引用项目上下文",
    },
    {
      id: "e04.krel.policy-constrains-project",
      kind: "constrains",
      fromId: "e04.know.policy.compliance",
      toId: "e04.know.project.xinghe",
      label: "合规策略约束项目",
    },
  ],
};

export function seedKnowledgeRegistry(
  seed: KnowledgeSeed = KNOWLEDGE_SEED,
): void {
  resetKnowledgeGraph();
  for (const entity of seed.entities) {
    upsertKnowledgeEntity(entity);
  }
  for (const relation of seed.relations) {
    linkKnowledgeRelation(relation);
  }
}

export function buildKnowledgeRegistryManifest(
  seed: KnowledgeSeed = KNOWLEDGE_SEED,
): KnowledgeRegistryManifest {
  seedKnowledgeRegistry(seed);
  const entities = listKnowledgeEntities();
  const relations = listKnowledgeRelations();
  const catalogComplete =
    entities.length === seed.entities.length &&
    relations.length === seed.relations.length;

  if (!catalogComplete) {
    throw new Error("knowledge catalog incomplete after seed");
  }

  return {
    runtimeId: E04_KNOWLEDGE_RUNTIME_ID,
    version: E04_KNOWLEDGE_VERSION,
    freezeVersion: E04_KNOWLEDGE_FREEZE_VERSION,
    base: E04_KNOWLEDGE_BASE,
    entityCount: entities.length,
    relationCount: relations.length,
    catalogComplete: true,
    readOnly: true,
  };
}

export function getKnowledgeCatalogEntity(
  id: string,
): KnowledgeEntity | undefined {
  return listKnowledgeEntities().find((e) => e.id === id);
}
