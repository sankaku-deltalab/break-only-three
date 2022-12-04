import {
  GameState,
  EventPayload,
  GameStateHelper,
  Im,
  EventManipulator,
  Overlaps,
  Enum,
  Vec2d,
  ActressHelper,
} from 'curtain-call3';
import {LineEffect, LineEffectTrait} from '../components/line-effect';
import {gameAreaSE, unit} from '../constants';
import {BoLevelTrait} from '../level';
import {TryStgSetting} from '../setting';

type Stg = TryStgSetting;

const evType = 'ballWasFallen';
type EvType = typeof evType;

export class BallWasFallenEv implements EventManipulator<Stg, EvType> {
  generateEventsAtUpdate(
    state: GameState<Stg>,
    args: {
      overlaps: Overlaps;
    }
  ): EventPayload<Stg, EvType>[] {
    if (GameStateHelper.getLevel(state).automaton.type !== 'released')
      return [];

    const fallenFirstBall = Im.pipe(
      () => state,
      st => GameStateHelper.getBodiesOf(st, 'ball'),
      balls => Object.entries(balls),
      balls =>
        Enum.filter(balls, ([_, b]) => b.pos.pos.y >= gameAreaSE.y - b.diam),
      balls => (balls.length > 0 ? balls[0][0] : undefined)
    )();
    if (fallenFirstBall === undefined) return [];

    return [
      {
        ballId: fallenFirstBall,
      },
    ];
  }

  applyEvent(
    state: GameState<Stg>,
    {ballId}: EventPayload<Stg, EvType>
  ): GameState<Stg> {
    const ball = GameStateHelper.getBody(state, ballId, 'ball');

    if (ball.err) throw new Error('no ball');

    const effectInit = ActressHelper.createActressInitializer<
      Stg,
      'effectBody',
      'linesEffect'
    >({
      bodyType: 'effectBody',
      mindType: 'linesEffect',
      body: {},
      mind: {effects: createLineEffects(ball.val.pos.pos)},
    });

    return Im.pipe(
      () => state,
      st => BoLevelTrait.changeToFallenState(st, {durationMs: 1000}),
      st => GameStateHelper.addActress(st, effectInit).state
    )();
  }
}

const createLineEffects = (origin: Vec2d): LineEffect[] => {
  return Im.range(0, 15).map(i => {
    const destRel = {
      x: (Math.random() - 0.5) * 16 * unit,
      y: (Math.random() - 1.5) * 16 * unit,
    };
    return LineEffectTrait.create({
      lifeTimeMs: 500,
      activateDelayMs: 0,
      startPos: origin,
      destRel,

      key: `line${i}`,
      zIndex: 0,
      color: 0xff5555,
      thickness: unit / 8,
    });
  });
};
