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
import {WholeGameProcessing} from '../whole-processing';

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
    return st;
  }

  generateGraphics(
    st: ActressState<Stg, BT, MT>,
    args: {
      gameState: VisibleGameState<Stg>;
    }
  ): Graphic<Stg>[] {
    const {nw, ne, se, sw} = AaRect2dTrait.corners(st.body.area);
    const zIndex = WholeGameProcessing.getZIndex().survivableAreaOutline;
    const color = WholeGameProcessing.getColors().survivableAreaOutline;
    return [
      LineGraphicTrait.create({
        key: st.mindId + 'area',
        pos: Vec2dTrait.zero(),
        zIndex,
        thickness: 1,
        color,
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
      },
      mind: {
        velocity: {x: -unit / 1000, y: unit / 1000},
      },
    };
  }
}
