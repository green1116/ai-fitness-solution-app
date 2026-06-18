import type { PerformanceStatus, PerformanceIntelligenceMode } from "./constants";

export interface PerformanceRecord {
  performanceId: string;
  projectId: string;
  status: PerformanceStatus;
  score: number;
  acceptanceScore: number;
  deliveryScore: number;
  riskScore: number;
}

export interface PerformanceMetrics {
  acceptanceScore: number;
  deliveryScore: number;
  riskScore: number;
  totalScore: number;
}

export interface PerformanceRegistry {
  registryId: string;
  records: PerformanceRecord[];
  count: number;
  averageScore: number;
  mode: PerformanceIntelligenceMode;
}

export interface PerformanceContext {
  contextId: string;
  projects: Array<{ projectId: string; name: string; region: string }>;
  performances: PerformanceRecord[];
  averageScore: number;
  mode: PerformanceIntelligenceMode;
}

export interface PerformanceFoundationValidation {
  valid: boolean;
  performanceCount: number;
  averageScore: number;
  summary: string;
}
