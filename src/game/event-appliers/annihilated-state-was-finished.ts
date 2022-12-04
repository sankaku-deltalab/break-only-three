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
  createEventsAtUpdate(
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
