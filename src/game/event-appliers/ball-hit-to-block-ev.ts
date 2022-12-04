import {
  GameState,
  EventPayload,
  GameStateHelper,
  Im,
  AaRect2dTrait,
  EventManipulator,
  Overlaps,
  RecM2MTrait,
} from 'curtain-call3';
import {BallMovementTrait} from '../components/ball-movement';
import {TryStgSetting} from '../setting';

type Stg = TryStgSetting;

const evType = 'ballHitToBlock';
type EvType = typeof evType;

export class BallHitToBlockEv implements EventManipulator<Stg, EvType> {
  createEvents(
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
          to: 'block',
        }),
      ov => RecM2MTrait.toPairs(ov),
      ov =>
        ov.map(([ballId, blockId]) => ({
          ballId,
          blockId,
        }))
    )();
  }

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

    return Im.pipe(
      () => state,
      st =>
        GameStateHelper.replaceBodies(st, {
          [ballId]: newBallBody,
          [blockId]: newBlockBody,
        })
    )();
  }
}
