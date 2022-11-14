import {Setting} from 'curtain-call2';
import {Health} from './components/health';
import {Pos} from './components/pos';

type StrictAs<Base, T extends Base> = T;

export type GameEndReason = 'clear' | 'abort' | 'game-over';

export type TryStgSetting = StrictAs<
  Setting,
  {
    level: {score: number; ended: boolean};
    bodies: {
      pc: {pos: Pos; health: Health};
      enemy: {pos: Pos; health: Health};
      // pcBullet: {pos: Vec2d; velocity: Vec2d};
      // enemyBullet: {pos: Vec2d; velocity: Vec2d};
    };
    minds: {
      defaultPc: {a: number};
      defaultEnemy: {};
      // defaultPcBullet: {};
      // defaultEnemyBullet: {};
    };
    events: {
      nop: {};
    };
    representation: {score: number; ended: boolean};
    notifications: {
      end: {reason: GameEndReason; score: number};
    };
  }
>;
