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
} from 'curtain-call3';
import {gameArea, gameAreaRect, unit} from '../constants';
import {collisionModes, TryStgSetting} from '../setting';
import {PosTrait} from '../components/pos';

type Stg = TryStgSetting;

const bt = 'block';
const mt = 'defaultBlock';
type BT = typeof bt;
type MT = typeof mt;

export class DefaultBlockBeh implements ActressBehavior<Stg, BT, MT> {
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
      st.body.size
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
    const blockArea = AaRect2dTrait.fromCenterAndSize(
      st.body.pos.pos,
      st.body.size
    );
    const shapes = [CollisionHelper.createAaRectShape(blockArea)];
    return {
      shapes,
      excess: false,
    };
  }
}
