import {
  GameState,
  EventPayload,
  GameStateHelper,
  Im,
  Overlaps,
  EventManipulator,
} from 'curtain-call3';
import {BoLevelTrait} from '../level';
import {TryStgSetting} from '../setting';

type Stg = TryStgSetting;

const evType = 'fallenStateWasFinished';
type EvType = typeof evType;

export class FallenStateWasFinishedEv implements EventManipulator<Stg, EvType> {
  generateEventsAtUpdate(
    state: GameState<Stg>,
    args: {
      overlaps: Overlaps;
    }
  ): EventPayload<Stg, EvType>[] {
    const fallenStateWasFinished = BoLevelTrait.fallenStateWasFinished(
      state,
      {}
    );
    if (!fallenStateWasFinished) return [];

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
          reason: 'game-over',
          score: st.scene.level.score,
        }),
      st => BoLevelTrait.changeToFinishedState(st, {})
    )();
  }
}
