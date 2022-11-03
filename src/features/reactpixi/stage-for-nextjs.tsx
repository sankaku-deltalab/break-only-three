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
} from './gameSlice';
import {
  AaRect2d,
  AaRect2dTrait,
  CanvasLineGraphic,
  CanvasSpriteGraphic,
  GraphicHelper,
  Vec2dTrait,
} from 'curtain-call2';

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

  useEffect(() => {
    if (!vec2d.eq(canvasSize, storedCanvasSize)) {
      dispatch(setCanvasSize({canvasSize}));
    }
  }, [canvasSize, storedCanvasSize]);

  const handlePointerDown = (e: PointerEvent<HTMLElement>) => {
    dispatch(downPointer({pos: {x: e.screenX, y: e.screenY}}));
  };

  const handlePointerUp = (e: PointerEvent<HTMLElement>) => {
    dispatch(upPointer({pos: {x: e.screenX, y: e.screenY}}));
  };

  const handlePointerMove = (e: PointerEvent<HTMLElement>) => {
    dispatch(movePointer({delta: {x: e.movementX, y: e.movementY}}));
  };

  const Updater = () => {
    useTick(frames => {
      const deltaMs = frames / (1 / 60); // 1/60 = PIXI.settings.TARGET_FPMS
      dispatch(updateGame({deltaMs}));
    });
    return <Container />;
  };

  const {nw: renNw} = renderingArea;
  const renSize = AaRect2dTrait.size(renderingArea);

  const lineGraphics = graphics.filter(GraphicHelper.isCanvasLineGraphic);
  const spriteGraphics = graphics.filter(GraphicHelper.isCanvasSpriteGraphic);

  return (
    <div
      style={{width: 0, height: 0}}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerMove={handlePointerMove}
    >
      <Stage
        width={canvasSize.x}
        height={canvasSize.y}
        style={{position: 'absolute'}}
      >
        <Updater />
        <Graphics
          ref={maskRef}
          draw={g => {
            g.clear();
            g.beginFill(0xffffff);
            g.drawRect(renNw.x, renNw.y, renSize.x, renSize.y);
            g.endFill();
          }}
        />
        <Graphics
          draw={g => {
            g.clear();
            g.beginFill(0xaaaaaa);
            g.drawRect(renNw.x, renNw.y, renSize.x, renSize.y);
            g.endFill();
          }}
        />
        {/* <CameraGraphicElement area={renderingArea} /> */}
        <Container mask={maskRef.current} position={[0, 0]}>
          {lineGraphics.map(line => (
            <LineGraphicElement key={line.key} line={line} />
          ))}
          {spriteGraphics.map(g => (
            <SpriteGraphicElement key={g.key} sprite={g} />
          ))}
        </Container>
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

  return <Graphics key={props.line.key} draw={draw} />;
};

const SpriteGraphicElement = (props: {sprite: CanvasSpriteGraphic}) => {
  const g = props.sprite;
  return (
    <Sprite key={g.key} anchor={[0.5, 0.5]} image={g.imgKey} position={g.pos} />
  );
};

// const CameraGraphicElement = (props: {area: AaRect2d}) => {
//   const area = props.area;
//   const draw = useCallback(
//     (g: PIXI.Graphics) => {
//       g.clear();
//       g.lineStyle(5, 0xff00ff);

//       g.moveTo(area.nw.x, area.nw.y);
//       g.lineTo(area.se.x, area.se.y);

//       g.moveTo(area.nw.x, area.se.y);
//       g.lineTo(area.se.x, area.nw.y);
//     },
//     [area]
//   );

//   return <Graphics draw={draw} />;
// };

export default StageForNextjs;
