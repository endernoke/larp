import type { PlayerState } from './PlayerState';
import type { WorldState } from './WorldState';

export interface GameState {
  currentWeek: number;
  maxWeeks: number;
  player: PlayerState;
  world: WorldState;
  seed: number;
}
