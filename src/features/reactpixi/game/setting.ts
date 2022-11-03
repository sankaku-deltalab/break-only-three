import {Setting, Vec2d} from 'curtain-call2';

type StrictAs<Base, T extends Base> = T;

export type TryStgSetting = StrictAs<
  Setting,
  {
    level: {score: number};
    bodies: {
      pc: {pos: Vec2d; health: number};
      enemy: {pos: Vec2d; health: number};
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
    representation: {score: number};
    notification: {
      end: {reason: 'clear' | 'abort' | 'game-over'; score: number};
    };
  }
>;
