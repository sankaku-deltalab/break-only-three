import {
  GameState,
  EventPayload,
  GameStateHelper,
  Im,
  EventManipulator,
  Overlaps,
  Vec2dTrait,
  Enum,
} from 'curtain-call3';
import {unit} from '../constants';
import {BoLevelTrait} from '../level';
import {TryStgSetting} from '../setting';
import {WholeGameProcessing} from '../whole-processing';

type Stg = TryStgSetting;

const evType = 'annihilatedStateWasFinished';
type EvType = typeof evType;

export class AnnihilatedStateWasFinishedEv
  implements EventManipulator<Stg, EvType>
{
  generateEventsAtUpdate(
    state: GameState<Stg>,
    args: {
      overlaps: Overlaps;
    }
  ): EventPayload<Stg, EvType>[] {
    if (GameStateHelper.getLevel(state).automaton.type !== 'annihilated')
      return [];

    const anniStateWasFinished = BoLevelTrait.annihilatedStateWasFinished(
      state,
      {}
    );
    if (!anniStateWasFinished) return [];

    return [{}];
  }

  applyEvent(
    state: GameState<Stg>,
    {}: EventPayload<Stg, EvType>
  ): GameState<Stg> {
    return Im.pipe(
      () => state,
      st => BoLevelTrait.changeToChoosingPerkState(st, {})
    )();
  }
}
