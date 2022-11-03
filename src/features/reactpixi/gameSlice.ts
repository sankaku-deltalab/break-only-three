import {createSelector, createSlice, PayloadAction} from '@reduxjs/toolkit';
import {original} from 'immer';
import {pipe} from 'rambda';

import type {AppState} from '../../store';
import {
  AaRect2d,
  ActressInitializer,
  CanvasGraphic,
  GameHelper,
  GameProcessing,
  GameState,
  RenderingState,
  Vec2d,
  Vec2dTrait,
} from 'curtain-call2';
import {gameArea} from './game/constants';
import {TryStgSetting} from './game/setting';
import {tryStgInstances} from './game/instances';

type Stg = TryStgSetting;

const vec2d = Vec2dTrait;

export type GameSliceState = {
  canvas: {
    size: Vec2d;
  };
  renderingConfig: {
    scaling: number;
  };
  game: GameState<Stg>;
  pointer: {
    canvasPos: Vec2d;
    down: boolean;
  };
};

const generateInitialGameState = (): GameState<Stg> => {
  const pc: ActressInitializer<Stg, 'pc', 'defaultPc'> = {
    bodyType: 'pc',
    mindType: 'defaultPc',
    body: {pos: Vec2dTrait.zero(), health: 0},
    mind: {a: 0},
  };

  return pipe(
    () => ({level: {score: 0}, camera: {size: gameArea}}),
    args => GameProcessing.init<Stg>(args),
    st => GameHelper.addActress(st, pc),
    args => args.state
  )();
};

const initialState: GameSliceState = {
  canvas: {
    size: {x: 16, y: 16},
  },
  renderingConfig: {
    scaling: 1,
  },
  game: generateInitialGameState(),
  pointer: {
    canvasPos: vec2d.zero(),
    down: false,
  },
};

export const gameSlice = createSlice({
  name: 'game',
  initialState,
  reducers: {
    setCanvasSize: (state, action: PayloadAction<{canvasSize: Vec2d}>) => {
      state.canvas.size = action.payload.canvasSize;
    },
    movePointer: (state, action: PayloadAction<{delta: Vec2d}>) => {
      state.pointer.canvasPos = vec2d.add(
        action.payload.delta,
        state.pointer.canvasPos
      );
    },
    downPointer: (state, action: PayloadAction<{pos: Vec2d}>) => {
      state.pointer.canvasPos = action.payload.pos;
      state.pointer.down = true;
    },
    upPointer: (state, action: PayloadAction<{pos: Vec2d}>) => {
      state.pointer.canvasPos = action.payload.pos;
      state.pointer.down = false;
    },
    updateGame: (editableState, action: PayloadAction<{deltaMs: number}>) => {
      const state = original(editableState) as GameSliceState;
      const renderingState = calcRenderingState(state);
      const newGameState = GameProcessing.update(state.game, {
        input: {
          pointer: state.pointer,
        },
        time: {
          deltaMs: action.payload.deltaMs,
        },
        renderingState,
        instances: tryStgInstances,
      });
      editableState.game = newGameState;
    },
    resetAllStageState: (state, action: PayloadAction<GameState<Stg>>) => {
      state.game = action.payload;
    },
  },
});

export const {
  setCanvasSize,
  movePointer,
  upPointer,
  downPointer,
  updateGame,
  resetAllStageState,
} = gameSlice.actions;

const calcRenderingState = (state: GameSliceState): RenderingState => {
  return {
    center: Vec2dTrait.div(state.canvas.size, 2),
    scale:
      Math.min(
        state.canvas.size.x / gameArea.x,
        state.canvas.size.y / gameArea.y
      ) * state.renderingConfig.scaling,
    canvasSize: state.canvas.size,
  };
};

const selectGameState = (state: AppState) => state.game;

export const selectGraphics = createSelector<
  [typeof selectGameState],
  CanvasGraphic<Stg>[]
>([selectGameState], state => {
  return GameProcessing.generateGraphics(state.game, {
    renderingState: calcRenderingState(state),
    instances: tryStgInstances,
  });
});

export const selectCanvasSize = createSelector<[typeof selectGameState], Vec2d>(
  [selectGameState],
  state => {
    return state.canvas.size;
  }
);

export const selectRenderingArea = createSelector<
  [typeof selectGameState],
  AaRect2d
>([selectGameState], state => {
  return GameProcessing.getRenderingArea(state.game, {
    renSt: calcRenderingState(state),
  });
});

export default gameSlice.reducer;
