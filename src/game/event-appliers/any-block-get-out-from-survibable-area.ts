import {
  GameState,
  EventPayload,
  EventManipulator,
  Overlaps,
  GameStateHelper,
  Im,
  AaRect2dTrait,
  Logger,
  Vec2d,
  Vec2dTrait,
  ActressHelper,
} from 'curtain-call3';
import {LineEffect, LineEffectTrait} from '../components/line-effect';
import {gameAreaRect, unit} from '../constants';
import {BoLevelTrait} from '../level';
import {TryStgSetting} from '../setting';

type Stg = TryStgSetting;

const evType = 'anyBlockGetOutFromSurvivableArea';
type EvType = typeof evType;

export class AnyBlockGetOutFromSurvivableArea
  implements EventManipulator<Stg, EvType>
{
  createEventsAtUpdate(
    state: GameState<Stg>,
    args: {
      overlaps: Overlaps;
    }
  ): EventPayload<Stg, EvType>[] {
    if (GameStateHelper.getLevel(state).automaton.type !== 'released')
      return [];

    const survivableArea = BoLevelTrait.getSurvivableArea(state, {});
    const outsideBlocks = Im.pipe(
      () => state,
      st => GameStateHelper.getBodiesOf(st, 'block'),
      blocks => Object.entries(blocks),
      blocks =>
        blocks.filter(([blockId, block]) => {
          const blockRect = AaRect2dTrait.fromCenterAndSize(
            block.pos.pos,
            block.size
          );
          return AaRect2dTrait.isOutOf(blockRect, survivableArea);
        })
    )();

    if (outsideBlocks.length === 0) return [];

    return [{blockIds: outsideBlocks.map(([bId, _]) => bId)}];
  }

  applyEvent(
    state: GameState<Stg>,
    {blockIds}: EventPayload<Stg, EvType>
  ): GameState<Stg> {
    let st = Im.pipe(
      () => state,
      st => BoLevelTrait.changeToFallenState(st, {durationMs: 1000})
    )();

    const bodies = GameStateHelper.getBodiesOf(st, 'block');
    const survivableArea = BoLevelTrait.getSurvivableArea(state, {});
    for (const blockId of blockIds) {
      const block = bodies[blockId];
      const direction = Vec2dTrait.mlt(
        AaRect2dTrait.calcPointPosition(block.pos.pos, {
          area: survivableArea,
        }),
        -1
      );

      const effectInit = ActressHelper.createActressInitializer<
        Stg,
        'effectBody',
        'linesEffect'
      >({
        bodyType: 'effectBody',
        mindType: 'linesEffect',
        body: {},
        mind: {effects: createLineEffects(block.pos.pos, direction)},
      });
      st = GameStateHelper.addActress(st, effectInit).state;
    }

    return st;
  }
}

const createLineEffects = (origin: Vec2d, direction: Vec2d): LineEffect[] => {
  const destRelBase = Vec2dTrait.mlt(direction, 8 * unit);

  return Im.range(0, 15).map(i => {
    const destRelDelta = {
      x: (Math.random() - 0.5) * 16 * unit,
      y: (Math.random() - 0.5) * 16 * unit,
    };
    const destRel = Vec2dTrait.add(destRelBase, destRelDelta);
    return LineEffectTrait.create({
      lifeTimeMs: 500,
      activateDelayMs: 0,
      startPos: origin,
      destRel,

      key: `line${i}`,
      zIndex: 0,
      color: 0xff5555,
      thickness: unit / 1,
    });
  });
};
