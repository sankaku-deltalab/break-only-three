import {
  AaRect2d,
  AaRect2dTrait,
  Enum,
  GameState,
  GameStateHelper,
  Im,
  Vec2d,
  Vec2dTrait,
} from 'curtain-call3';
import {gameArea, gameAreaRect, unit} from './constants';
import {TryStgSetting} from './setting';

type Stg = TryStgSetting;

export type StateType =
  | {type: 'launching'}
  | {type: 'released'}
  | {type: 'fallen'; endTime: number}
  | {type: 'annihilated'; endTime: number}
  | {type: 'finished'};

export type BoLevelState = {
  score: number;
  ended: boolean;
  wholeVelocity: Vec2d;
  wholeMovementFreezeEndTimeMs: number;
  automaton: StateType;
};

export class BoLevelTrait {
  static createInitial(): BoLevelState {
    return {
      score: 0,
      ended: false,
      wholeVelocity: Vec2dTrait.mlt({x: -unit / 2000, y: unit / 2000}, 2.0),
      wholeMovementFreezeEndTimeMs: -1,
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

  static changeToAnnihilated(
    state: GameState<Stg>,
    args: {durationMs: number}
  ): GameState<Stg> {
    const newLvState: StateType = {
      type: 'annihilated',
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

  static annihilatedStateWasFinished(state: GameState<Stg>, args: {}): boolean {
    const lv = GameStateHelper.getLevel(state);
    const time = state.time.engineTimeMs;

    if (lv.automaton.type !== 'annihilated') return false;
    return time > lv.automaton.endTime;
  }

  static getSurvivableArea(state: GameState<Stg>, args: {}): AaRect2d {
    const areas = Object.values(
      GameStateHelper.getBodiesOf(state, 'survivableArea')
    );
    return Enum.reduce(areas, gameAreaRect, (areaBody, wholeArea: AaRect2d) =>
      AaRect2dTrait.intersection(areaBody.area, wholeArea)
    );
  }
}
