import {
  EventApplier,
  GameState,
  EventPayload,
  Im,
  GameStateHelper,
} from 'curtain-call3';
import {TryStgSetting} from '../setting';

type Stg = TryStgSetting;

const evType = 'allBlocksAreBroken';
type EvType = typeof evType;

export class AllBlocksAreBrokenEv implements EventApplier<Stg, EvType> {
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
      st => GameStateHelper.updateLevel(st, level => ({...level, ended: true}))
    )();
  }
}
