import React, {useEffect, useRef, useState} from 'react';
import * as PIXI from 'pixi.js';
import {
  AaRect2d,
  AaRect2dTrait,
  CanvasGraphic,
  CanvasLineGraphic,
  CanvasSpriteGraphic,
  GraphicHelper,
  Vec2d,
} from 'curtain-call3';
import {TryStgSetting} from '../../game/setting';
import {
  AnyDeclarativeObjForCc,
  createDecPixiForCc,
  DeclarativePixiForCc,
} from './declarative-pixi-for-cc/declerative-pixi-for-cc';

type Stg = TryStgSetting;

export type PixiStage2Props = {
  canvasSize: {x: number; y: number};
  graphics: CanvasGraphic<Stg>[];
  renderingArea: AaRect2d;
  outsideColor: number;
  backgroundColor: number;
  tick: (args: {deltaMs: number}) => void;
};

const PixiStage2: React.FC<PixiStage2Props> = ({
  canvasSize,
  graphics,
  renderingArea,
  outsideColor,
  backgroundColor,
  tick,
}) => {
  const [decPixi, setDecPixi] = useState<
    [PIXI.Application, DeclarativePixiForCc] | null
  >(null);
  const [gameAreaMaskGraphics] = useState<PIXI.Graphics>(new PIXI.Graphics());
  const [gameAreaGraphics] = useState<PIXI.Graphics>(new PIXI.Graphics());
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // init app
  useEffect(() => {
    if (decPixi !== null) return;
    const canvas = canvasRef.current;
    if (canvas === null) return;

    const app = new PIXI.Application({
      view: canvas,
      antialias: true,
      backgroundColor: outsideColor,
    });
    app.stage.sortableChildren = true;
    app.stage.addChild(gameAreaMaskGraphics, gameAreaGraphics);
    app.ticker.add(() => {
      const deltaMs = app.ticker.deltaMS;
      tick({deltaMs});
    });

    const decP = createDecPixiForCc(app);
    setDecPixi([app, decP]);
  }, [canvasRef]);

  // update canvas size
  useEffect(() => {
    if (decPixi === null) return;
    const [app, _] = decPixi;
    app.renderer.resize(canvasSize.x, canvasSize.y);
  }, [canvasSize]);

  // update base graphics
  useEffect(() => {
    const argsBase = {
      canvasSize,
      renderingNw: renderingArea.nw,
      renderingSize: AaRect2dTrait.size(renderingArea),
    };
    updateGameAreaMaskGraphics({
      graphics: gameAreaMaskGraphics,
      ...argsBase,
    });
  }, [renderingArea]);

  // update graphics
  useEffect(() => {
    if (decPixi === null) return;
    const [_, dec] = decPixi;
    const decObjects = [
      ...createDecObjectsFromCcGraphics(graphics),
      ...createBuiltinDecObjects({
        renderingArea,
        gameAreaColor: backgroundColor,
      }),
    ];
    dec.update(decObjects, {mask: gameAreaMaskGraphics});
  }, [graphics, decPixi, renderingArea, backgroundColor]);

  return (
    <canvas
      style={{pointerEvents: 'auto'}}
      width={canvasSize.x}
      height={canvasSize.y}
      ref={canvasRef}
    />
  );
};

const createBuiltinDecObjects = (args: {
  renderingArea: AaRect2d;
  gameAreaColor: number;
}): AnyDeclarativeObjForCc[] => {
  return [
    {
      id: 'builtinRect:gameArea',
      type: 'builtinRect',
      payload: {
        rect: args.renderingArea,
        color: args.gameAreaColor,
        zIndex: -10,
      },
    },
  ];
};

const createDecObjectsFromCcGraphics = (
  graphics: CanvasGraphic<Stg>[]
): AnyDeclarativeObjForCc[] => {
  return graphics.map(g => {
    if (g.type === 'canvas-line') {
      return {
        id: g.key,
        type: 'line',
        payload: g,
      };
    }
    if (g.type === 'canvas-sprite') {
      return {
        id: g.key,
        type: 'sprite',
        payload: g,
      };
    }
    throw new Error('unknown graphic');
  });
};

const updateGameAreaMaskGraphics = (args: {
  graphics: PIXI.Graphics;
  renderingNw: Vec2d;
  renderingSize: Vec2d;
}) => {
  const g = args.graphics;
  const renNw = args.renderingNw;
  const renSize = args.renderingSize;

  g.clear();
  g.beginFill(0xffffff);
  g.drawRect(renNw.x, renNw.y, renSize.x, renSize.y);
  g.endFill();
  g.zIndex = -20;
};

export default PixiStage2;
