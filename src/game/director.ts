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
} from 'curtain-call3';
import {pipe} from 'rambda';
import {BallMovementTrait} from './components/ball-movement';
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
      // st => processBallHitWithBlocks(st, other),
      // st => processBallHitWithBlocks(st, other),
      // st => processBallHitWithWalls(st, other),
      // st => processBallHitWithPaddles(st, other),
      st => endGameIfCan(st, other)
    )();
    if (st.err) throw Error(String(st.val));
    return st.val;
  }

  generateEvents(
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

const endGameIfCan = (
  state: Result<GameState<Stg>>,
  other: {
    overlaps: Overlaps;
  }
): Result<GameState<Stg>> => {
  if (state.err) return state;

  const st = state.val;

  if (st.scene.level.ended) return state;

  if (st.time.engineTimeMs > 10000) {
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

  // const thereIsNoBlocks = pipe(
  //   () => st,
  //   st => GameStateHelper.getBodiesOf(st, 'block'),
  //   blocks => Object.entries(blocks),
  //   blocks => blocks.length === 0
  // )();
  // if (thereIsNoBlocks) {
  //   return pipe(
  //     () => st,
  //     st =>
  //       GameStateHelper.addNotification(st, 'end', {
  //         reason: 'clear',
  //         score: st.scene.level.score,
  //       }),
  //     st => GameStateHelper.updateLevel(st, level => ({...level, ended: true})),
  //     st => Res.ok(st)
  //   )();
  // }

  // const anyBallIsFallen = pipe(
  //   () => st,
  //   st => GameStateHelper.getBodiesOf(st, 'ball'),
  //   balls => Object.entries(balls),
  //   balls => Enum.map(balls, ([_, b]) => b.pos.pos.y >= gameAreaSE.y - b.diam),
  //   isFallen => isFallen.some(v => v)
  // )();
  // if (anyBallIsFallen) {
  //   return pipe(
  //     () => st,
  //     st =>
  //       GameStateHelper.addNotification(st, 'end', {
  //         reason: 'game-over',
  //         score: st.scene.level.score,
  //       }),
  //     st => GameStateHelper.updateLevel(st, level => ({...level, ended: true})),
  //     st => Res.ok(st)
  //   )();
  // }

  return state;
};
