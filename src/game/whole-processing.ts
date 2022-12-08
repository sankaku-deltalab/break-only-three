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
  score: number;
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
          score: opt.score,
          wholeVelocity: opt.wholeVelocity,
        }),
        camera: {size: gameArea},
      }),
      args => GameProcessing.createInitialState<Stg>(args),
      st => GameStateHelper.addActresses(st, acts).state
    )();
  }

  static generateInitialGameState(args: {score: number}): GameState<Stg> {
    const randIn = (start: number, stop: number): number => {
      const r = Math.random();
      return stop * r + start * (1 - r);
    };
    const velocityDir = randIn(Math.PI * 0.25, Math.PI * 0.25 * 3);
    const speed = lerp(args.score / 5, unit / 4000, unit / 100);
    const velocity = Vec2dTrait.fromRadians(velocityDir, speed);
    return WholeGameProcessing.initGameState({
      score: args.score,
      scoreMlt: 1,
      blockPositions: Enum.map(Im.range(0, 3), i => ({
        x: (i * 5 * unit) / 6,
        y: -unit,
      })),
      wholeVelocity: velocity,
    });
  }

  static getZIndex() {
    return {
      deadlyEffect: 110,
      ball: 100,
      paddle: 90,
      block: 80,
      hitEffect: 70,
      survivableAreaOutline: 60,
    };
  }

  static getColors() {
    return {
      deadlyEffect: 0xffffff,
      ball: 0xff0000,
      paddle: 0xff0000,
      block: 0xff0000,
      hitEffect: 0xffffff,
      background: 0x000000,
      outside: 0x222222,
      survivableAreaOutline: 0xff0000,
    };
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

const lerp = (rate: number, min: number, max: number): number => {
  const r = Math.max(min, Math.min(max, rate));
  return max * r + min * (1 - r);
};
