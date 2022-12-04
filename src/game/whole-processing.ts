import {
  ActressInitializer,
  Enum,
  GameProcessing,
  GameState,
  GameStateHelper,
  Im,
  StateInitializer,
  Vec2d,
  Vec2dTrait,
} from 'curtain-call3';
import {DefaultPaddleTrait} from './actress-behaviors/default-paddle';
import {MovingSurvivableAreaTrait} from './actress-behaviors/moving-survibable-area';
import {PosTrait} from './components/pos';
import {gameArea, unit} from './constants';
import {BoLevelTrait} from './level';
import {TryStgSetting} from './setting';

type Stg = TryStgSetting;

export type GameInit = {
  scoreMlt: number;
  blockPositions: Vec2d[];
  wholeVelocity: Vec2d;
};

export class WholeGameProcessing {
  static initGameState(opt: GameInit): GameState<Stg> {
    const paddle = DefaultPaddleTrait.createActInit();
    const survivableArea = MovingSurvivableAreaTrait.createActInit();

    const blocks = Im.pipe(
      () => Im.range(0, 3),
      r =>
        Enum.map(
          r,
          (i): ActressInitializer<Stg, 'block', 'defaultBlock'> => ({
            bodyType: 'block',
            mindType: 'defaultBlock',
            body: {
              pos: PosTrait.create({pos: {x: (i * 5 * unit) / 6, y: -unit}}),
              size: {x: unit / 2, y: unit / 4},
            },
            mind: {},
          })
        ),
      v => v
    )();

    const acts = [paddle, survivableArea, ...blocks];

    return Im.pipe(
      (): StateInitializer<Stg> => ({
        level: BoLevelTrait.createInitial({
          wholeVelocity: opt.wholeVelocity,
        }),
        camera: {size: gameArea},
      }),
      args => GameProcessing.createInitialState<Stg>(args),
      st => GameStateHelper.addActresses(st, acts).state
    )();
  }
}
