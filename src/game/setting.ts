import {AaRect2d, BodyId, Setting, Vec2d} from 'curtain-call3';
import {DefaultPaddleState} from './actress-behaviors/default-paddle';
import {BallMovement} from './components/ball-movement';
import {Health} from './components/health';
import {PaddleStatus} from './components/paddle-status';
import {Pos} from './components/pos';
import {BoLevelState} from './level';

type StrictAs<Base, T extends Base> = T;

export type GameEndReason = 'clear' | 'abort' | 'game-over';

export type TryStgSetting = StrictAs<
  Setting,
  {
    level: BoLevelState;
    bodies: {
      pc: {pos: Pos; health: Health}; // unused
      enemy: {pos: Pos; health: Health}; // unused
      paddle: {pos: Pos; status: PaddleStatus};
      ball: {pos: Pos; movement: BallMovement; diam: number};
      block: {pos: Pos; size: Vec2d};
      wall: {shape: AaRect2d}; // unused
      // pcBullet: {pos: Vec2d; velocity: Vec2d};
      // enemyBullet: {pos: Vec2d; velocity: Vec2d};
    };
    minds: {
      defaultPc: {a: number}; // unused
      defaultEnemy: {}; // unused
      defaultPaddle: DefaultPaddleState;
      defaultWall: {}; // unused
      defaultBall: {};
      defaultBlock: {};
      // defaultPcBullet: {};
      // defaultEnemyBullet: {};
    };
    events: {
      nop: {};
      ballHitToPaddle: {ballId: BodyId; paddleId: BodyId};
      ballHitToBlock: {ballId: BodyId; blockId: BodyId};
      allBlocksAreBroken: {};
    };
    representation: {score: number; ended: boolean};
    notifications: {
      end: {reason: GameEndReason; score: number};
    };
  }
>;

const collisionModeRaws = {
  any: 0b00000001,
};

const collisionMasks = {
  any: 0b00000001,
};

export const collisionModes = {
  any: {mode: collisionModeRaws.any, mask: collisionMasks.any},
};
