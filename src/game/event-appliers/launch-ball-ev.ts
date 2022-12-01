import {
  EventApplier,
  GameState,
  EventPayload,
  GameStateHelper,
  ActressHelper,
  Im,
} from 'curtain-call3';
import {BallMovementTrait} from '../components/ball-movement';
import {PosTrait} from '../components/pos';
import {unit} from '../constants';
import {StateType} from '../level';
import {TryStgSetting} from '../setting';

type Stg = TryStgSetting;

const evType = 'launchBall';
type EvType = typeof evType;

export class LaunchBallEv implements EventApplier<Stg, EvType> {
  applyEvent(
    state: GameState<Stg>,
    {ballPos, velocity}: EventPayload<Stg, EvType>
  ): GameState<Stg> {
    if (GameStateHelper.getLevel(state).automaton.type !== 'launching')
      return state;

    const ballInit = ActressHelper.createActressInitializer<
      Stg,
      'ball',
      'defaultBall'
    >({
      bodyType: 'ball',
      mindType: 'defaultBall',
      body: {
        pos: PosTrait.create({pos: ballPos}),
        diam: unit / 8,
        movement: BallMovementTrait.create({velocity}),
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
