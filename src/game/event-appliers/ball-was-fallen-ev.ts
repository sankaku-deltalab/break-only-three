import {
  GameState,
  EventPayload,
  GameStateHelper,
  Im,
  EventManipulator,
  Overlaps,
} from 'curtain-call3';
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
    return [];
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
