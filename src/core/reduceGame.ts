import { advanceWeek } from './advanceWeek';
import { experienceDefinitions } from './data/experience';
import type { GameAction, GameState, GameUpdate } from './GameState';
import type { PlayerState } from './PlayerState';

export function checkOverload(
  player: PlayerState,
  requestedTimeUnits: number,
): 'ok' | 'overload-warning' | 'overload-error' {
  const totalAllocatedTimeUnits =
    player.work.reduce((sum, experience) => sum + experience.currentAllocatedTimeUnits, 0) +
    requestedTimeUnits;

  const maxTimeUnits = Math.max(5, Math.min(9, player.wellBeing / 10));
  if (totalAllocatedTimeUnits > maxTimeUnits) {
    return 'overload-error';
  }
  if (totalAllocatedTimeUnits > 7) {
    return 'overload-warning';
  }
  return 'ok';
}

export function reduceGame(state: GameState, action: GameAction): GameUpdate {
  switch (action.type) {
    case 'advance-week': {
      if (state.currentWeek >= state.maxWeeks - 1) {
        return {
          state,
          outcomes: [{ type: 'action-rejected', message: 'Cannot advance week beyond maxWeeks' }],
        };
      }
      const newState = advanceWeek(state);
      return {
        state: newState,
        outcomes: [{ type: 'week-advanced', newWeek: newState.currentWeek }],
      };
    }

    case 'clear-planner': {
      const newState = { ...state };
      // Put not-started experiences back into opportunities before removing them from work
      newState.player.work.forEach((experience) => {
        experience.currentAllocatedTimeUnits = 0;
        if (experience.status === 'not-started') {
          const definition = experienceDefinitions.find(
            (def) => def.id === experience.definitionId,
          );
          if (definition) {
            newState.player.availableOpportunities.push(definition);
          }
        }
      });
      newState.player.work = newState.player.work.filter(
        (experience) => experience.status !== 'not-started',
      );
      return {
        state: newState,
        outcomes: [{ type: 'work-updated' }],
      };
    }

    case 'add-to-planner': {
      const newState = { ...state };
      if (
        (action.experienceDefinitionId && action.experienceId) ||
        (!action.experienceDefinitionId && !action.experienceId)
      ) {
        return {
          state,
          outcomes: [
            {
              type: 'action-rejected',
              message:
                'Specify one and only one of either experienceDefinitionId for a new opportunity or experienceId for an ongoing experience',
            },
          ],
        };
      }
      const overloadStatus = checkOverload(newState.player, action.allocatedTimeUnits);
      if (overloadStatus === 'overload-error') {
        return {
          state,
          outcomes: [
            {
              type: 'action-rejected',
              message:
                'You cannot handle the requested workload. Consider improving your well-being or reducing your commitments.',
            },
          ],
        };
      }
      if (action.experienceDefinitionId) {
        const definition = newState.player.availableOpportunities.find(
          (exp) => exp.id === action.experienceDefinitionId,
        );
        if (!definition) {
          return {
            state,
            outcomes: [{ type: 'action-rejected', message: 'Opportunity not found' }],
          };
        }
        newState.player.work.push({
          id: `work-${definition.id}-${newState.currentWeek}`,
          definitionId: definition.id,
          title: definition.title,
          type: definition.type,
          tag: definition.tag,
          currentAllocatedTimeUnits: action.allocatedTimeUnits,
          completedTimeUnits: 0,
          quality: 0,
          impact: 0,
          startWeek: newState.currentWeek,
          status: 'not-started',
          actualRequiredTime: definition.baseRequiredTime,
          endWeek: 0,
          collaborators: [],
        });
        newState.player.availableOpportunities = newState.player.availableOpportunities.filter(
          (exp) => exp.id !== definition.id,
        );
        return {
          state: newState,
          outcomes: [
            { type: 'work-updated' },
            ...(overloadStatus === 'overload-warning'
              ? [
                  {
                    type: 'reminder' as const,
                    message: 'You are overcommitted. This will result in decreased well-being.',
                  },
                ]
              : []),
          ],
        };
      } else {
        const experience = newState.player.work.find((exp) => exp.id === action.experienceId);
        if (!experience) {
          return {
            state,
            outcomes: [{ type: 'action-rejected', message: 'Experience not found' }],
          };
        }
        experience.currentAllocatedTimeUnits = action.allocatedTimeUnits;
        return {
          state: newState,
          outcomes: [
            { type: 'work-updated' },
            ...(overloadStatus === 'overload-warning'
              ? [
                  {
                    type: 'reminder' as const,
                    message: 'You are overcommitted. This will result in decreased well-being.',
                  },
                ]
              : []),
          ],
        };
      }
    }

    default:
      return {
        state,
        outcomes: [{ type: 'action-rejected', message: 'Unknown action type' }],
      };
  }
}
