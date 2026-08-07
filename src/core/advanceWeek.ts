import { produce } from 'immer';
import { emittedFacts, worldEffects, worldEvents } from './data/events';
import { signalTemplates } from './data/signalTemplates';
import type { GameState } from './GameState';
import { sectorIds } from './types';
import type { EmittedFact } from './WorldState';
import {
  applyTimeAllocations,
  evaluateApplications,
  handleApplicationResults,
  processWeeklyEngagements,
} from './work';

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
  return produce(state, (newState) => {
    applyTimeAllocations(newState);
    processWeeklyEngagements(newState);
    evaluateApplications(newState);
    handleApplicationResults(newState);
    newState.player.work = newState.player.work.filter(
      (workItem) =>
        workItem.deadlineWeek === undefined || workItem.deadlineWeek > newState.currentWeek,
    );

    newState.world.activeEffects.forEach((effect) => {
      const effectDefinition = worldEffects.find((e) => e.id === effect.definitionId);
      if (!effectDefinition) return;
      effect.delta -= effectDefinition.decayPerWeek;
    });

    newState.world.emittedFacts.forEach((fact) => {
      fact.magnitude -= 1;
    });
    newState.world.emittedFacts = newState.world.emittedFacts.filter((fact) => {
      return fact.magnitude > 0;
    });

    newState.world.signals = [];

    // Living expenses I guess
    newState.player.money -= 500;
    // Grade decay for not doing coursework
    newState.player.gpa -= 0.2;

    newState.currentWeek += 1;

    newState.world.activeEffects = newState.world.activeEffects.filter((effect) => {
      const effectDefinition = worldEffects.find((e) => e.id === effect.definitionId);
      return (
        effectDefinition && effectDefinition.duration > newState.currentWeek - effect.startWeek
      );
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
            delta: effectDefinition.initialDelta,
          });
        }
      });

      eventDefinition.emittedFactIds.forEach((factId) => {
        const factDefinition = emittedFacts.find((f) => f.id === factId);
        if (factDefinition) {
          newState.world.emittedFacts.push({
            id: `${newState.currentWeek}-${factDefinition.id}`,
            topic: factDefinition.topic,
            sector: factDefinition.sector,
            direction: factDefinition.direction,
            magnitude: factDefinition.magnitude,
          });
        }
      });
    });

    // Reset all sector values to baseline, then re-apply active effects
    // There's probably a more efficient way to do this but this is easier to implement
    sectorIds.forEach((sectorId) => {
      const sectorStatus = newState.world.sectors[sectorId];
      if (!sectorStatus) return;

      sectorStatus.demand = sectorStatus.baseline.demand;
      sectorStatus.hype = sectorStatus.baseline.hype;
      sectorStatus.competition = sectorStatus.baseline.competition;
      sectorStatus.compensation = sectorStatus.baseline.compensation;
      sectorStatus.entryBarrier = sectorStatus.baseline.entryBarrier;
    });

    newState.world.activeEffects.forEach((effect) => {
      const effectDefinition = worldEffects.find((e) => e.id === effect.definitionId);
      if (!effectDefinition) return;
      updateObjectAtPath(
        newState,
        effectDefinition.targetPath,
        (value: number) => value + effect.delta,
      );
    });

    // Deduplicate emitted facts by topic and direction, keeping the one with the highest magnitude
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

    newState.world.emittedFacts.forEach((fact) => {
      const sectorStatus = newState.world.sectors[fact.sector];
      const relevantSignals = signalTemplates.filter(
        (signal) =>
          signal.applicableTopics.includes(fact.topic) &&
          signal.applicableDirections.includes(fact.direction),
      );
      if (!sectorStatus) return;
      relevantSignals.forEach((signalTemplate) => {
        const probability = (1 / (4 - fact.magnitude)) * (sectorStatus.hype / 50) * 0.8;
        if (newState.rng() < probability) {
          const messageTemplate =
            signalTemplate.messageTemplates[
              Math.floor(newState.rng() * signalTemplate.messageTemplates.length)
            ];
          const message = messageTemplate
            .replace('{sector}', fact.sector)
            .replace('{rand}', Math.floor(newState.rng() * 10).toString());
          newState.world.signals.push({
            channel: signalTemplate.channel,
            message: message,
          });
        }
      });
    });
  });
}
