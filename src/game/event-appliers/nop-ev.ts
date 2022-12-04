import {
  GameState,
  EventPayload,
  EventManipulator,
  Overlaps,
} from 'curtain-call3';
import {TryStgSetting} from '../setting';

type Stg = TryStgSetting;

const evType = 'nop';
type EvType = typeof evType;

export class NopEv implements EventManipulator<Stg, EvType> {
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
    payload: EventPayload<Stg, EvType>
  ): GameState<Stg> {
    return state;
  }
}
