import {AaRect2d, BodyId, Setting, Vec2d} from 'curtain-call3';
import {DefaultPaddleState} from './actress-behaviors/default-paddle';
import {BallMovement} from './components/ball-movement';
import {Health} from './components/health';
import {LineEffect} from './components/line-effect';
import {PaddleStatus} from './components/paddle-status';
import {Pos} from './components/pos';
import {BoLevelState} from './level';
import {PerksState, PerkTypes} from './perk';

type StrictAs<Base, T extends Base> = T;

export type GameEndReason = 'clear' | 'abort' | 'game-over';

export type TryStgSetting = StrictAs<
  Setting,
  {
    level: BoLevelState;
    bodies: {
      paddle: {pos: Pos; status: PaddleStatus};
      ball: {
        pos: Pos;
        movement: BallMovement;
        diam: number;
        penetrative: boolean;
      };
      block: {pos: Pos; size: Vec2d};
      survivableArea: {area: AaRect2d};
      effectBody: {};
    };
    minds: {
      defaultPaddle: DefaultPaddleState;
      defaultBall: {};
      defaultBlock: {};
      movingSurvivableArea: {};
      linesEffect: {effects: LineEffect[]};
    };
    events: {
      nop: {};
      launchBall: {ballPos: Vec2d; directionRad: number};
      ballHitToPaddle: {ballId: BodyId; paddleId: BodyId};
      ballHitToBlock: {ballId: BodyId; blockId: BodyId};
      ballHitToSurvivableArea: {ballId: BodyId};
      allBlocksAreBroken: {};
      ballWasFallen: {ballId: BodyId};
      annihilatedStateWasFinished: {};
      fallenStateWasFinished: {};
      anyBlockGetOutFromSurvivableArea: {blockIds: BodyId[]};
      userChosePerk: {perk?: PerkTypes};
    };
    representation: {score: number; ended: boolean};
    notifications: {
      end: {reason: GameEndReason; score: number; perks: PerksState};
    };
  }
>;
