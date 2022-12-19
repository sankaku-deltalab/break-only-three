import * as PIXI from 'pixi.js';
import {CanvasLineGraphic, CanvasSpriteGraphic} from 'curtain-call3';

import {Config} from '../declarative-pixi';

type StrictAs<Base, T extends Base> = T;

export type Cfg = StrictAs<
  Config,
  {
    context: {mask: PIXI.Graphics};
    handlers: {
      line: {payload: CanvasLineGraphic; pixiObj: PIXI.Graphics};
      sprite: {payload: CanvasSpriteGraphic; pixiObj: PIXI.Sprite};
    };
  }
>;
