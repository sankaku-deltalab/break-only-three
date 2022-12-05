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

    const blockPositionsX = Im.range(-2, 3).map(i => (i * unit) / 1);
    const blockPositionsY = Im.range(-2, 3).map(i => (i * unit) / 1 - unit * 1);
    const allPos = blockPositionsX.flatMap(x =>
      blockPositionsY.map(y => ({x, y}))
    );
    const poses = randomPop(allPos, 3);
    const blockSize = {x: unit / 1, y: unit / 2};

    const blocks = Im.pipe(
      () => poses,
      p =>
        Enum.map(
          p,
          (pos): ActressInitializer<Stg, 'block', 'defaultBlock'> => ({
            bodyType: 'block',
            mindType: 'defaultBlock',
            body: {
              pos: PosTrait.create({pos}),
              size: blockSize,
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

const randomPop = <T>(items: T[], count: number): T[] => {
  const popen: T[] = [];
  let itemsCopy = [...items];
  for (const i of Im.range(0, count)) {
    if (itemsCopy.length === 0) break;
    const idx = Math.floor(Math.random() * itemsCopy.length);
    popen.push(itemsCopy[idx]);
    itemsCopy = itemsCopy.filter((_v, i) => i !== idx);
  }

  return popen;
};
