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
    const delta = Vec2dTrait.mlt(
      st.body.movement.velocity,
      TimeTrait.lastDeltaMs(args.gameState.time)
    );
    const body = pipe(
      () => st.body,
      b => Im.replace(b, 'pos', p => PosTrait.copyPosToPrev(p)),
      b => Im.replace(b, 'pos', p => PosTrait.move(p, delta))
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
    const color = WholeGameProcessing.getColors().ball;
    const line = LineGraphicTrait.create({
      key: 'main',
      pos: st.body.pos.pos,
      color,
      paths: [nw, ne, se, sw],
      thickness: 2,
      closed: true,
      zIndex,
    });
    return [line, ...this.generatePenetrativeEffect(st, args)];
  }

  private generatePenetrativeEffect(
    st: ActressState<Stg, BT, MT>,
    args: {
      gameState: VisibleGameState<Stg>;
    }
  ): Graphic<Stg>[] {
    if (!st.body.penetrative) return [];
    const zIndex = WholeGameProcessing.getZIndex().ball;
    const color = WholeGameProcessing.getColors().ball;
    const left = {x: -unit / 2, y: 0};
    const right = {x: unit / 2, y: 0};
    const top = {x: 0, y: -unit / 2};
    const bottom = {x: 0, y: unit / 2};

    const lineH = LineGraphicTrait.create({
      key: 'penetrative-effect.horizontal',
      pos: st.body.pos.pos,
      color,
      paths: [left, right],
      thickness: 1,
      closed: true,
      zIndex,
    });
    const lineV = LineGraphicTrait.create({
      key: 'penetrative-effect.vertical',
      pos: st.body.pos.pos,
      color,
      paths: [top, bottom],
      thickness: 1,
      closed: true,
      zIndex,
    });
    return [lineH, lineV];
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
