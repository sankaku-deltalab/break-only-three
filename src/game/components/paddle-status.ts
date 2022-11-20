import {AaRect2d, AaRect2dTrait, Im, Vec2d, Vec2dTrait} from 'curtain-call2';
import {pipe} from 'rambda';
import {Pos, PosTrait} from './pos';

export type PaddleStatus = {
  size: Vec2d;
};

export class PaddleStatusTrait {
  static create(opt: {size: Vec2d}): PaddleStatus {
    return {
      size: opt.size,
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
}
