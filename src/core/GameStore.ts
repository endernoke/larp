import {
  type ActionOutcome,
  createInitialGameState,
  type GameAction,
  type GameState,
  type GameUpdate,
} from './GameState';
import { reduceGame } from './reduceGame';

export class GameStore {
  private _state: GameState;
  private _stateListeners: ((state: GameState) => void)[] = [];
  private _outcomeListeners: ((outcome: ActionOutcome) => void)[] = [];

  constructor(initialState: GameState) {
    this._state = initialState;
  }

  get state() {
    return this._state;
  }

  dispatch(action: GameAction): GameUpdate {
    const update = reduceGame(this._state, action);
    this._state = update.state;
    this._stateListeners.forEach((listener) => {
      listener(this._state);
    });
    update.outcomes.forEach((outcome) => {
      this._outcomeListeners.forEach((listener) => {
        listener(outcome);
      });
    });
    return {
      state: this._state,
      outcomes: update.outcomes,
    };
  }

  subscribe(listener: (state: GameState) => void): () => void {
    this._stateListeners.push(listener);
    return () => {
      const index = this._stateListeners.indexOf(listener);
      if (index !== -1) {
        this._stateListeners.splice(index, 1);
      }
    };
  }

  onOutcome(listener: (outcome: ActionOutcome) => void): () => void {
    this._outcomeListeners.push(listener);
    return () => {
      const index = this._outcomeListeners.indexOf(listener);
      if (index !== -1) {
        this._outcomeListeners.splice(index, 1);
      }
    };
  }
}

export const gameStore = new GameStore(createInitialGameState('larp'));
