import {
  GameState,
  EventPayload,
  GameStateHelper,
  Im,
  AaRect2dTrait,
  EventManipulator,
  Overlaps,
  RecM2MTrait,
  Vec2d,
  ActressHelper,
} from 'curtain-call3';
import {BallMovementTrait} from '../components/ball-movement';
import {LineEffect, LineEffectTrait} from '../components/line-effect';
import {unit} from '../constants';
import {BoLevelTrait} from '../level';
import {TryStgSetting} from '../setting';
import {SigilTrait} from '../sigil';
import {WholeGameProcessing} from '../whole-processing';

type Stg = TryStgSetting;

const evType = 'ballHitToBlock';
type EvType = typeof evType;

export class BallHitToBlockEv implements EventManipulator<Stg, EvType> {
  generateEventsAtUpdate(
    state: GameState<Stg>,
    args: {
      overlaps: Overlaps;
    }
  ): EventPayload<Stg, EvType>[] {
    return Im.pipe(
      () => args.overlaps,
      ov =>
        GameStateHelper.filterOverlaps(ov, {
          state: state,
          from: 'ball',
          to: 'block',
        }),
      ov => RecM2MTrait.toPairs(ov),
      ov =>
        ov.map(([ballId, blockId]) => ({
          ballId,
          blockId,
        }))
    )();
  }

  applyEvent(
    state: GameState<Stg>,
    {ballId, blockId}: EventPayload<Stg, EvType>
  ): GameState<Stg> {
    if (GameStateHelper.getLevel(state).automaton.type !== 'released')
      return state;

    const ball = GameStateHelper.getBody(state, ballId, 'ball');
    const block = GameStateHelper.getBody(state, blockId, 'block');

    if (ball.err) throw new Error('no ball');
    if (block.err) throw new Error('no block');

    const newBallBody = Im.pipe(
      () => ball.val,
      ball =>
        Im.replace(ball, 'movement', mov => {
          if (ball.penetrative) return mov;
          const pos = ball.pos.pos;
          const prevPos = ball.pos.prevPos;
          const wallShape = AaRect2dTrait.fromCenterAndSize(
            block.val.pos.pos,
            block.val.size
          );
          return BallMovementTrait.reflect(mov, {pos, prevPos, wallShape});
        }),
      ball => Im.replace(ball, 'penetrative', () => false)
    )();

    const newBlockBody = Im.replace(block.val, 'meta', meta => {
      return {...meta, del: true};
    });

    const effectInit = ActressHelper.createActressInitializer<
      Stg,
      'effectBody',
      'linesEffect'
    >({
      bodyType: 'effectBody',
      mindType: 'linesEffect',
      body: {},
      mind: {effects: createLineEffects(block.val.pos.pos)},
    });

    const hitStopPeriodLevel = SigilTrait.getAreaHitStopPeriodLevel(
      BoLevelTrait.getSigils(state)
    );
    const hitStopPeriod = 100 * (hitStopPeriodLevel / 10);

    return Im.pipe(
      () => state,
      st =>
        GameStateHelper.replaceBodies(st, {
          [ballId]: newBallBody,
          [blockId]: newBlockBody,
        }),
      st =>
        GameStateHelper.updateLevel(st, lv =>
          Im.replace(
            lv,
            'wholeMovementFreezeEndTimeMs',
            () => st.time.gameTimeMs + hitStopPeriod
          )
        ),
      st => GameStateHelper.addActress(st, effectInit).state
    )();
  }
}

const createLineEffects = (origin: Vec2d): LineEffect[] => {
  const zIndex = WholeGameProcessing.getZIndex().hitEffect;
  const color = WholeGameProcessing.getColors().hitEffect;
  return Im.range(0, 5).map(i => {
    const destRel = {
      x: (Math.random() - 0.5) * 8 * unit,
      y: (Math.random() - 0.5) * 8 * unit,
    };
    return LineEffectTrait.create({
      lifeTimeMs: 500,
      activateDelayMs: 0,
      startPos: origin,
      destRel,

      key: `line${i}`,
      zIndex,
      color,
      thickness: unit / 8,
    });
  });
};
