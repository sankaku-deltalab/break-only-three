import React, {PointerEvent, useCallback, useEffect, useRef} from 'react';
import {Stage, Sprite, useTick, Container, Graphics} from '@inlet/react-pixi';
import * as PIXI from 'pixi.js';
import {useAppSelector, useAppDispatch} from '../../hooks';
import {
  selectGraphics,
  movePointer,
  upPointer,
  downPointer,
  setCanvasSize,
  selectCanvasSize,
  updateGame,
  selectRenderingArea,
  pointerMovedTo,
} from './gameSlice';
import {
  AaRect2d,
  AaRect2dTrait,
  CanvasLineGraphic,
  CanvasSpriteGraphic,
  GraphicHelper,
  Res,
  Result,
  Vec2d,
  Vec2dTrait,
} from 'curtain-call3';
import {WholeGameProcessing} from '../../game/whole-processing';

const vec2d = Vec2dTrait;

export type StageForNextjsProps = {
  canvasSize: {x: number; y: number};
};

const StageForNextjs: React.FC<StageForNextjsProps> = ({canvasSize}) => {
  const dispatch = useAppDispatch();
  const graphics = useAppSelector(selectGraphics);
  const storedCanvasSize = useAppSelector(selectCanvasSize);
  const renderingArea = useAppSelector(selectRenderingArea);
  const maskRef = useRef(null);
  const canvasRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!vec2d.eq(canvasSize, storedCanvasSize)) {
      dispatch(setCanvasSize({canvasSize}));
    }
  }, [canvasSize, storedCanvasSize]);

  const getCanvasPos = (clientPos: Vec2d): Result<Vec2d> => {
    if (canvasRef.current === null) return Res.err('canvas not found');
    const canvasNwPos = {
      x: canvasRef.current.offsetLeft,
      y: canvasRef.current.offsetTop,
    };
    return Res.ok(Vec2dTrait.sub(clientPos, canvasNwPos));
  };

  const handlePointerDown = (e: PointerEvent<HTMLElement>) => {
    const pos = getCanvasPos({
      x: e.clientX,
      y: e.clientY,
    });
    if (pos.err) return;
    dispatch(downPointer({pos: pos.val}));
  };

  const handlePointerUp = (e: PointerEvent<HTMLElement>) => {
    const pos = getCanvasPos({
      x: e.clientX,
      y: e.clientY,
    });
    if (pos.err) return;
    dispatch(upPointer({pos: pos.val}));
  };

  const handlePointerMove = (e: PointerEvent<HTMLElement>) => {
    const pos = getCanvasPos({
      x: e.clientX,
      y: e.clientY,
    });
    if (pos.err) return;
    dispatch(pointerMovedTo({pos: pos.val}));
  };

  const Updater = () => {
    const fpms = PIXI.settings.TARGET_FPMS ?? 1 / 60;
    useTick(frames => {
      const deltaMs = frames / fpms; // 1/60 = PIXI.settings.TARGET_FPMS
      dispatch(updateGame({deltaMs}));
    });
    return <Container />;
  };

  const {nw: renNw} = renderingArea;
  const renSize = AaRect2dTrait.size(renderingArea);

  const lineGraphics = graphics.filter(GraphicHelper.isCanvasLineGraphic);
  const spriteGraphics = graphics.filter(GraphicHelper.isCanvasSpriteGraphic);
  const backgroundColor = WholeGameProcessing.getColors().background;
  const outsideColor = WholeGameProcessing.getColors().outside;

  return (
    <div
      style={{
        width: 2,
        height: 2,
        position: 'absolute',
        top: 0,
        left: 0,
        pointerEvents: 'auto',
      }}
      ref={canvasRef}
    >
      <Stage
        width={canvasSize.x}
        height={canvasSize.y}
        style={{position: 'fixed', top: 0, left: 0}}
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onPointerMove={handlePointerMove}
      >
        <Updater />
        <Graphics
          zIndex={-10}
          draw={g => {
            g.clear();
            g.beginFill(outsideColor);
            g.drawRect(0, 0, canvasSize.x, canvasSize.y);
            g.endFill();
          }}
        />
        <Graphics
          ref={maskRef}
          zIndex={-1}
          draw={g => {
            g.clear();
            g.beginFill(backgroundColor);
            g.drawRect(renNw.x, renNw.y, renSize.x, renSize.y);
            g.endFill();
          }}
        />
        <Graphics
          zIndex={-1}
          draw={g => {
            g.clear();
            g.beginFill(backgroundColor);
            g.drawRect(renNw.x, renNw.y, renSize.x, renSize.y);
            g.endFill();
          }}
        />
        {/* <CameraGraphicElement area={renderingArea} /> */}
        <ActuallyJustContainer mask={maskRef.current} position={[0, 0]}>
          {lineGraphics.map(line => (
            <LineGraphicElement key={line.key} line={line} />
          ))}
          {spriteGraphics.map(g => (
            <SpriteGraphicElement key={g.key} sprite={g} />
          ))}
        </ActuallyJustContainer>
      </Stage>
    </div>
  );
};

const LineGraphicElement = (props: {line: CanvasLineGraphic}) => {
  if (props.line.paths.length <= 1) {
    return <Graphics />;
  }
  const [startPos, ...paths] = props.line.paths;

  const draw = useCallback(
    (g: PIXI.Graphics) => {
      g.clear();
      g.lineStyle(props.line.thickness, props.line.color);
      g.moveTo(startPos.x, startPos.y);
      for (const p of paths) {
        g.lineTo(p.x, p.y);
      }
      if (props.line.closed) {
        g.closePath();
      }
    },
    [props]
  );

  return (
    <Graphics key={props.line.key} zIndex={props.line.zIndex} draw={draw} />
  );
};

// react v18 and react-pixi v6.8.0 cause type error. And avoid it with this line.
const ActuallyJustContainer: React.FC<Record<string, unknown>> = Container;

const SpriteGraphicElement = (props: {sprite: CanvasSpriteGraphic}) => {
  const g = props.sprite;
  return (
    <Sprite
      key={g.key}
      anchor={[0.5, 0.5]}
      zIndex={g.zIndex}
      image={g.imgKey}
      position={g.pos}
    />
  );
};

const CameraGraphicElement = (props: {area: AaRect2d}) => {
  const area = props.area;
  const draw = useCallback(
    (g: PIXI.Graphics) => {
      g.clear();
      g.lineStyle(2, 0xff00ff);

      g.moveTo(area.nw.x, area.nw.y);
      g.lineTo(area.se.x, area.se.y);

      g.moveTo(area.nw.x, area.se.y);
      g.lineTo(area.se.x, area.nw.y);
    },
    [area]
  );

  return <Graphics draw={draw} />;
};

export default StageForNextjs;
