import { advanceWeek } from './advanceWeek';
import type { GameAction, GameState, GameUpdate } from './GameState';

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

    default:
      return {
        state,
        outcomes: [{ type: 'action-rejected', message: 'Unknown action type' }],
      };
  }
}
