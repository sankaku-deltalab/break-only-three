import * as PIXI from 'pixi.js';
import {AaRect2d, CanvasLineGraphic, CanvasSpriteGraphic} from 'curtain-call3';

import {Config} from '../declarative-pixi';

type StrictAs<Base, T extends Base> = T;

export type BuiltinRectPayload = {
  color: number;
  rect: AaRect2d;
  zIndex: number;
};

export type Cfg = StrictAs<
  Config,
  {
    context: {mask: PIXI.Graphics};
    handlers: {
      builtinRect: {payload: BuiltinRectPayload; pixiObj: PIXI.Graphics};
      line: {payload: CanvasLineGraphic; pixiObj: PIXI.Graphics};
      sprite: {payload: CanvasSpriteGraphic; pixiObj: PIXI.Sprite};
    };
  }
>;
