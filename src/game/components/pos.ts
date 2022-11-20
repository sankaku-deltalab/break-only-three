import {Im, Vec2d, Vec2dTrait} from 'curtain-call2';

export type Pos = {
  pos: Vec2d;
  prevPos: Vec2d;
};

export class PosTrait {
  static create(opt: {pos: Vec2d; prevPos?: Vec2d}): Pos {
    const prevPos = opt.prevPos ?? opt.pos;
    return {
      pos: opt.pos,
      prevPos,
    };
  }

  static move(pos: Pos, delta: Vec2d): Pos {
    return Im.replace(pos, 'pos', p => Vec2dTrait.add(p, delta));
  }

  static moveTo(pos: Pos, dest: Vec2d): Pos {
    return Im.replace(pos, 'pos', () => dest);
  }

  static copyPosToPrev(pos: Pos): Pos {
    return Im.replace(pos, 'prevPos', () => pos.pos);
  }
}
