import {AaRect2d, AaRect2dTrait, Im, Vec2d, Vec2dTrait} from 'curtain-call2';
import {unit} from '../constants';

export type BallMovement = {
  velocity: Vec2d;
};

export class BallMovementTrait {
  static create(): BallMovement {
    return {
      velocity: {x: (1 * unit) / 1000, y: (-10 * unit) / 1000},
    };
  }

  static setVelocity(velocity: Vec2d): BallMovement {
    return {
      velocity,
    };
  }

  static reflect(
    ball: BallMovement,
    args: {prevPos: Vec2d; pos: Vec2d; wallShape: AaRect2d}
  ): BallMovement {
    // TODO: 相手が paddle だったとき、paddle が ball の動きに垂直な方向でたたくと、想定してない方向に反射してしまう。
    const prevPosPosition = AaRect2dTrait.calcPointPosition(args.prevPos, {
      area: args.wallShape,
    });
    const posPosition = AaRect2dTrait.calcPointPosition(args.pos, {
      area: args.wallShape,
    });
    const position = Vec2dTrait.isZero(posPosition)
      ? prevPosPosition
      : posPosition; // TODO: rewrite with using normal

    if (Vec2dTrait.isZero(position)) return ball;

    const normal = Vec2dTrait.uniformed(Vec2dTrait.mlt(position, -1));

    if (Vec2dTrait.dot(normal, ball.velocity) <= 0) return ball;

    const newVelocity = Vec2dTrait.reflect(ball.velocity, normal);

    console.log(ball.velocity, position, normal, newVelocity);
    return Im.replace(ball, 'velocity', () => newVelocity);
  }
}
