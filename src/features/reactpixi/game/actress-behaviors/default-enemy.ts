import {
  ActressBehavior,
  ActressState,
  Collision,
  Graphic,
  VisibleGameState,
} from 'curtain-call2';
import {TryStgSetting} from '../setting';

type Stg = TryStgSetting;
type BT = 'enemy';
type MT = 'defaultEnemy';

export class DefaultEnemyBeh implements ActressBehavior<Stg, BT, MT> {
  readonly bodyType = 'enemy';
  readonly mindType = 'defaultEnemy';

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
    return {
      shapes: [],
      mode: {
        mode: 0,
        mask: 0,
      },
      excess: false,
    };
  }
}
