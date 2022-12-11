import product from 'immer';
import {
  AaRect2dTrait,
  ActressBehavior,
  ActressInitializer,
  ActressState,
  AnyEvent,
  Collision,
  CollisionHelper,
  EventTrait,
  GameState,
  GameStateHelper,
  Graphic,
  Im,
  InputHelper,
  LineGraphicTrait,
  Vec2d,
  Vec2dTrait,
  VisibleGameState,
} from 'curtain-call3';
import {gameArea, gameAreaRect, gameAreaSE, unit} from '../constants';
import {TryStgSetting} from '../setting';
import {PosTrait} from '../components/pos';
import {PaddleStatusTrait} from '../components/paddle-status';
import {BoLevelTrait} from '../level';
import {WholeGameProcessing} from '../whole-processing';
import {SigilsState, SigilTrait} from '../sigil';

type Stg = TryStgSetting;

const bt = 'paddle';
const mt = 'defaultPaddle';
type BT = typeof bt;
type MT = typeof mt;

export type DefaultPaddleState = {
  launcher: BallLauncherState;
};

export class DefaultPaddleTrait {
  static createActInit(args: {
    sigils: SigilsState;
  }): ActressInitializer<Stg, 'paddle', 'defaultPaddle'> {
    const paddleWidthBase = unit;
    const paddleWidthLevel = SigilTrait.getPaddleSizeLevel(args.sigils);
    const paddleWidth = paddleWidthBase * (paddleWidthLevel / 10);

    const reflectOffsetLengthBase = unit;
    const reflectOffsetLengthLevelRaw = SigilTrait.getPaddleFlatLevel(
      args.sigils
    );
    const reflectOffsetLengthLevel =
      (reflectOffsetLengthLevelRaw + paddleWidthLevel) / 2;
    const reflectOffsetLength =
      reflectOffsetLengthBase * (reflectOffsetLengthLevel / 10);

    return {
      bodyType: 'paddle',
      mindType: 'defaultPaddle',
      body: {
        pos: PosTrait.create({pos: {x: 0, y: gameAreaSE.y - unit}}),
        status: PaddleStatusTrait.create({
          size: {x: paddleWidth, y: unit / 4},
          reflectOffset: {x: 0, y: reflectOffsetLength},
        }),
      },
      mind: DefaultPaddleTrait.createInitialMind(),
    };
  }

  private static createInitialMind(): DefaultPaddleState {
    return {
      launcher: BallLauncherTrait.create({
        directionSpeed: Math.PI / 1000,
        directionRange: {min: -Math.PI * 0.75, max: -Math.PI * 0.25},
        launchPosOffset: {x: 0, y: -unit / 2},
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
    const sensitivityLevel = SigilTrait.getPaddleSensitivityLevel(
      BoLevelTrait.getSigils(args.gameState)
    );
    const sensitivity = (sensitivityLevel + 5) / 10;

    const movableArea = AaRect2dTrait.reduceArea(
      BoLevelTrait.getSurvivableArea(args.gameState, {}),
      st.body.status.size
    );
    const pointerDelta = InputHelper.deltaWhileDown(args.gameState);
    const delta = Vec2dTrait.mlt(pointerDelta, sensitivity);
    const newPos = AaRect2dTrait.clampPosition(
      Vec2dTrait.add(st.body.pos.pos, delta),
      movableArea
    );

    return Im.pipe(
      () => st,
      act =>
        Im.replace(act, 'body', b =>
          Im.replace(b, 'pos', p => PosTrait.moveTo(p, newPos))
        ),
      act =>
        (act = Im.replace(act, 'ev', ev => [
          ...ev,
          ...this.generateLaunchBallEv(act, args),
        ]))
    )();
  }

  private generateLaunchBallEv = (
    act: ActressState<Stg, BT, MT>,
    args: {
      gameState: VisibleGameState<Stg>;
    }
  ): AnyEvent<Stg>[] => {
    const st = args.gameState;

    if (st.scene.level.ended) return [];
    if (GameStateHelper.getLevel(st).automaton.type !== 'launching') return [];

    if (!InputHelper.upped(st)) return [];

    const ballPos = Vec2dTrait.add(
      act.body.pos.pos,
      act.mind.launcher.launchPosOffset
    );

    return [
      EventTrait.createEvent<Stg, 'launchBall'>('launchBall', {
        ballPos,
        directionRad: act.mind.launcher.direction,
      }),
    ];
  };

  update(
    st: ActressState<Stg, BT, MT>,
    args: {
      gameState: VisibleGameState<Stg>;
    }
  ): ActressState<Stg, BT, MT> {
    const launcherGuideSpeedLevel = SigilTrait.getLauncherGuideSpeedLevel(
      BoLevelTrait.getSigils(args.gameState)
    );
    const launcherGuideSpeed = launcherGuideSpeedLevel / 10;

    let act = st;
    if (args.gameState.scene.level.automaton.type === 'launching') {
      act = Im.replace2(act, ['mind', 'launcher'], la =>
        BallLauncherTrait.update(la, {
          deltaMs: args.gameState.time.lastDeltaMs,
          guideSpeedMlt: launcherGuideSpeed,
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
    const {nw, se, ne, sw} = AaRect2dTrait.corners(relArea);
    const zIndex = WholeGameProcessing.getZIndex().paddle;
    const color = WholeGameProcessing.getColors().paddle;
    const paddleLine = LineGraphicTrait.create({
      key: 'main',
      pos: st.body.pos.pos,
      color,
      paths: [nw, ne, se, sw],
      thickness: 2,
      closed: true,
      zIndex,
    });

    const launcherGuideLengthLevel = SigilTrait.getLauncherGuideLengthLevel(
      BoLevelTrait.getSigils(args.gameState)
    );
    const launcherGuideLength = (launcherGuideLengthLevel / 10) * unit;
    const launchPos = st.mind.launcher.launchPosOffset;
    const direction = Vec2dTrait.fromRadians(
      st.mind.launcher.direction,
      launcherGuideLength
    );
    const launchDest = Vec2dTrait.add(launchPos, direction);
    const launchLines =
      GameStateHelper.getLevel(args.gameState).automaton.type !== 'launching'
        ? []
        : [
            LineGraphicTrait.create({
              key: 'launchGuide',
              pos: st.body.pos.pos,
              color,
              paths: [launchPos, launchDest],
              thickness: 5,
              closed: false,
              zIndex,
            }),
          ];

    return [paddleLine, ...launchLines];
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
      excess: false,
    };
  }
}

export type BallLauncherState = Readonly<{
  direction: number;
  directionSpeed: number;
  directionRange: {min: number; max: number};
  directionMoveSign: -1 | 1;
  launchPosOffset: Vec2d;
}>;

export class BallLauncherTrait {
  static create(opt: {
    launchPosOffset: Vec2d;
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
    args: {deltaMs: number; guideSpeedMlt: number}
  ): BallLauncherState {
    let dirSign = launcher.directionMoveSign;
    let newDirection =
      launcher.direction +
      Math.abs(launcher.directionSpeed * args.deltaMs * args.guideSpeedMlt) *
        dirSign;
    if (newDirection < launcher.directionRange.min) {
      newDirection = launcher.directionRange.min;
      dirSign = 1;
    } else if (newDirection > launcher.directionRange.max) {
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
