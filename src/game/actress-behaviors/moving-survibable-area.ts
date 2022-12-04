import {
  AaRect2dTrait,
  ActressBehavior,
  ActressHelper,
  ActressInitializer,
  ActressState,
  Collision,
  Enum,
  GameStateHelper,
  Graphic,
  Im,
  LineGraphicTrait,
  Vec2dTrait,
  VisibleGameState,
} from 'curtain-call3';
import {TryStgSetting} from '../setting';
import {LineEffectTrait} from '../components/line-effect';
import {gameAreaNW, gameAreaSE, unit} from '../constants';

type Stg = TryStgSetting;

const bt = 'survivableArea';
const mt = 'movingSurvivableArea';
type BT = typeof bt;
type MT = typeof mt;

export class MovingSurvivableArea implements ActressBehavior<Stg, BT, MT> {
  readonly bodyType = bt;
  readonly mindType = mt;

  applyInput(
    st: ActressState<Stg, BT, MT>,
    args: {
      gameState: VisibleGameState<Stg>;
    }
  ): ActressState<Stg, BT, MT> {
    return st;
  }

  update(
    st: ActressState<Stg, BT, MT>,
    args: {
      gameState: VisibleGameState<Stg>;
    }
  ): ActressState<Stg, BT, MT> {
    let act = st;

    if (GameStateHelper.getLevel(args.gameState).automaton.type !== 'released')
      return act;

    if (args.gameState.time.gameTimeMs >= st.body.freezeEndTimeMs) {
      const delta = Vec2dTrait.mlt(
        GameStateHelper.getLevel(args.gameState).wholeVelocity,
        args.gameState.time.lastDeltaMs
      );
      act = Im.replace2(act, ['body', 'area'], area =>
        AaRect2dTrait.move(area, delta)
      );
    }
    return act;
  }

  generateGraphics(
    st: ActressState<Stg, BT, MT>,
    args: {
      gameState: VisibleGameState<Stg>;
    }
  ): Graphic<Stg>[] {
    const {nw, ne, se, sw} = AaRect2dTrait.corners(st.body.area);
    return [
      LineGraphicTrait.create({
        key: st.mindId + 'area',
        pos: Vec2dTrait.zero(),
        zIndex: 0,
        thickness: 1,
        color: 0x005555,
        paths: [nw, ne, se, sw],
        closed: true,
      }),
    ];
  }

  generateCollision(
    st: ActressState<Stg, BT, MT>,
    args: {
      gameState: VisibleGameState<Stg>;
    }
  ): Collision {
    return {
      shapes: [],
      excess: false,
    };
  }
}

export class MovingSurvivableAreaTrait {
  static createActInit(): ActressInitializer<Stg, BT, MT> {
    return {
      bodyType: bt,
      mindType: mt,
      body: {
        area: {nw: gameAreaNW, se: gameAreaSE},
        freezeEndTimeMs: -1,
      },
      mind: {
        velocity: {x: -unit / 1000, y: unit / 1000},
      },
    };
  }
}
