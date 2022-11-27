import {
  EventApplier,
  GameState,
  EventPayload,
  GameHelper,
  Im,
  AaRect2dTrait,
} from 'curtain-call3';
import {pipe} from 'rambda';
import {BallMovementTrait} from '../components/ball-movement';
import {TryStgSetting} from '../setting';

type Stg = TryStgSetting;

const evType = 'ballHitToPaddle';
type EvType = typeof evType;

export class BallHitToPaddleEv implements EventApplier<Stg, EvType> {
  applyEvent(
    state: GameState<Stg>,
    {ballId, paddleId}: EventPayload<Stg, EvType>
  ): GameState<Stg> {
    const ball = GameHelper.getBody(state, ballId, 'ball');
    const paddle = GameHelper.getBody(state, paddleId, 'paddle');

    if (ball.err) throw new Error('no ball');
    if (paddle.err) throw new Error('no paddle');

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
      () => state,
      st => GameHelper.replaceBodies(st, {[ballId]: newBallBody})
    )();
  }
}
