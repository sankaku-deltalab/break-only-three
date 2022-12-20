import {AaRect2dTrait} from 'curtain-call3';
import * as PIXI from 'pixi.js';

import {
  Context,
  DeclarativeObject,
  Handler,
  PixiObject,
} from '../../declarative-pixi';
import {Cfg} from '../config-for-cc';

const ht = 'builtinRect';
type HT = typeof ht;

export class BuiltinRectHandler implements Handler<Cfg, HT> {
  createPixiObject(
    decObj: DeclarativeObject<Cfg, HT>,
    context: Context<Cfg>
  ): PixiObject<Cfg, HT> {
    return new PIXI.Graphics();
  }

  shouldUpdate(
    newDecObj: DeclarativeObject<Cfg, HT>,
    oldDecObj: DeclarativeObject<Cfg, HT>,
    pixiObj: PixiObject<Cfg, HT>,
    context: Context<Cfg>
  ): boolean {
    const payloadChanged = newDecObj.payload !== oldDecObj.payload;
    const maskChanged = context.mask !== pixiObj.mask;
    return payloadChanged || maskChanged;
  }

  update(
    decObj: DeclarativeObject<Cfg, HT>,
    pixiObj: PixiObject<Cfg, HT>,
    context: Context<Cfg>
  ): void {
    const g = pixiObj;
    const {rect, color, zIndex} = decObj.payload;
    const size = AaRect2dTrait.size(rect);

    g.clear();
    g.beginFill(color);
    g.drawRect(rect.nw.x, rect.nw.y, size.x, size.y);
    g.endFill();
    g.mask = context.mask;
    g.zIndex = zIndex;
  }

  destroyed(
    decObj: DeclarativeObject<Cfg, HT>,
    pixiObj: PixiObject<Cfg, HT>,
    context: Context<Cfg>
  ): void {}
}
