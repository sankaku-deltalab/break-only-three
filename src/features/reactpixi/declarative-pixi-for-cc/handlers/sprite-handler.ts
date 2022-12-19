import * as PIXI from 'pixi.js';

import {
  Context,
  DeclarativeObject,
  Handler,
  PixiObject,
} from '../../declarative-pixi';
import {Cfg} from '../config-for-cc';

const ht = 'sprite';
type HT = typeof ht;

export class SpriteHandler implements Handler<Cfg, HT> {
  create(
    decObj: DeclarativeObject<Cfg, HT>,
    context: Context<Cfg>
  ): PixiObject<Cfg, HT> {
    return new PIXI.Sprite();
  }

  isDecObjUpdated(
    newDecObj: DeclarativeObject<Cfg, HT>,
    oldDecObj: DeclarativeObject<Cfg, HT>,
    context: Context<Cfg>
  ): boolean {
    return newDecObj.payload === oldDecObj.payload;
  }

  update(
    decObj: DeclarativeObject<Cfg, HT>,
    pixiObj: PixiObject<Cfg, HT>,
    context: Context<Cfg>
  ): void {
    const sp = pixiObj;
    const {imgKey, pos, scale, zIndex} = decObj.payload;

    sp.texture = PIXI.Texture.from(imgKey);
    sp.anchor.set(0.5);
    sp.position = pos;
    sp.scale = scale;
    sp.zIndex = zIndex;
  }

  destroyed(
    decObj: DeclarativeObject<Cfg, HT>,
    pixiObj: PixiObject<Cfg, HT>,
    context: Context<Cfg>
  ): void {}
}
