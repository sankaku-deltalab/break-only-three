import {createSelector, createSlice, PayloadAction} from '@reduxjs/toolkit';
import {original} from 'immer';
import {pipe} from 'rambda';

import type {AppState} from '../../store';
import {
  AaRect2d,
  ActressInitializer,
  CanvasGraphic,
  Enum,
  GameStateHelper,
  GameProcessing,
  GameProgressController,
  GameProgressState,
  GameRepresentation,
  GameState,
  Im,
  Notification,
  NotificationPayload,
  RenderingState,
  Representation,
  Vec2d,
  Vec2dTrait,
  StateInitializer,
  Res,
  Result,
  AnyEvent,
  LevelState,
} from 'curtain-call3';
import {gameArea, unit} from '../../game/constants';
import {GameEndReason, TryStgSetting} from '../../game/setting';
import {tryStgInstances} from '../../game/instances';
import {PosTrait} from '../../game/components/pos';
import {HealthTrait} from '../../game/components/health';
import {BallMovementTrait} from '../../game/components/ball-movement';
import {PaddleStatusTrait} from '../../game/components/paddle-status';
import {BoLevelTrait} from '../../game/level';
import {DefaultPaddleTrait} from '../../game/actress-behaviors/default-paddle';
import {MovingSurvivableAreaTrait} from '../../game/actress-behaviors/moving-survibable-area';
import {WholeGameProcessing} from '../../game/whole-processing';
import {PerkTypes} from '../../game/perk';

type Stg = TryStgSetting;

const vec2d = Vec2dTrait;

type GameResult = {endReason: GameEndReason; score: number};

export type GameSliceState = {
  canvas: {
    size: Vec2d;
  };
  renderingConfig: {
    scaling: number;
  };
  mode: 'menu' | 'game' | 'game-result';
  menu: {};
  gameResult: GameResult;
  game: {
    gameProgress: GameProgressState;
    game: GameState<Stg>;
  };
  pointer: {
    canvasPos: Vec2d;
    down: boolean;
  };
  toGameEvents: AnyEvent<Stg>[];
};

const generateInitialGameState = (): GameState<Stg> => {
  return WholeGameProcessing.generateInitialGameState({});
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
  toGameEvents: [],
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
    pointerMovedTo: (state, action: PayloadAction<{pos: Vec2d}>) => {
      state.pointer.canvasPos = action.payload.pos;
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
      editableState.pointer = {
        canvasPos: vec2d.zero(),
        down: false,
      };
    },
    returnToMenuFromResult: (editableState, action: PayloadAction<{}>) => {
      if (editableState.mode !== 'game-result') {
        return;
      }
      editableState.mode = 'menu';
    },
    restartGame: (editableState, action: PayloadAction<{}>) => {
      if (editableState.mode !== 'game-result') {
        return;
      }
      editableState.mode = 'game';
      editableState.game = {
        gameProgress: {mode: 'active'},
        game: generateInitialGameState(),
      };
      editableState.pointer = {
        canvasPos: vec2d.zero(),
        down: false,
      };
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
      const events = state.toGameEvents;
      editableState.toGameEvents = [];
      const renderingState = calcRenderingState(state);
      let st = state.game.game;
      const {state: newGameState, notifications} =
        GameProgressController.updateGame(state.game.game, {
          progress: state.game.gameProgress,
          input: {
            pointer: state.pointer,
          },
          events,
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
          editableState.game.gameProgress = progress;
          editableState.mode = 'game-result';
          editableState.gameResult = {
            endReason: notify.payload.reason,
            score: notify.payload.score,
          };
        }
      }
      editableState.game.game = st;
    },
    resetAllStageState: (state, action: PayloadAction<GameState<Stg>>) => {
      state.game.game = action.payload;
    },
    addEvents: (state, action: PayloadAction<{events: AnyEvent<Stg>[]}>) => {
      state.toGameEvents = [...state.toGameEvents, ...action.payload.events];
    },
  },
});

export const {
  setCanvasSize,
  movePointer,
  pointerMovedTo,
  upPointer,
  downPointer,
  updateGame,
  resetAllStageState,
  startGameFromMenu,
  returnToMenuFromResult,
  restartGame,
  addEvents,
} = gameSlice.actions;

const calcRenderingState = (state: GameSliceState): RenderingState => {
  const scale =
    Math.min(
      state.canvas.size.x / gameArea.x,
      state.canvas.size.y / gameArea.y
    ) * state.renderingConfig.scaling;
  const renderingH = gameArea.y * scale;
  const center = {x: state.canvas.size.x / 2, y: renderingH / 2};
  return {
    center,
    scale,
    canvasSize: state.canvas.size,
  };
};

const selectGameState = (state: AppState) => state.game;

export const selectGame = createSelector<
  [typeof selectGameState],
  GameState<Stg>
>([selectGameState], state => {
  return state.game.game;
});

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

export const selectRepresentation = createSelector<
  [typeof selectGameState],
  Representation<Stg>
>([selectGameState], state => {
  return GameRepresentation.getRepresentation(state.game.game, {
    instances: tryStgInstances,
  });
});

export const selectMode = createSelector<
  [typeof selectGameState],
  'menu' | 'game' | 'game-result'
>([selectGameState], state => {
  return state.mode;
});

export const selectLevelState = createSelector<
  [typeof selectGame],
  LevelState<Stg>
>([selectGame], state => {
  return GameStateHelper.getLevel(state);
});

export const selectPerkChoosingState = createSelector<
  [typeof selectLevelState],
  Result<{perks: PerkTypes[]}>
>([selectLevelState], lv => {
  if (lv.automaton.type !== 'choosingPerk') return Res.err({});

  return Res.ok({perks: lv.automaton.perks});
});

export const selectResult = createSelector<
  [typeof selectGameState],
  GameResult
>([selectGameState], state => {
  return state.gameResult;
});

export default gameSlice.reducer;
