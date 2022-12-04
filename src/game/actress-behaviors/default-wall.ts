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

const bt = 'wall';
const mt = 'defaultWall';
type BT = typeof bt;
type MT = typeof mt;

export class DefaultWallBeh implements ActressBehavior<Stg, BT, MT> {
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
    return [];
  }

  generateCollision(
    st: ActressState<Stg, BT, MT>,
    args: {
      gameState: VisibleGameState<Stg>;
    }
  ): Collision {
    const shapes = [CollisionHelper.createAaRectShape(st.body.shape)];
    return {
      shapes,
      excess: false,
    };
  }
}
