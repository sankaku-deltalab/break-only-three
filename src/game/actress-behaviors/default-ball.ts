import product from 'immer';
import {
  AaRect2dTrait,
  ActressBehavior,
  ActressState,
  Collision,
  Graphic,
  Im,
  InputHelper,
  LineGraphicTrait,
  Vec2dTrait,
  VisibleGameState,
  CollisionHelper,
  TimeTrait,
} from 'curtain-call3';
import {gameArea, gameAreaRect, unit} from '../constants';
import {TryStgSetting} from '../setting';
import {PosTrait} from '../components/pos';
import {pipe} from 'rambda';
import {BallMovementTrait} from '../components/ball-movement';
import {BoLevelTrait} from '../level';
import {WholeGameProcessing} from '../whole-processing';

type Stg = TryStgSetting;

const bt = 'ball';
const mt = 'defaultBall';
type BT = typeof bt;
type MT = typeof mt;

export class DefaultBallBeh implements ActressBehavior<Stg, BT, MT> {
  readonly bodyType = bt;
  readonly mindType = mt;

  applyInput(
    st: ActressState<Stg, BT, MT>,
    args: {
      gameState: VisibleGameState<Stg>;
    }
  ): ActressState<Stg, BT, MT> {
    return st;
  }

  update(
    st: ActressState<Stg, BT, MT>,
    args: {
      gameState: VisibleGameState<Stg>;
    }
  ): ActressState<Stg, BT, MT> {
    const movableArea = BoLevelTrait.getSurvivableArea(args.gameState, {});
    const posForArea = AaRect2dTrait.calcPointPosition(st.body.pos.pos, {
      area: movableArea,
    });
    const normal = posForArea;
    const oldVelocity = st.body.movement.velocity;
    const canReflect = Vec2dTrait.dot(oldVelocity, normal) > 0;
    const newVelocity = !canReflect
      ? oldVelocity
      : Vec2dTrait.reflect(oldVelocity, normal);
    const delta = Vec2dTrait.mlt(
      newVelocity,
      TimeTrait.lastDeltaMs(args.gameState.time)
    );
    const body = pipe(
      () => st.body,
      b => Im.replace(b, 'pos', p => PosTrait.copyPosToPrev(p)),
      b => Im.replace(b, 'pos', p => PosTrait.move(p, delta)),
      b =>
        Im.replace(b, 'movement', m =>
          BallMovementTrait.setVelocity(newVelocity)
        )
    )();
    return Im.replace(st, 'body', () => body);
  }

  generateGraphics(
    st: ActressState<Stg, BT, MT>,
    args: {
      gameState: VisibleGameState<Stg>;
    }
  ): Graphic<Stg>[] {
    const relArea = AaRect2dTrait.fromCenterAndSize(
      Vec2dTrait.zero(),
      Vec2dTrait.mlt(Vec2dTrait.one(), st.body.diam)
    );
    const {nw, se, ne, sw} = AaRect2dTrait.corners(relArea);
    const zIndex = WholeGameProcessing.getZIndex().ball;
    const line = LineGraphicTrait.create({
      key: 'main',
      pos: st.body.pos.pos,
      color: 0xff0000,
      paths: [nw, ne, se, sw],
      thickness: 2,
      closed: true,
      zIndex,
    });
    return [line];
  }

  generateCollision(
    st: ActressState<Stg, BT, MT>,
    args: {
      gameState: VisibleGameState<Stg>;
    }
  ): Collision {
    const ballArea = AaRect2dTrait.fromCenterAndSize(
      st.body.pos.pos,
      Vec2dTrait.mlt(Vec2dTrait.one(), st.body.diam)
    );
    const shapes = [CollisionHelper.createAaRectShape(ballArea)];
    return {
      shapes,
      excess: false,
    };
  }
}
