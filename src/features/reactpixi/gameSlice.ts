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
  GameProgressController,
  GameProgressState,
  GameRepresentation,
  GameState,
  Notification,
  NotificationPayload,
  RenderingState,
  Vec2d,
  Vec2dTrait,
} from 'curtain-call2';
import {gameArea} from './game/constants';
import {GameEndReason, TryStgSetting} from './game/setting';
import {tryStgInstances} from './game/instances';

type Stg = TryStgSetting;

const vec2d = Vec2dTrait;

type Result = {endReason: GameEndReason; score: number};

export type GameSliceState = {
  canvas: {
    size: Vec2d;
  };
  renderingConfig: {
    scaling: number;
  };
  mode: 'menu' | 'game' | 'game-result';
  menu: {};
  gameResult: Result;
  game: {
    gameProgress: GameProgressState;
    game: GameState<Stg>;
  };
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
    () => ({level: {score: 0, ended: false}, camera: {size: gameArea}}),
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
  mode: 'menu',
  menu: {},
  gameResult: {endReason: 'abort', score: 0},
  game: {
    gameProgress: {mode: 'not-started'},
    game: generateInitialGameState(),
  },
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
    startGameFromMenu: (editableState, action: PayloadAction<{}>) => {
      if (editableState.mode !== 'menu') {
        return;
      }
      editableState.mode = 'game';
      editableState.game = {
        gameProgress: {mode: 'active'},
        game: generateInitialGameState(),
      };
    },
    returnToMenuFromResult: (editableState, action: PayloadAction<{}>) => {
      if (editableState.mode !== 'game-result') {
        return;
      }
      editableState.mode = 'menu';
    },
    pauseGame: (editableState, action: PayloadAction<{}>) => {
      const state = original(editableState) as GameSliceState;
      const progress = GameProgressController.pause(state.game.gameProgress);
      editableState.game.gameProgress = progress;
    },
    unpauseGame: (editableState, action: PayloadAction<{}>) => {
      const state = original(editableState) as GameSliceState;
      const progress = GameProgressController.unpause(state.game.gameProgress);
      editableState.game.gameProgress = progress;
    },
    finishGame: (editableState, action: PayloadAction<{}>) => {
      const state = original(editableState) as GameSliceState;
      const progress = GameProgressController.finish(state.game.gameProgress);
      editableState.game.gameProgress = progress;
    },
    updateGame: (editableState, action: PayloadAction<{deltaMs: number}>) => {
      if (editableState.mode !== 'game') {
        return;
      }
      const state = original(editableState) as GameSliceState;
      const renderingState = calcRenderingState(state);
      let st = state.game.game;
      const {state: newGameState, notifications} =
        GameProgressController.updateGame(state.game.game, {
          progress: state.game.gameProgress,
          input: {
            pointer: state.pointer,
          },
          time: {
            deltaMs: action.payload.deltaMs,
          },
          renderingState,
          instances: tryStgInstances,
        });
      st = newGameState;

      for (const notify of notifications) {
        if (notify.type === 'end') {
          const progress = GameProgressController.finish(
            state.game.gameProgress
          );
          const no = notify as Notification<Stg, 'end'>;
          editableState.game.gameProgress = progress;
          editableState.mode = 'game-result';
          editableState.gameResult = {
            endReason: no.payload.reason,
            score: no.payload.score,
          };
        }
      }
      editableState.game.game = st;
    },
    resetAllStageState: (state, action: PayloadAction<GameState<Stg>>) => {
      state.game.game = action.payload;
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
  startGameFromMenu,
  returnToMenuFromResult,
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
  return GameRepresentation.generateGraphics(state.game.game, {
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
  return GameRepresentation.getRenderingArea(state.game.game, {
    renSt: calcRenderingState(state),
  });
});

export const selectMode = createSelector<
  [typeof selectGameState],
  'menu' | 'game' | 'game-result'
>([selectGameState], state => {
  return state.mode;
});

export const selectResult = createSelector<[typeof selectGameState], Result>(
  [selectGameState],
  state => {
    return state.gameResult;
  }
);

export default gameSlice.reducer;
