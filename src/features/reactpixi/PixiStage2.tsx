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
  const [decPixi, setDecPixi] = useState<DeclarativePixiForCc | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // init app
  useEffect(() => {
    if (decPixi !== null) return;
    const canvas = canvasRef.current;
    if (canvas === null) return;

    const app = new PIXI.Application({
      view: canvas,
      antialias: true,
      backgroundColor: 0x000000,
    });
    app.stage.sortableChildren = true;
    const decP = createDecPixiForCc(app);
    app.ticker.add(frames => {
      const fpms = PIXI.settings.TARGET_FPMS ?? 1 / 60;
      const deltaMs = frames / fpms;
      tick({deltaMs});
    });

    setDecPixi(decP);
  }, [canvasRef]);

  // update canvas size
  useEffect(() => {
    if (decPixi === null) return;
    decPixi.app.renderer.resize(canvasSize.x, canvasSize.y);
  }, [canvasSize]);

  // update graphics
  useEffect(() => {
    if (decPixi === null) return;
    const decObjects = createDecObjects(graphics);
    decPixi.update(decObjects, {});
  }, [graphics, decPixi]);

  return (
    <canvas
      style={{pointerEvents: 'auto'}}
      width={canvasSize.x}
      height={canvasSize.y}
      ref={canvasRef}
    />
  );
};

const createDecObjects = (
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

export default PixiStage2;
