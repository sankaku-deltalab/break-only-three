import {
  GameState,
  EventPayload,
  GameStateHelper,
  Im,
  EventManipulator,
  Overlaps,
  RecM2MTrait,
} from 'curtain-call3';
import {BallMovementTrait} from '../components/ball-movement';
import {PaddleStatusTrait} from '../components/paddle-status';
import {BoLevelTrait} from '../level';
import {TryStgSetting} from '../setting';
import {SigilTrait} from '../sigil';

type Stg = TryStgSetting;

const evType = 'ballHitToPaddle';
type EvType = typeof evType;

export class BallHitToPaddleEv implements EventManipulator<Stg, EvType> {
  generateEventsAtUpdate(
    state: GameState<Stg>,
    args: {
      overlaps: Overlaps;
    }
  ): EventPayload<Stg, EvType>[] {
    return Im.pipe(
      () => args.overlaps,
      ov =>
        GameStateHelper.filterOverlaps(ov, {
          state: state,
          from: 'ball',
          to: 'paddle',
        }),
      ov => RecM2MTrait.removeNonDestinations(ov),
      ov => RecM2MTrait.toPairs(ov),
      ov =>
        ov.map(([ballId, paddleId]) => ({
          ballId,
          paddleId,
        }))
    )();
  }

  applyEvent(
    state: GameState<Stg>,
    {ballId, paddleId}: EventPayload<Stg, EvType>
  ): GameState<Stg> {
    const ball = GameStateHelper.getBody(state, ballId, 'ball');
    const paddle = GameStateHelper.getBody(state, paddleId, 'paddle');

    if (ball.err) throw new Error('no ball');
    if (paddle.err) throw new Error('no paddle');

    const penetrative = SigilTrait.getPaddleMakeBallPenetrative(
      BoLevelTrait.getSigils(state)
    );

    const newBallBody = Im.pipe(
      () => ball.val,
      ball =>
        Im.replace(ball, 'movement', mov => {
          const ballPos = ball.pos.pos;
          const reflectNormal = PaddleStatusTrait.calcReflectNormal({
            ballPos,
            paddle: paddle.val.status,
            paddlePos: paddle.val.pos.pos,
          });
          return BallMovementTrait.reflectByNormal(mov, {
            normal: reflectNormal,
          });
        }),
      ball => Im.replace(ball, 'penetrative', () => penetrative)
    )();

    return Im.pipe(
      () => state,
      st => GameStateHelper.replaceBodies(st, {[ballId]: newBallBody})
    )();
  }
}
