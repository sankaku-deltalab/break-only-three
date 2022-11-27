import {AaRect2d, AaRect2dTrait, Im, Vec2d, Vec2dTrait} from 'curtain-call3';
import {pipe} from 'rambda';
import {unit} from '../constants';
import {Pos, PosTrait} from './pos';

export type PaddleStatus = {
  size: Vec2d;
  reflectCenterOffset: Vec2d;
};

export class PaddleStatusTrait {
  static create(opt: {size: Vec2d; reflectOffset: Vec2d}): PaddleStatus {
    return {
      size: opt.size,
      reflectCenterOffset: opt.reflectOffset,
    };
  }

  static move(
    pos: Pos,
    args: {delta: Vec2d; paddle: PaddleStatus; movableArea: AaRect2d}
  ): Pos {
    const area = AaRect2dTrait.reduceArea(args.movableArea, args.paddle.size);
    const dest = pipe(
      () => Vec2dTrait.add(pos.pos, args.delta),
      p => AaRect2dTrait.clampPosition(p, area)
    )();
    return PosTrait.moveTo(pos, dest);
  }

  static calcReflectNormal(args: {
    ballPos: Vec2d;
    paddlePos: Vec2d;
    paddle: PaddleStatus;
  }): Vec2d {
    const reflectCenter = Vec2dTrait.add(
      args.paddlePos,
      args.paddle.reflectCenterOffset
    );

    return pipe(
      () => Vec2dTrait.sub(args.ballPos, reflectCenter),
      dir => Vec2dTrait.uniformed(dir)
    )();
  }
}
