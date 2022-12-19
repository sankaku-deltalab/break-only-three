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

type Stg = TryStgSetting;

export type PixiStageProps = {
  canvasSize: {x: number; y: number};
  graphics: CanvasGraphic<Stg>[];
  renderingArea: AaRect2d;
  outsideColor: number;
  backgroundColor: number;
  tick: (args: {deltaMs: number}) => void;
};

const PixiStage: React.FC<PixiStageProps> = ({
  canvasSize,
  graphics,
  renderingArea,
  outsideColor,
  backgroundColor,
  tick,
}) => {
  const [pixiApp, setPixiApp] = useState<PIXI.Application | null>(null);
  const [backgroundGraphics] = useState<PIXI.Graphics>(new PIXI.Graphics());
  const [gameAreaMaskGraphics] = useState<PIXI.Graphics>(new PIXI.Graphics());
  const [gameAreaGraphics] = useState<PIXI.Graphics>(new PIXI.Graphics());
  const [mainContainer] = useState<PIXI.Container>(new PIXI.Container());
  const [lineGraphicsMap] = useState<Map<string, PIXI.Graphics>>(new Map());
  const [spriteGraphicsMap] = useState<Map<string, PIXI.Sprite>>(new Map());

  const canvasRef = useRef<HTMLCanvasElement>(null);

  // init app
  useEffect(() => {
    if (pixiApp !== null) return;
    const view = canvasRef.current;
    if (view === null) return;

    const app = new PIXI.Application({
      view,
      antialias: true,
      backgroundColor: 0x000000,
    });
    app.stage.sortableChildren = true;
    app.ticker.add(frames => {
      const fpms = PIXI.settings.TARGET_FPMS ?? 1 / 60;
      const deltaMs = frames / fpms;
      tick({deltaMs});
    });

    app.stage.addChild(
      backgroundGraphics,
      gameAreaMaskGraphics,
      gameAreaGraphics,
      mainContainer
    );
    lineGraphicsMap.clear();
    spriteGraphicsMap.clear();
    setPixiApp(app);
  }, [
    pixiApp,
    canvasRef,
    backgroundGraphics,
    gameAreaMaskGraphics,
    gameAreaGraphics,
    mainContainer,
  ]);

  // update base graphics
  useEffect(() => {
    if (pixiApp) {
      pixiApp.renderer.resize(canvasSize.x, canvasSize.y);
    }
    const argsBase = {
      canvasSize,
      renderingNw: renderingArea.nw,
      renderingSize: AaRect2dTrait.size(renderingArea),
    };
    updateBackgroundGraphics({
      graphics: backgroundGraphics,
      color: outsideColor,
      ...argsBase,
    });
    updateGameAreaGraphics({
      graphics: gameAreaGraphics,
      mask: gameAreaMaskGraphics,
      color: backgroundColor,
      ...argsBase,
    });
    updateGameAreaMaskGraphics({
      graphics: gameAreaMaskGraphics,
      ...argsBase,
    });
    updateMainContainer({container: mainContainer, mask: gameAreaMaskGraphics});
  }, [renderingArea]);

  // update line graphics
  useEffect(() => {
    const lines = graphics.filter(GraphicHelper.isCanvasLineGraphic);
    const notUsed = new Set<string>(lineGraphicsMap.keys());

    const createGr = (key: string) => {
      const g = new PIXI.Graphics();
      mainContainer.addChild(g);
      lineGraphicsMap.set(key, g);
      return g;
    };

    for (const line of lines) {
      notUsed.delete(line.key);
      const g = lineGraphicsMap.get(line.key) ?? createGr(line.key);
      updateLineGraphics({pixiGraphics: g, ccLineGraphic: line});
    }
    for (const k of notUsed.keys()) {
      const g = lineGraphicsMap.get(k);
      if (g === undefined) continue;
      mainContainer.removeChild(g);
      lineGraphicsMap.delete(k);
    }
  }, [graphics]);

  // update graphics
  useEffect(() => {
    const sprites = graphics.filter(GraphicHelper.isCanvasSpriteGraphic);
    const notUsed = new Set<string>(spriteGraphicsMap.keys());

    const createSp = (key: string) => {
      const sp = new PIXI.Sprite();
      mainContainer.addChild(sp);
      spriteGraphicsMap.set(key, sp);
      return sp;
    };

    for (const sprite of sprites) {
      notUsed.delete(sprite.key);
      const sp = spriteGraphicsMap.get(sprite.key) ?? createSp(sprite.key);
      updateSprite({pixiSprite: sp, ccSpriteGraphic: sprite});
    }
    for (const k of notUsed.keys()) {
      const g = spriteGraphicsMap.get(k);
      if (g === undefined) continue;
      mainContainer.removeChild(g);
      spriteGraphicsMap.delete(k);
    }
  }, [graphics]);

  return (
    <canvas
      style={{pointerEvents: 'auto'}}
      width={canvasSize.x}
      height={canvasSize.y}
      ref={canvasRef}
    />
  );
};

const updateBackgroundGraphics = (args: {
  graphics: PIXI.Graphics;
  color: number;
  canvasSize: Vec2d;
}) => {
  console.log('updateBackgroundGraphics', args.canvasSize);
  const g = args.graphics;
  const canvasSize = args.canvasSize;
  g.position.x = 0;
  g.position.y = 0;
  g.clear();
  g.beginFill(args.color);
  g.drawRect(0, 0, canvasSize.x, canvasSize.y);
  g.endFill();
  g.zIndex = -10;
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
  g.drawRect(0, 0, renSize.x * 10, renSize.y * 10);
  g.endFill();
  g.zIndex = -20;
};

const updateGameAreaGraphics = (args: {
  graphics: PIXI.Graphics;
  mask: PIXI.Container | null;
  color: number;
  renderingNw: Vec2d;
  renderingSize: Vec2d;
}) => {
  const g = args.graphics;
  const renNw = args.renderingNw;
  const renSize = args.renderingSize;

  g.clear();
  g.beginFill(args.color);
  g.drawRect(renNw.x, renNw.y, renSize.x, renSize.y);
  g.endFill();
  g.mask = args.mask;
  g.zIndex = -10;
};

const updateMainContainer = (args: {
  container: PIXI.Container;
  mask: PIXI.Container | null;
}) => {
  const c = args.container;

  c.position.x = 0;
  c.position.y = 0;
  c.mask = args.mask;
  c.zIndex = 10;
};

const updateLineGraphics = (args: {
  pixiGraphics: PIXI.Graphics;
  ccLineGraphic: CanvasLineGraphic;
}) => {
  const g = args.pixiGraphics;
  const [startPos, ...paths] = args.ccLineGraphic.paths;
  const {thickness, color, closed, zIndex} = args.ccLineGraphic;

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
};

const updateSprite = (args: {
  pixiSprite: PIXI.Sprite;
  ccSpriteGraphic: CanvasSpriteGraphic;
}) => {
  const sp = args.pixiSprite;
  const {imgKey, pos, scale, zIndex} = args.ccSpriteGraphic;

  sp.texture = PIXI.Texture.from(imgKey);
  sp.anchor.set(0.5);
  sp.position = pos;
  sp.scale = scale;
  sp.zIndex = zIndex;
};

export default PixiStage;
