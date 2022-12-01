import {
  ActressBehavior,
  ActressState,
  Collision,
  Graphic,
  Im,
  InputHelper,
  LineGraphicTrait,
  Vec2dTrait,
  VisibleGameState,
} from 'curtain-call3';
import {unit} from '../constants';
import {TryStgSetting} from '../setting';
import {PosTrait} from '../components/pos';

type Stg = TryStgSetting;
type BT = 'pc';
type MT = 'defaultPc';

export type DefaultPcState = {
  launcher: BallLauncherState;
};

export class DefaultPCBeh implements ActressBehavior<Stg, BT, MT> {
  readonly bodyType = 'pc';
  readonly mindType = 'defaultPc';

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
    const delta = InputHelper.deltaWhileDown(args.gameState);
    const body = Im.replace(st.body, 'pos', p => PosTrait.move(p, delta));
    return Im.replace(st, 'body', () => body);
  }

  generateGraphics(
    st: ActressState<Stg, BT, MT>,
    args: {
      gameState: VisibleGameState<Stg>;
    }
  ): Graphic<Stg>[] {
    const line = LineGraphicTrait.create({
      key: 'main',
      pos: st.body.pos.pos,
      color: 0xff0000,
      paths: [
        {x: 0, y: unit / 2},
        {x: unit / 2, y: -unit / 2},
        {x: -unit / 2, y: -unit / 2},
      ],
      thickness: 10,
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

export type BallLauncherState = Readonly<{
  direction: number;
  directionSpeed: number;
  directionRange: {min: number; max: number};
  directionMoveSign: 0 | -1 | 1;
}>;

export class BallLauncherTrait {
  static create(opt: {
    directionSpeed: number;
    directionRange: {min: number; max: number};
  }): BallLauncherState {
    return {
      ...opt,
      direction: opt.directionRange.min,
      directionMoveSign: 1,
    };
  }

  static update(
    launcher: BallLauncherState,
    args: {deltaMs: number}
  ): BallLauncherState {
    let dirSign = launcher.directionMoveSign;
    let newDirection = launcher.directionSpeed * args.deltaMs * dirSign;
    if (newDirection < launcher.directionRange.min) {
      newDirection = launcher.directionRange.min;
      dirSign = 1;
    } else if (newDirection > launcher.directionRange.min) {
      newDirection = launcher.directionRange.max;
      dirSign = -1;
    }
    return Im.pipe(
      () => launcher,
      la => Im.replace(la, 'direction', () => newDirection),
      la => Im.replace(la, 'directionMoveSign', () => dirSign)
    )();
  }
}
