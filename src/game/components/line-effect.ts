import {
  Color,
  Im,
  LineGraphic,
  LineGraphicTrait,
  Vec2d,
  Vec2dTrait,
} from 'curtain-call3';
import BezierEasing from 'bezier-easing';

const easeIn = BezierEasing(0.42, 0, 1, 1);
const easeOut = BezierEasing(0, 0, 0.58, 1);

export type LineEffect = {
  elapsedTimeMs: number;
  lifeTimeMs: number;
  activateDelayMs: number;
  startPos: Vec2d;
  destRel: Vec2d;

  key: string;
  zIndex: number;
  color: Color;
  thickness: number;
};

export class LineEffectTrait {
  static create(opt: Omit<LineEffect, 'elapsedTimeMs'>): LineEffect {
    return {...opt, elapsedTimeMs: 0};
  }

  static update(line: LineEffect, deltaMs: number): LineEffect {
    return Im.replace(line, 'elapsedTimeMs', t => t + deltaMs);
  }

  static isEnded(line: LineEffect): boolean {
    return line.elapsedTimeMs >= line.lifeTimeMs + line.activateDelayMs;
  }

  static getCurrentPosRel(
    line: LineEffect
  ): {start: Vec2d; end: Vec2d} | undefined {
    const lifeTime = line.lifeTimeMs;
    const t = (line.elapsedTimeMs - line.activateDelayMs) / lifeTime;
    if (t < 0) return undefined;
    if (t > 1) return undefined;

    const rEnd = easeIn(t);

    const obj = {
      z: Vec2dTrait.zero(),
      d: line.destRel,
    };
    const rStart = easeOut(t);
    const start = Vec2dTrait.broadcast(
      obj,
      ({z, d}) => d * rStart + z * (1 - rStart)
    );
    const end = Vec2dTrait.broadcast(
      obj,
      ({z, d}) => d * rEnd + z * (1 - rEnd)
    );

    return {start, end};
  }

  static getThickness(line: LineEffect): number {
    const lifeTime = line.lifeTimeMs;
    const t = (line.elapsedTimeMs - line.activateDelayMs) / lifeTime;
    if (t < 0) return 0;
    if (t > 1) return line.thickness;
    return line.thickness * easeOut(t);
  }

  static generateGraphics(line: LineEffect): LineGraphic[] {
    const posRel = this.getCurrentPosRel(line);
    if (posRel === undefined) return [];
    return [
      LineGraphicTrait.create({
        key: line.key,
        pos: line.startPos,
        zIndex: line.zIndex,
        thickness: this.getThickness(line),
        color: line.color,
        paths: [posRel.start, posRel.end],
        closed: false,
      }),
    ];
  }
}
