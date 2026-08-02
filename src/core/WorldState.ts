export type SectorId = 'web' | 'ai' | 'cybersecurity' | 'infrastructure' | 'game-dev' | 'research';

export interface SectorState {
  id: SectorId;
  name: string;
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
  effects: WorldEffect[];
  emittedFacts: EmittedFact[];
}

export interface WorldEvent {
  id: string;
  definitionId: string;
  occuranceWeek: number;
}

export interface WorldEffect {
  id: string;
  sourceEventId: string;
  targetPath: string;
  startWeek: number;
  duration: number;
  amount: number;
  decayPerWeek: number;
}

interface EmittedFact {
  id: string;
  topic: string;
  direction: string;
  magnitude: 'low' | 'medium' | 'high';
}

export interface WorldState {
  sectors: SectorState[];
  pastEvents: WorldEvent[];
  activeEffects: WorldEffect[];
  emittedFacts: EmittedFact[];
}
