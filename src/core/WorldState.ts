import type { Signal } from './Signal';

export type SectorId = 'web' | 'ai' | 'cybersecurity' | 'infrastructure' | 'game-dev' | 'research';

export interface SectorState {
  demand: number;
  hype: number;
  competition: number;
  compensation: number;
  entryBarrier: number;
}

export interface WorldEventCondition {
  path: string;
  operator: 'eq' | 'ne' | 'gt' | 'lt';
  value: number;
}

export interface WorldEventDefinition {
  id: string;
  title: string;
  description: string;
  prerequisites: WorldEventCondition[];
  baseWeight: number;
  effectIds: string[];
  emittedFactIds: string[];
}

export interface WorldEvent {
  id: string;
  definitionId: string;
  occuranceWeek: number;
}

export interface WorldEffectDefinition {
  id: string;
  sourceEventId: string;
  targetPath: string;
  duration: number;
  amount: number;
  decayPerWeek: number;
}

export interface WorldEffect {
  startWeek: number;
  definitionId: string;
  amount: number;
}

export interface EmittedFact {
  id: string;
  topic: string;
  sector: SectorId;
  direction: string;
  magnitude: 1 | 2 | 3;
}

export interface WorldState {
  sectors: Partial<Record<SectorId, SectorState>>;
  pastEvents: WorldEvent[];
  activeEffects: WorldEffect[];
  emittedFacts: EmittedFact[];
  signals: Signal[];
}
