import { emittedFacts, worldEffects, worldEvents } from './data/events';
import type { GameState } from './GameState';
import type { EmittedFact } from './WorldState';

// biome-ignore lint/suspicious/noExplicitAny: needs to work with any object type
function updateObjectAtPath(obj: any, path: string, updateFn: (value: any) => any): void {
  const keys = path.split('.');
  const lastKey = keys.pop();
  if (!lastKey) return;

  const parent = keys.reduce((o, key) => (o && o[key] !== undefined ? o[key] : undefined), obj);
  if (parent && typeof parent === 'object') {
    parent[lastKey] = updateFn(parent[lastKey]);
  }
}

export function advanceWeek(state: GameState): GameState {
  const newState = { ...state };
  newState.world.activeEffects.forEach((effect) => {
    const effectDefinition = worldEffects.find((e) => e.id === effect.definitionId);
    if (!effectDefinition) return;
    // effect.amount -= effectDefinition.decayPerWeek;
    effect.amount = -effectDefinition.decayPerWeek;
  });

  newState.world.emittedFacts.forEach((fact) => {
    fact.magnitude -= 1;
  });
  newState.world.emittedFacts = newState.world.emittedFacts.filter((fact) => {
    return fact.magnitude > 0;
  });

  newState.currentWeek += 1;

  newState.world.activeEffects = newState.world.activeEffects.filter((effect) => {
    const effectDefinition = worldEffects.find((e) => e.id === effect.definitionId);
    return effectDefinition && effectDefinition.duration > newState.currentWeek - effect.startWeek;
  });

  worldEvents.forEach((eventDefinition) => {
    const prerequisitesMet = eventDefinition.prerequisites.every((condition) => {
      const value = condition.path.split('.').reduce(
        // biome-ignore lint/suspicious/noExplicitAny: dynamic path access
        (o: any, key: string) => (o && o[key] !== undefined ? o[key] : undefined),
        newState,
      );
      switch (condition.operator) {
        case 'eq':
          return value === condition.value;
        case 'ne':
          return value !== condition.value;
        case 'gt':
          return value > condition.value;
        case 'lt':
          return value < condition.value;
        default:
          return false;
      }
    });
    if (!prerequisitesMet) return;

    const randomValue = newState.rng();
    if (randomValue > eventDefinition.baseWeight) return;

    newState.world.pastEvents.push({
      id: `${newState.currentWeek}-${eventDefinition.id}`,
      definitionId: eventDefinition.id,
      occuranceWeek: newState.currentWeek,
    });

    eventDefinition.effectIds.forEach((effectId) => {
      const effectDefinition = worldEffects.find((e) => e.id === effectId);
      if (effectDefinition) {
        newState.world.activeEffects.push({
          startWeek: newState.currentWeek,
          definitionId: effectDefinition.id,
          amount: effectDefinition.amount,
        });
      }
    });

    eventDefinition.emittedFactIds.forEach((factId) => {
      const factDefinition = emittedFacts.find((f) => f.id === factId);
      if (factDefinition) {
        newState.world.emittedFacts.push({
          id: `${newState.currentWeek}-${factDefinition.id}`,
          topic: factDefinition.topic,
          direction: factDefinition.direction,
          magnitude: factDefinition.magnitude,
        });
      }
    });
  });

  newState.world.activeEffects.forEach((effect) => {
    const effectDefinition = worldEffects.find((e) => e.id === effect.definitionId);
    if (!effectDefinition) return;
    updateObjectAtPath(
      newState,
      effectDefinition.targetPath,
      (value: number) => value + effect.amount,
    );
  });

  newState.world.emittedFacts = newState.world.emittedFacts.reduce((acc, fact) => {
    const existingFactIndex = acc.findIndex(
      (f) => f.topic === fact.topic && f.direction === fact.direction,
    );
    if (existingFactIndex !== -1) {
      if (acc[existingFactIndex].magnitude < fact.magnitude) {
        acc[existingFactIndex] = fact;
      }
    } else {
      acc.push(fact);
    }
    return acc;
  }, [] as EmittedFact[]);

  return newState;
}
