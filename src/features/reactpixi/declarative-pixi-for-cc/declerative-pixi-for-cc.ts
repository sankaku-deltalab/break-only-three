import * as PIXI from 'pixi.js';
import {
  AnyDeclarativeObj,
  DeclarativePixi,
  Handlers,
} from '../declarative-pixi';
import {Cfg} from './config-for-cc';
import {LineHandler} from './handlers/line-handler';
import {SpriteHandler} from './handlers/sprite-handler';

const handlers: Handlers<Cfg> = {
  line: new LineHandler(),
  sprite: new SpriteHandler(),
};

export type DeclarativePixiForCc = DeclarativePixi<Cfg>;
export type AnyDeclarativeObjForCc = AnyDeclarativeObj<Cfg>;

export const createDecPixiForCc = (app: PIXI.Application) => {
  return new DeclarativePixi(app.stage, handlers);
};
