import {
  EventApplier,
  GameState,
  EventPayload,
  GameStateHelper,
  Im,
} from 'curtain-call3';
import {BoLevelTrait} from '../level';
import {TryStgSetting} from '../setting';

type Stg = TryStgSetting;

const evType = 'ballWasFallen';
type EvType = typeof evType;

export class BallWasFallenEv implements EventApplier<Stg, EvType> {
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
