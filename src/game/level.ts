import {GameState, GameStateHelper, Im} from 'curtain-call3';
import {TryStgSetting} from './setting';

type Stg = TryStgSetting;

export type StateType =
  | {type: 'launching'}
  | {type: 'released'}
  | {type: 'fallen'; endTime: number}
  | {type: 'annihilated'}
  | {type: 'finished'};

export type BoLevelState = {
  score: number;
  ended: boolean;
  automaton: StateType;
};

export class BoLevelTrait {
  static createInitial(): BoLevelState {
    return {
      score: 0,
      ended: false,
      automaton: {type: 'launching'},
    };
  }

  static changeToFallenState(
    state: GameState<Stg>,
    args: {durationMs: number}
  ): GameState<Stg> {
    const newLvState: StateType = {
      type: 'fallen',
      endTime: state.time.engineTimeMs + args.durationMs,
    };
    return GameStateHelper.updateLevel(state, lv =>
      Im.replace(lv, 'automaton', () => newLvState)
    );
  }

  static changeToFinishedState(
    state: GameState<Stg>,
    args: {}
  ): GameState<Stg> {
    const newLvState: StateType = {
      type: 'finished',
    };
    return Im.pipe(
      () => state,
      st =>
        GameStateHelper.updateLevel(st, lv =>
          Im.replace(lv, 'automaton', () => newLvState)
        ),
      st =>
        GameStateHelper.updateLevel(st, lv =>
          Im.replace(lv, 'ended', () => true)
        )
    )();
  }

  static fallenStateWasFinished(state: GameState<Stg>, args: {}): boolean {
    const lv = GameStateHelper.getLevel(state);
    const time = state.time.engineTimeMs;

    if (lv.automaton.type !== 'fallen') return false;
    return time > lv.automaton.endTime;
  }
}
