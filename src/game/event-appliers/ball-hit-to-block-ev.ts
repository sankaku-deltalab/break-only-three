import {
  EventApplier,
  GameState,
  EventPayload,
  GameStateHelper,
  Im,
  AaRect2dTrait,
} from 'curtain-call3';
import {pipe} from 'rambda';
import {BallMovementTrait} from '../components/ball-movement';
import {TryStgSetting} from '../setting';

type Stg = TryStgSetting;

const evType = 'ballHitToBlock';
type EvType = typeof evType;

export class BallHitToBlockEv implements EventApplier<Stg, EvType> {
  applyEvent(
    state: GameState<Stg>,
    {ballId, blockId}: EventPayload<Stg, EvType>
  ): GameState<Stg> {
    const ball = GameStateHelper.getBody(state, ballId, 'ball');
    const block = GameStateHelper.getBody(state, blockId, 'block');

    if (ball.err) throw new Error('no ball');
    if (block.err) throw new Error('no block');

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
      () => state,
      st =>
        GameStateHelper.replaceBodies(st, {
          [ballId]: newBallBody,
          [blockId]: newBlockBody,
        })
    )();
  }
}
