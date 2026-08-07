import type { Signal } from './Signal';
import type { SectorId } from './types';

export interface BaseSectorState {
  demand: number;
  hype: number;
  competition: number;
  compensation: number;
  entryBarrier: number;
}

export type SectorState = BaseSectorState & {
  readonly baseline: BaseSectorState;
};

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
  initialDelta: number;
  decayPerWeek: number;
}

export interface WorldEffect {
  startWeek: number;
  definitionId: string;
  delta: number;
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
