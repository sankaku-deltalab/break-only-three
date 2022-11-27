import {EventApplier, GameState, EventPayload} from 'curtain-call3';
import {TryStgSetting} from '../setting';

type Stg = TryStgSetting;

const evType = 'allBlocksAreBroken';
type EvType = typeof evType;

export class AllBlocksAreBrokenEv implements EventApplier<Stg, EvType> {
  applyEvent(
    state: GameState<Stg>,
    payload: EventPayload<Stg, EvType>
  ): GameState<Stg> {
    return state;
  }
}