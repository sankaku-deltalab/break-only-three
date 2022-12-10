import {
  GameState,
  EventPayload,
  EventManipulator,
  Overlaps,
} from 'curtain-call3';
import {TryStgSetting} from '../setting';

type Stg = TryStgSetting;

const evType = 'userChosePerk';
type EvType = typeof evType;

export class UserChosePerkEv implements EventManipulator<Stg, EvType> {
  generateEventsAtUpdate(
    state: GameState<Stg>,
    args: {
      overlaps: Overlaps;
    }
  ): EventPayload<Stg, EvType>[] {
    return [];
  }

  applyEvent(
    state: GameState<Stg>,
    {perk}: EventPayload<Stg, EvType>
  ): GameState<Stg> {
    return state;
  }
}
