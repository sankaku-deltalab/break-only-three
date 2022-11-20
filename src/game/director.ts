import {
  AaRect2dTrait,
  BodyId,
  DirectorBehavior,
  Enum,
  GameHelper,
  GameState,
  Im,
  Overlaps,
  RecM2MTrait,
  Representation,
  Res,
  Result,
} from 'curtain-call2';
import {pipe} from 'rambda';
import {BallMovementTrait} from './components/ball-movement';
import {gameAreaSE} from './constants';
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
      st => processBallHitWithBlocks(st, other),
      st => processBallHitWithBlocks(st, other),
      st => processBallHitWithWalls(st, other),
      st => processBallHitWithPaddles(st, other),
      st => endGameIfCan(st, other)
    )();
    if (st.err) throw Error(String(st.val));
    return st.val;
  }

  represent(state: GameState<Stg>): Representation<Stg> {
    return state.scene.level;
  }
}

const processBallHitWithBlocks = (
  state: Result<GameState<Stg>>,
  other: {
    overlaps: Overlaps;
  }
): Result<GameState<Stg>> => {
  if (state.err) return state;

  return pipe(
    () => other.overlaps,
    ov =>
      GameHelper.filterOverlaps(ov, {
        state: state.val,
        from: 'ball',
        to: 'block',
      }),
    ov => RecM2MTrait.toPairs(ov),
    pairs =>
      Enum.reduce(pairs, state, ([from, to], st: Result<GameState<Stg>>) => {
        return processBallHitWithBlock(st, {ballId: from, blockId: to});
      })
  )();
};

const processBallHitWithBlock = (
  state: Result<GameState<Stg>>,
  args: {
    ballId: BodyId;
    blockId: BodyId;
  }
): Result<GameState<Stg>> => {
  if (state.err) return state;

  console.log('hit');

  const ball = GameHelper.getBody(state.val, args.ballId, 'ball');
  const block = GameHelper.getBody(state.val, args.blockId, 'block');

  if (ball.err) return ball;
  if (block.err) return block;

  const newBallBody = Im.replace(ball.val, 'movement', mov => {
    const pos = ball.val.pos.pos;
    const prevPos = ball.val.pos.prevPos;
    const wallShape = AaRect2dTrait.fromCenterAndSize(
      block.val.pos.pos,
      block.val.size
    );
    return BallMovementTrait.reflect(mov, {pos, prevPos, wallShape});
  });

  const newBlockBody = Im.replace(block.val, 'meta', meta => {
    return {...meta, del: true};
  });

  return pipe(
    () => state.val,
    st =>
      GameHelper.replaceBodies(st, {
        [args.ballId]: newBallBody,
        [args.blockId]: newBlockBody,
      }),
    st => Res.ok(st)
  )();
};

const processBallHitWithWalls = (
  state: Result<GameState<Stg>>,
  other: {
    overlaps: Overlaps;
  }
): Result<GameState<Stg>> => {
  if (state.err) return state;

  const overlaps = pipe(
    () => other.overlaps,
    ov =>
      GameHelper.filterOverlaps(ov, {
        state: state.val,
        from: 'ball',
        to: 'wall',
      }),
    ov => RecM2MTrait.removeNonDestinations(ov),
    ov => RecM2MTrait.toPairs(ov)
  )();

  return Enum.reduce(overlaps, state, ([ballId, wallId], st) => {
    const ball = GameHelper.getBody(state.val, ballId, 'ball');
    const wall = GameHelper.getBody(state.val, wallId, 'wall');

    if (ball.err) return ball;
    if (wall.err) return wall;

    const newBallBody = Im.replace(ball.val, 'movement', mov => {
      const pos = ball.val.pos.pos;
      const prevPos = ball.val.pos.prevPos;
      const wallShape = wall.val.shape;
      return BallMovementTrait.reflect(mov, {pos, prevPos, wallShape});
    });

    return pipe(
      () => state.val,
      st =>
        GameHelper.updateBodies(st, (body, {bodyId}) => {
          if (bodyId === ballId) return newBallBody;
          return undefined;
        }),
      st => Res.ok(st)
    )();
  });
};

const processBallHitWithPaddles = (
  state: Result<GameState<Stg>>,
  other: {
    overlaps: Overlaps;
  }
): Result<GameState<Stg>> => {
  if (state.err) return state;

  const overlaps = pipe(
    () => other.overlaps,
    ov =>
      GameHelper.filterOverlaps(ov, {
        state: state.val,
        from: 'ball',
        to: 'paddle',
      }),
    ov => RecM2MTrait.removeNonDestinations(ov),
    ov => RecM2MTrait.toPairs(ov)
  )();

  return Enum.reduce(overlaps, state, ([ballId, paddleId], st) => {
    const ball = GameHelper.getBody(state.val, ballId, 'ball');
    const paddle = GameHelper.getBody(state.val, paddleId, 'paddle');

    if (ball.err) return ball;
    if (paddle.err) return paddle;

    const newBallBody = Im.replace(ball.val, 'movement', mov => {
      const pos = ball.val.pos.pos;
      const prevPos = ball.val.pos.prevPos;
      const wallShape = AaRect2dTrait.fromCenterAndSize(
        paddle.val.pos.pos,
        paddle.val.status.size
      );
      return BallMovementTrait.reflect(mov, {pos, prevPos, wallShape});
    });

    return pipe(
      () => state.val,
      st =>
        GameHelper.updateBodies(st, (body, {bodyId}) => {
          if (bodyId === ballId) return newBallBody;
          return undefined;
        }),
      st => Res.ok(st)
    )();
  });
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

  if (st.time.engineTimeMs > 10000) {
    return pipe(
      () => st,
      st =>
        GameHelper.addNotification(st, 'end', {
          reason: 'abort',
          score: st.scene.level.score,
        }),
      st => GameHelper.updateLevel(st, level => ({...level, ended: true})),
      st => Res.ok(st)
    )();
  }

  const thereIsNoBlocks = pipe(
    () => st,
    st => GameHelper.getBodiesOf(st, 'block'),
    blocks => Object.entries(blocks),
    blocks => blocks.length === 0
  )();
  if (thereIsNoBlocks) {
    return pipe(
      () => st,
      st =>
        GameHelper.addNotification(st, 'end', {
          reason: 'clear',
          score: st.scene.level.score,
        }),
      st => GameHelper.updateLevel(st, level => ({...level, ended: true})),
      st => Res.ok(st)
    )();
  }

  const anyBallIsFallen = pipe(
    () => st,
    st => GameHelper.getBodiesOf(st, 'ball'),
    balls => Object.entries(balls),
    balls => Enum.map(balls, ([_, b]) => b.pos.pos.y >= gameAreaSE.y - b.diam),
    isFallen => isFallen.some(v => v)
  )();
  if (anyBallIsFallen) {
    return pipe(
      () => st,
      st =>
        GameHelper.addNotification(st, 'end', {
          reason: 'game-over',
          score: st.scene.level.score,
        }),
      st => GameHelper.updateLevel(st, level => ({...level, ended: true})),
      st => Res.ok(st)
    )();
  }

  return state;
};
