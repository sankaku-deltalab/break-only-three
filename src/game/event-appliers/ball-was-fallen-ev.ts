import {
  GameState,
  EventPayload,
  GameStateHelper,
  Im,
  EventManipulator,
  Overlaps,
  Enum,
} from 'curtain-call3';
import {gameAreaSE} from '../constants';
import {BoLevelTrait} from '../level';
import {TryStgSetting} from '../setting';

type Stg = TryStgSetting;

const evType = 'ballWasFallen';
type EvType = typeof evType;

export class BallWasFallenEv implements EventManipulator<Stg, EvType> {
  createEvents(
    state: GameState<Stg>,
    args: {
      overlaps: Overlaps;
    }
  ): EventPayload<Stg, EvType>[] {
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
    return Im.pipe(
      () => state,
      st => BoLevelTrait.changeToFallenState(st, {durationMs: 1000})
    )();
  }
}
