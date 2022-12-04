import {
  EventApplier,
  GameState,
  EventPayload,
  Im,
  GameStateHelper,
} from 'curtain-call3';
import {BoLevelTrait} from '../level';
import {TryStgSetting} from '../setting';

type Stg = TryStgSetting;

const evType = 'allBlocksAreBroken';
type EvType = typeof evType;

export class AllBlocksAreBrokenEv implements EventApplier<Stg, EvType> {
  applyEvent(
    state: GameState<Stg>,
    {}: EventPayload<Stg, EvType>
  ): GameState<Stg> {
    console.log('AllBlocksAreBrokenEv');
    return Im.pipe(
      () => state,
      st => BoLevelTrait.changeToAnnihilated(st, {durationMs: 1000})
    )();
    return Im.pipe(
      () => state,
      st => GameStateHelper.updateLevel(st, level => ({...level, ended: true}))
    )();
  }
}
