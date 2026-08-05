import seedrandom from 'seedrandom';
import { experienceDefinitions } from './data/experience';
import type { PlayerState } from './PlayerState';
import type { WorldState } from './WorldState';

export interface GameState {
  currentWeek: number;
  maxWeeks: number;
  player: PlayerState;
  world: WorldState;
  seed: string;
  rng: seedrandom.StatefulPRNG<seedrandom.State.Arc4>;
}

export type GameAction =
  | {
      type: 'advance-week';
    }
  | {
      type: 'clear-planner';
    }
  | {
      type: 'add-to-planner';
      experienceDefinitionId?: string;
      experienceId?: string;
      allocatedTimeUnits: number;
    };

export type ActionOutcome =
  | {
      type: 'work-updated';
    }
  | {
      type: 'week-advanced';
      newWeek: number;
    }
  | {
      type: 'action-rejected';
      message?: string;
    }
  | {
      type: 'reminder';
      message: string;
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
      work: [],
      tasks: [],
      experiences: [],
      applications: [],
      engagements: [],
      notifications: [],
      availableOpportunities: [...experienceDefinitions],
    },
    world: {
      sectors: {
        cybersecurity: {
          demand: 50,
          hype: 50,
          competition: 50,
          compensation: 50,
          entryBarrier: 50,
          baseline: {
            demand: 50,
            hype: 50,
            competition: 50,
            compensation: 50,
            entryBarrier: 50,
          },
        },
      },
      pastEvents: [],
      activeEffects: [],
      emittedFacts: [],
      signals: [],
    },
    seed,
    rng: seedrandom(seed, {
      state: true,
    }),
  };
}
