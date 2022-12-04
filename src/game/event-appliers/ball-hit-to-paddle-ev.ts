import {
  GameState,
  EventPayload,
  GameStateHelper,
  Im,
  AaRect2dTrait,
  EventManipulator,
  Overlaps,
} from 'curtain-call3';
import {pipe} from 'rambda';
import {BallMovementTrait} from '../components/ball-movement';
import {PaddleStatusTrait} from '../components/paddle-status';
import {TryStgSetting} from '../setting';

type Stg = TryStgSetting;

const evType = 'ballHitToPaddle';
type EvType = typeof evType;

export class BallHitToPaddleEv implements EventManipulator<Stg, EvType> {
  createEvents(
    state: GameState<Stg>,
    args: {
      overlaps: Overlaps;
    }
  ): EventPayload<Stg, EvType>[] {
    return [];
  }

  applyEvent(
    state: GameState<Stg>,
    {ballId, paddleId}: EventPayload<Stg, EvType>
  ): GameState<Stg> {
    const ball = GameStateHelper.getBody(state, ballId, 'ball');
    const paddle = GameStateHelper.getBody(state, paddleId, 'paddle');

    if (ball.err) throw new Error('no ball');
    if (paddle.err) throw new Error('no paddle');

    const newBallBody = Im.replace(ball.val, 'movement', mov => {
      const ballPos = ball.val.pos.pos;
      const reflectNormal = PaddleStatusTrait.calcReflectNormal({
        ballPos,
        paddle: paddle.val.status,
        paddlePos: paddle.val.pos.pos,
      });
      return BallMovementTrait.reflectByNormal(mov, {normal: reflectNormal});
    });

    return pipe(
      () => state,
      st => GameStateHelper.replaceBodies(st, {[ballId]: newBallBody})
    )();
  }
}
