import {
  GameState,
  EventPayload,
  Im,
  GameStateHelper,
  EventManipulator,
  Overlaps,
} from 'curtain-call3';
import {BoLevelTrait} from '../level';
import {TryStgSetting} from '../setting';

type Stg = TryStgSetting;

const evType = 'allBlocksAreBroken';
type EvType = typeof evType;

export class AllBlocksAreBrokenEv implements EventManipulator<Stg, EvType> {
  createEvents(
    state: GameState<Stg>,
    args: {
      overlaps: Overlaps;
    }
  ): EventPayload<Stg, EvType>[] {
    if (GameStateHelper.getLevel(state).automaton.type !== 'released')
      return [];

    const thereIsNoBlocks = Im.pipe(
      () => state,
      st => GameStateHelper.getBodiesOf(st, 'block'),
      blocks => Object.entries(blocks),
      blocks => blocks.length === 0
    )();
    if (!thereIsNoBlocks) return [];

    return [{}];
  }

  applyEvent(
    state: GameState<Stg>,
    {}: EventPayload<Stg, EvType>
  ): GameState<Stg> {
    return Im.pipe(
      () => state,
      st => BoLevelTrait.changeToAnnihilated(st, {durationMs: 1000})
    )();
  }
}
