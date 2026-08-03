import type { GameAction, GameState, GameUpdate } from './GameState';

export function reduceGame(state: GameState, action: GameAction): GameUpdate {
  switch (action.type) {
    case 'advance-week': {
      const newState = { ...state, currentWeek: state.currentWeek + 1 };
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
