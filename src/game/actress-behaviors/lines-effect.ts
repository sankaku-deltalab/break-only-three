import {
  ActressBehavior,
  ActressHelper,
  ActressState,
  Collision,
  Enum,
  Graphic,
  Im,
  VisibleGameState,
} from 'curtain-call3';
import {TryStgSetting} from '../setting';
import {LineEffectTrait} from '../components/line-effect';

type Stg = TryStgSetting;

const bt = 'effectBody';
const mt = 'linesEffect';
type BT = typeof bt;
type MT = typeof mt;

export class LinesEffectBeh implements ActressBehavior<Stg, BT, MT> {
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

    const deltaMs = args.gameState.time.lastDeltaMs;
    act = Im.replace2(act, ['mind', 'effects'], lines =>
      Enum.map(lines, li => LineEffectTrait.update(li, deltaMs))
    );

    const allEffectsWereEnded = act.mind.effects.every(line =>
      LineEffectTrait.isEnded(line)
    );
    if (allEffectsWereEnded) {
      act = ActressHelper.delActress(act);
    }

    return act;
  }

  generateGraphics(
    st: ActressState<Stg, BT, MT>,
    args: {
      gameState: VisibleGameState<Stg>;
    }
  ): Graphic<Stg>[] {
    return st.mind.effects.flatMap(line =>
      LineEffectTrait.generateGraphics(line)
    );
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
