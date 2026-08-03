import type { PlayerState } from './PlayerState';
import type { WorldState } from './WorldState';

export interface GameState {
  currentWeek: number;
  maxWeeks: number;
  player: PlayerState;
  world: WorldState;
  seed: string;
}

export type GameAction =
  | {
      type: 'advance-week';
    }
  | {
      type: 'clear-schedule';
    }
  | {
      type: 'add-to-schedule';
      activityId: string;
    };

export type ActionOutcome =
  | {
      type: 'schedule-updated';
    }
  | {
      type: 'week-advanced';
      newWeek: number;
    }
  | {
      type: 'action-rejected';
      message?: string;
    };

export type GameUpdate = {
  state: GameState;
  outcomes: ActionOutcome[];
};

export function createInitialGameState(seed: string): GameState {
  return {
    currentWeek: 0,
    maxWeeks: 5,
    player: {
      money: 1_200,
      wellBeing: 70,
      gpa: 3.1,
      visibility: 0,
      experiences: [],
      calendar: '',
    },
    world: {
      sectors: [],
      pastEvents: [],
      activeEffects: [],
      emittedFacts: [],
    },
    seed,
  };
}
