import {
  AaRect2dTrait,
  AnyEvent,
  BodyId,
  DirectorBehavior,
  Enum,
  EventTrait,
  EventTypes,
  GameStateHelper,
  GameState,
  Im,
  Overlaps,
  RecM2MTrait,
  Representation,
  Res,
  Result,
  EventPriority,
  TimeScaling,
  Vec2dTrait,
  BodyState,
  ActressHelper,
} from 'curtain-call3';
import {pipe} from 'rambda';
import {BallMovementTrait} from './components/ball-movement';
import {PosTrait} from './components/pos';
import {gameAreaSE} from './constants';
import {BoLevelTrait} from './level';
import {TryStgSetting} from './setting';

type Stg = TryStgSetting;

export class Director implements DirectorBehavior<Stg> {
  update(
    state: GameState<Stg>,
    other: {
      overlaps: Overlaps;
    }
  ): GameState<Stg> {
    const st = pipe(
      () => state,
      st => Res.ok(st),
      st => processWholeMovement(st, other),
      st => endGameIfCan(st, other)
    )();
    if (st.err) throw Error(String(st.val));
    return st.val;
  }

  generateEventsAtUpdate(
    state: GameState<Stg>,
    other: {
      overlaps: Overlaps;
    }
  ): AnyEvent<Stg>[] {
    return [];
  }

  getTimeScales(state: GameState<Stg>): TimeScaling<Stg> {
    const stateType = GameStateHelper.getLevel(state).automaton.type;
    if (stateType === 'finished') return {base: 0.0};
    if (stateType === 'choosingPerk') return {base: 0.0};
    if (stateType === 'fallen') return {base: 0.125};
    if (stateType === 'annihilated') return {base: 0.125};

    return {base: 1.0};
  }

  represent(state: GameState<Stg>): Representation<Stg> {
    return state.scene.level;
  }

  getEventPriority(): EventPriority<Stg> {
    return {
      earlier: ['launchBall'],
      later: ['allBlocksAreBroken'],
    };
  }
}

const processWholeMovement = (
  state: Result<GameState<Stg>>,
  other: {
    overlaps: Overlaps;
  }
): Result<GameState<Stg>> => {
  if (state.err) return state;

  let st = state.val;

  if (st.time.gameTimeMs < st.scene.level.wholeMovementFreezeEndTimeMs)
    return Res.ok(st);

  const isReleasing =
    GameStateHelper.getLevel(st).automaton.type === 'released';
  const velocityMlt = isReleasing ? 1 : 0.125;
  const velocity = Vec2dTrait.mlt(
    GameStateHelper.getLevel(st).wholeVelocity,
    velocityMlt
  );

  const delta = Vec2dTrait.mlt(velocity, st.time.lastDeltaMs);

  st = GameStateHelper.updateBodies(st, body => {
    if (ActressHelper.bodyIsInType(body, 'block')) {
      return Im.replace(body, 'pos', p => PosTrait.move(p, delta));
    }
    if (ActressHelper.bodyIsInType(body, 'survivableArea')) {
      return Im.replace(body, 'area', area => AaRect2dTrait.move(area, delta));
    }
    return undefined;
  });

  return Res.ok(st);
};

const endGameIfCan = (
  state: Result<GameState<Stg>>,
  other: {
    overlaps: Overlaps;
  }
): Result<GameState<Stg>> => {
  if (state.err) return state;

  const st = state.val;

  if (st.scene.level.ended) return state;

  const abortTime = 60 * 1000;
  if (st.time.engineTimeMs > abortTime) {
    return pipe(
      () => st,
      st =>
        GameStateHelper.addNotification(st, 'end', {
          reason: 'abort',
          score: st.scene.level.score,
        }),
      st => GameStateHelper.updateLevel(st, level => ({...level, ended: true})),
      st => Res.ok(st)
    )();
  }

  return state;
};
