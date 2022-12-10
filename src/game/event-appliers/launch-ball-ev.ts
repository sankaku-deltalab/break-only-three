import {
  GameState,
  EventPayload,
  GameStateHelper,
  ActressHelper,
  Im,
  EventManipulator,
  Overlaps,
} from 'curtain-call3';
import {BallMovementTrait} from '../components/ball-movement';
import {PosTrait} from '../components/pos';
import {unit} from '../constants';
import {BoLevelTrait, StateType} from '../level';
import {TryStgSetting} from '../setting';
import {SigilTrait} from '../sigil';

type Stg = TryStgSetting;

const evType = 'launchBall';
type EvType = typeof evType;

export class LaunchBallEv implements EventManipulator<Stg, EvType> {
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
    {ballPos, velocity}: EventPayload<Stg, EvType>
  ): GameState<Stg> {
    if (GameStateHelper.getLevel(state).automaton.type !== 'launching')
      return state;

    const ballSizeLevel = SigilTrait.getBallSizeLevel(
      BoLevelTrait.getSigils(state)
    );
    const ballDiamRate = Math.max(1, ballSizeLevel) / 10;
    const ballDiamBase = unit / 8;
    const ballDiam = ballDiamRate * ballDiamBase;

    const ballInit = ActressHelper.createActressInitializer<
      Stg,
      'ball',
      'defaultBall'
    >({
      bodyType: 'ball',
      mindType: 'defaultBall',
      body: {
        pos: PosTrait.create({pos: ballPos}),
        diam: ballDiam,
        movement: BallMovementTrait.create({velocity}),
        penetrative: false,
      },
      mind: {},
    });

    return Im.pipe(
      () => state,
      st => GameStateHelper.addActresses(state, [ballInit]).state,
      st =>
        GameStateHelper.updateLevel(st, lv =>
          Im.replace(lv, 'automaton', (mtn): StateType => ({type: 'released'}))
        )
    )();
  }
}
