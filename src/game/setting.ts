import {Setting, Vec2d} from 'curtain-call2';
import {Health} from './components/health';

type StrictAs<Base, T extends Base> = T;

export type GameEndReason = 'clear' | 'abort' | 'game-over';

export type TryStgSetting = StrictAs<
  Setting,
  {
    level: {score: number; ended: boolean};
    bodies: {
      pc: {pos: Vec2d; health: Health};
      enemy: {pos: Vec2d; health: Health};
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
