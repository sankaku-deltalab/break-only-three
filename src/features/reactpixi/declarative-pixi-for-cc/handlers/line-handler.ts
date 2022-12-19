import * as PIXI from 'pixi.js';

import {
  Context,
  DeclarativeObject,
  Handler,
  PixiObject,
} from '../../declarative-pixi';
import {Cfg} from '../config-for-cc';

const ht = 'line';
type HT = typeof ht;

export class LineHandler implements Handler<Cfg, HT> {
  create(
    decObj: DeclarativeObject<Cfg, HT>,
    context: Context<Cfg>
  ): PixiObject<Cfg, HT> {
    const g = new PIXI.Graphics();
    g.mask = context.mask;
    return g;
  }

  isDecObjUpdated(
    newDecObj: DeclarativeObject<Cfg, HT>,
    oldDecObj: DeclarativeObject<Cfg, HT>,
    context: Context<Cfg>
  ): boolean {
    return newDecObj.payload !== oldDecObj.payload;
  }

  update(
    decObj: DeclarativeObject<Cfg, HT>,
    pixiObj: PixiObject<Cfg, HT>,
    context: Context<Cfg>
  ): void {
    const g = pixiObj;
    const [startPos, ...paths] = decObj.payload.paths;
    const {thickness, color, closed, zIndex} = decObj.payload;

    g.clear();
    g.lineStyle(thickness, color);
    g.moveTo(startPos.x, startPos.y);
    for (const p of paths) {
      g.lineTo(p.x, p.y);
    }
    if (closed) {
      g.closePath();
    }
    g.zIndex = zIndex;
  }

  destroyed(
    decObj: DeclarativeObject<Cfg, HT>,
    pixiObj: PixiObject<Cfg, HT>,
    context: Context<Cfg>
  ): void {}
}
