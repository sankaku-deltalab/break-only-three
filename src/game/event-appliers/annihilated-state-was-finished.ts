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

const evType = 'annihilatedStateWasFinished';
type EvType = typeof evType;

export class AnnihilatedStateWasFinishedEv
  implements EventManipulator<Stg, EvType>
{
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
    {}: EventPayload<Stg, EvType>
  ): GameState<Stg> {
    console.log('AnnihilatedStateWasFinishedEv');
    return Im.pipe(
      () => state,
      st =>
        GameStateHelper.addNotification(st, 'end', {
          reason: 'clear',
          score: st.scene.level.score,
        }),
      st => BoLevelTrait.changeToFinishedState(st, {}),
      st => GameStateHelper.updateLevel(st, level => ({...level, ended: true}))
    )();
  }
}
