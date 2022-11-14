import {Im, Vec2d, Vec2dTrait} from 'curtain-call2';

export type Pos = {
  pos: Vec2d;
};

export class PosTrait {
  static create(opt: {pos: Vec2d}): Pos {
    return {
      pos: opt.pos,
    };
  }

  static move(pos: Pos, delta: Vec2d): Pos {
    return Im.replace(pos, 'pos', p => Vec2dTrait.add(p, delta));
  }

  static moveTo(pos: Pos, dest: Vec2d): Pos {
    return Im.replace(pos, 'pos', () => dest);
  }
}
