import {
  GameState,
  EventPayload,
  GameStateHelper,
  Im,
  EventManipulator,
  Overlaps,
  RecM2MTrait,
  AaRect2dTrait,
  Vec2dTrait,
  TimeTrait,
  Enum,
  Res,
  Result,
} from 'curtain-call3';
import {BallMovementTrait} from '../components/ball-movement';
import {PaddleStatusTrait} from '../components/paddle-status';
import {PosTrait} from '../components/pos';
import {BoLevelTrait} from '../level';
import {TryStgSetting} from '../setting';

type Stg = TryStgSetting;

const evType = 'ballHitToSurvivableArea';
type EvType = typeof evType;

export class BallHitToSurvivableArea implements EventManipulator<Stg, EvType> {
  generateEventsAtUpdate(
    state: GameState<Stg>,
    args: {
      overlaps: Overlaps;
    }
  ): EventPayload<Stg, EvType>[] {
    const balls = Object.entries(GameStateHelper.getBodiesOf(state, 'ball'));
    const payloads = Enum.map(
      balls,
      ([ballId, ball]): Result<EventPayload<Stg, EvType>> => {
        const movableArea = BoLevelTrait.getSurvivableArea(state, {});
        const posForArea = AaRect2dTrait.calcPointPosition(ball.pos.pos, {
          area: movableArea,
        });
        const normal = posForArea;
        const oldVelocity = ball.movement.velocity;
        const canReflect = Vec2dTrait.dot(oldVelocity, normal) > 0;
        if (canReflect) return Res.ok({ballId});
        return Res.err({});
      }
    );
    return Res.onlyOk(payloads);
  }

  applyEvent(
    state: GameState<Stg>,
    {ballId}: EventPayload<Stg, EvType>
  ): GameState<Stg> {
    const ball = GameStateHelper.getBody(state, ballId, 'ball');
    if (ball.err) throw new Error('no ball');

    const movableArea = BoLevelTrait.getSurvivableArea(state, {});
    const posForArea = AaRect2dTrait.calcPointPosition(ball.val.pos.pos, {
      area: movableArea,
    });
    const normal = posForArea;
    const oldVelocity = ball.val.movement.velocity;
    const canReflect = Vec2dTrait.dot(oldVelocity, normal) > 0;
    const newVelocity = !canReflect
      ? oldVelocity
      : Vec2dTrait.reflect(oldVelocity, normal);
    const newBall = Im.pipe(
      () => ball.val,
      b => Im.replace(b, 'penetrative', () => false),
      b =>
        Im.replace(b, 'movement', m =>
          BallMovementTrait.setVelocity(newVelocity)
        )
    )();
    return GameStateHelper.replaceBodies(state, {[ballId]: newBall});
  }
}
