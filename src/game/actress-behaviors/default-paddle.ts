import product from 'immer';
import {
  AaRect2dTrait,
  ActressBehavior,
  ActressInitializer,
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
import {PaddleStatusTrait} from '../components/paddle-status';

type Stg = TryStgSetting;

const bt = 'paddle';
const mt = 'defaultPaddle';
type BT = typeof bt;
type MT = typeof mt;

export type DefaultPaddleState = {
  launcher: BallLauncherState;
};

export class DefaultPaddleTrait {
  static createActInit(): ActressInitializer<Stg, 'paddle', 'defaultPaddle'> {
    return {
      bodyType: 'paddle',
      mindType: 'defaultPaddle',
      body: {
        pos: PosTrait.create({pos: {x: 0, y: unit}}),
        status: PaddleStatusTrait.create({
          size: {x: unit, y: unit / 4},
          reflectOffset: {x: 0, y: 1 * unit},
        }),
      },
      mind: DefaultPaddleTrait.createInitialMind(),
    };
  }

  private static createInitialMind(): DefaultPaddleState {
    return {
      launcher: BallLauncherTrait.create({
        directionSpeed: Math.PI * 0.5,
        directionRange: {min: -Math.PI * 0.75, max: -Math.PI * 0.25},
      }),
    };
  }
}

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
    let act = st;
    if (args.gameState.scene.level.automaton.type === 'launching') {
      act = Im.replace2(act, ['mind', 'launcher'], la =>
        BallLauncherTrait.update(la, {
          deltaMs: args.gameState.time.lastDeltaMs,
        })
      );
    }
    return act;
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
