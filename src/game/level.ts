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
import {PerksState, PerkTrait} from './perk';
import {TryStgSetting} from './setting';
import {SigilsState} from './sigil';

type Stg = TryStgSetting;

/**
 * @mermaid
 * graph TD;
 *   start
 *   launching
 *   released
 *   fallen
 *   annihilated
 *   finished
 *
 *   start -- Start game --> launching
 *   launching -- Launch ball from paddle --> released
 *   released -- Ball was fallen --> fallen
 *   fallen -- Game over scene finished --> finished
 *   released -- Break all blocks --> annihilated
 *   annihilated -- Clear scene finished --> launching
 *
 */
export type StateType =
  | {type: 'launching'}
  | {type: 'released'}
  | {type: 'fallen'; endTime: number}
  | {type: 'annihilated'; endTime: number}
  | {type: 'finished'};

export type BoLevelState = {
  perks: PerksState;
  score: number;
  ended: boolean;
  wholeVelocity: Vec2d;
  wholeMovementFreezeEndTimeMs: number;
  automaton: StateType;
};

export class BoLevelTrait {
  static createInitial(opt: {
    score: number;
    wholeVelocity: Vec2d;
  }): BoLevelState {
    return {
      perks: PerkTrait.getZeroPerks(),
      score: opt.score,
      ended: false,
      wholeVelocity: opt.wholeVelocity,
      wholeMovementFreezeEndTimeMs: -1,
      automaton: {type: 'launching'},
    };
  }

  static getSigils(state: GameState<Stg>): SigilsState {
    const perks = GameStateHelper.getLevel(state).perks;
    return PerkTrait.convertPerksToSigils(perks);
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
