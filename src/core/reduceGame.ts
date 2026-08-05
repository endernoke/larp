import { advanceWeek } from './advanceWeek';
import { experienceDefinitions } from './data/experience';
import type { GameAction, GameState, GameUpdate } from './GameState';
import type { PlayerState } from './PlayerState';

export function checkOverload(
  player: PlayerState,
  requestedTimeUnits: number,
): 'ok' | 'overload-warning' | 'overload-error' {
  const totalAllocatedTimeUnits =
    player.weeklyPlan.timeAllocations
      .filter((allocation) => allocation.executionMode === 'deferred')
      .reduce((sum, allocation) => sum + allocation.timeUnits, 0) + requestedTimeUnits;

  const maxTimeUnits =
    Math.max(5, Math.min(9, player.wellBeing / 10)) - player.weeklyPlan.availableTimeUnits;
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
      // Clear deferred time allocations only
      newState.player.weeklyPlan.timeAllocations =
        newState.player.weeklyPlan.timeAllocations.filter(
          (allocation) => allocation.executionMode === 'immediate',
        );
      return {
        state: newState,
        outcomes: [{ type: 'work-updated' }],
      };
    }

    case 'allocate-time': {
      const newState = { ...state };
      if (action.targetType === 'work') {
        const overloadStatus = checkOverload(newState.player, action.timeUnits);
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
        const workItem = newState.player.work.find((workItem) => workItem.id === action.targetId);
        if (!workItem) {
          return {
            state,
            outcomes: [{ type: 'action-rejected', message: 'Work item not found' }],
          };
        }
        newState.player.weeklyPlan.timeAllocations.push({
          activityType: 'work',
          targetId: workItem.id,
          timeUnits: action.timeUnits,
          executionMode: 'deferred',
        });
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
        return {
          state,
          outcomes: [{ type: 'action-rejected', message: 'Unknown target type for allocation' }],
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
