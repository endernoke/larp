import type { EmittedFact, WorldEffectDefinition, WorldEventDefinition } from '../WorldState';

export const worldEvents: WorldEventDefinition[] = [
  {
    id: '1',
    title: 'Major supply chain attack',
    description:
      'A major dependency was compromised by attackers, leading to a large-scale data breach and widespread disruptions in the supply chain.',
    prerequisites: [],
    baseWeight: 0.5,
    effectIds: ['1', '2'],
    emittedFactIds: ['1', '2'],
  },
];

export const worldEffects: WorldEffectDefinition[] = [
  {
    id: '1',
    sourceEventId: '1',
    targetPath: 'world.sectors.cybersecurity.demand',
    duration: 2,
    initialDelta: 20,
    decayPerWeek: 5,
  },
  {
    id: '2',
    sourceEventId: '1',
    targetPath: 'world.sectors.cybersecurity.hype',
    duration: 2,
    initialDelta: 30,
    decayPerWeek: 10,
  },
];

export const emittedFacts: EmittedFact[] = [
  {
    id: '1',
    topic: 'cybersecurity-hiring',
    sector: 'cybersecurity',
    direction: 'up',
    magnitude: 2,
  },
  {
    id: '2',
    topic: 'dependency-auditing',
    sector: 'cybersecurity',
    direction: 'up',
    magnitude: 3,
  },
];
