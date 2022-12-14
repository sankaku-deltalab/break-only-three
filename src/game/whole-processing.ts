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
import {PerksState, PerkTrait} from './perk';
import {TryStgSetting} from './setting';

type Stg = TryStgSetting;

export type GameInit = {
  perks: PerksState;
  score: number;
  scoreMlt: number;
  blockPositions: Vec2d[];
  wholeVelocity: Vec2d;
};

export class WholeGameProcessing {
  static initGameState(opt: GameInit): GameState<Stg> {
    const sigils = PerkTrait.convertPerksToSigils(opt.perks);
    const paddle = DefaultPaddleTrait.createActInit({sigils});
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
          perks: opt.perks,
          wholeVelocity: opt.wholeVelocity,
        }),
        camera: {size: gameArea},
      }),
      args => GameProcessing.createInitialState<Stg>(args),
      st => GameStateHelper.addActresses(st, acts).state
    )();
  }

  static generateInitialGameState(args: {
    prevState?: GameState<Stg>;
  }): GameState<Stg> {
    const randIn = (start: number, stop: number): number => {
      const r = Math.random();
      return stop * r + start * (1 - r);
    };
    const score = args.prevState
      ? GameStateHelper.getLevel(args.prevState).score + 1
      : 0;
    const perks = args.prevState
      ? GameStateHelper.getLevel(args.prevState).perks
      : PerkTrait.getZeroPerks();
    const velocityDir = randIn(Math.PI * 0.25, Math.PI * 0.25 * 3);
    const speed = lerp(score / 5, unit / 1000, unit / 250);
    const velocity = Vec2dTrait.fromRadians(velocityDir, speed);
    return WholeGameProcessing.initGameState({
      perks,
      score: score,
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

  static getEvaluationTextFromScore(score: number): string {
    if (score >= 10) return 'You are SUPER HUMAN';
    if (score >= 5) return 'You Beat Game!';
    if (score <= 0) return 'We will meet again soon';
    return 'You can do it';
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
