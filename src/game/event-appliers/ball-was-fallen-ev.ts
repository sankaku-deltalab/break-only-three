import {EventApplier, GameState, EventPayload} from 'curtain-call3';
import {TryStgSetting} from '../setting';

type Stg = TryStgSetting;

const evType = 'ballWasFallen';
type EvType = typeof evType;

export class BallWasFallenEv implements EventApplier<Stg, EvType> {
  applyEvent(
    state: GameState<Stg>,
    {ballId}: EventPayload<Stg, EvType>
  ): GameState<Stg> {
    return state;
  }
}
