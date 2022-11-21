import product from 'immer';
import {
  AaRect2dTrait,
  ActressBehavior,
  ActressState,
  Collision,
  CollisionHelper,
  Graphic,
  Im,
  InputHelper,
  LineGraphicTrait,
  Vec2dTrait,
  VisibleGameState,
} from 'curtain-call3';
import {gameArea, gameAreaRect, unit} from '../constants';
import {collisionModes, TryStgSetting} from '../setting';
import {PosTrait} from '../components/pos';

type Stg = TryStgSetting;

const bt = 'paddle';
const mt = 'defaultPaddle';
type BT = typeof bt;
type MT = typeof mt;

export class DefaultPaddleBeh implements ActressBehavior<Stg, BT, MT> {
  readonly bodyType = bt;
  readonly mindType = mt;

  applyInput(
    st: ActressState<Stg, BT, MT>,
    args: {
      gameState: VisibleGameState<Stg>;
    }
  ): ActressState<Stg, BT, MT> {
    const movableArea = AaRect2dTrait.reduceArea(
      gameAreaRect,
      st.body.status.size
    );
    const delta = InputHelper.deltaWhileDown(args.gameState);
    const newPos = AaRect2dTrait.clampPosition(
      Vec2dTrait.add(st.body.pos.pos, delta),
      movableArea
    );
    return Im.replace(st, 'body', b =>
      Im.replace(b, 'pos', p => PosTrait.moveTo(p, newPos))
    );
  }

  update(
    st: ActressState<Stg, BT, MT>,
    args: {
      gameState: VisibleGameState<Stg>;
    }
  ): ActressState<Stg, BT, MT> {
    return st;
  }

  generateGraphics(
    st: ActressState<Stg, BT, MT>,
    args: {
      gameState: VisibleGameState<Stg>;
    }
  ): Graphic<Stg>[] {
    const relArea = AaRect2dTrait.fromCenterAndSize(
      Vec2dTrait.zero(),
      st.body.status.size
    );
    const nw = relArea.nw;
    const se = relArea.se;
    const ne = {x: relArea.nw.x, y: relArea.se.y};
    const sw = {x: relArea.se.x, y: relArea.nw.y};
    const line = LineGraphicTrait.create({
      key: 'main',
      pos: st.body.pos.pos,
      color: 0xff0000,
      paths: [nw, ne, se, sw],
      thickness: 2,
      closed: true,
      zIndex: 0,
    });
    return [line];
  }

  generateCollision(
    st: ActressState<Stg, BT, MT>,
    args: {
      gameState: VisibleGameState<Stg>;
    }
  ): Collision {
    const paddleArea = AaRect2dTrait.fromCenterAndSize(
      st.body.pos.pos,
      st.body.status.size
    );
    const shapes = [CollisionHelper.createAaRectShape(paddleArea)];
    return {
      shapes,
      mode: collisionModes.any,
      excess: false,
    };
  }
}
