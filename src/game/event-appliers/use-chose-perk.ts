import {
  GameState,
  EventPayload,
  EventManipulator,
  Overlaps,
} from 'curtain-call3';
import {BoLevelTrait} from '../level';
import {TryStgSetting} from '../setting';
import {WholeGameProcessing} from '../whole-processing';

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
    const prevState =
      perk === undefined ? state : BoLevelTrait.addPerk(state, {perk});
    return WholeGameProcessing.generateInitialGameState({
      prevState,
    });
  }
}
