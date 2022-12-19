import React, {
  PointerEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import {useAppSelector, useAppDispatch} from '../../hooks';
import {
  selectGraphics,
  upPointer,
  downPointer,
  setCanvasSize,
  selectCanvasSize,
  updateGame,
  selectRenderingArea,
  pointerMovedTo,
} from './gameSlice';
import {AaRect2dTrait, Res, Result, Vec2d, Vec2dTrait} from 'curtain-call3';
import {WholeGameProcessing} from '../../game/whole-processing';
import PixiStage from './pixi-stage';

const vec2d = Vec2dTrait;

export type StageForNextjsProps = {
  canvasSize: {x: number; y: number};
};

const StageForNextjs: React.FC<StageForNextjsProps> = ({canvasSize}) => {
  const dispatch = useAppDispatch();
  const graphics = useAppSelector(selectGraphics);
  const storedCanvasSize = useAppSelector(selectCanvasSize);
  const renderingAreaRaw = useAppSelector(selectRenderingArea);
  const canvasRef = useRef<HTMLDivElement>(null);
  const [renderingArea, setRenderingArea] = useState(
    useAppSelector(selectRenderingArea)
  );

  const tick = useCallback(
    (args: {deltaMs: number}) => {
      dispatch(updateGame({deltaMs: args.deltaMs}));
    },
    [dispatch]
  );

  useEffect(() => {
    if (!AaRect2dTrait.eq(renderingArea, renderingAreaRaw)) {
      setRenderingArea(renderingAreaRaw);
    }
  }, [renderingAreaRaw]);

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

  const backgroundColor = WholeGameProcessing.getColors().background;
  const outsideColor = WholeGameProcessing.getColors().outside;

  return (
    <div
      id="stage-for-nextjs"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        pointerEvents: 'auto',
      }}
      ref={canvasRef}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerMove={handlePointerMove}
    >
      <PixiStage
        backgroundColor={backgroundColor}
        canvasSize={canvasSize}
        graphics={graphics}
        outsideColor={outsideColor}
        renderingArea={renderingArea}
        tick={tick}
      />
    </div>
  );
};

export default StageForNextjs;
