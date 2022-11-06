import {
  DirectorBehavior,
  GameHelper,
  GameInstances,
  GameState,
  Overlaps,
  Representation,
} from 'curtain-call2';
import {pipe} from 'rambda';
import {DefaultEnemyBeh} from './actress-behaviors/default-enemy';
import {DefaultPCBeh} from './actress-behaviors/default-pc';
import {TryStgSetting} from './setting';

type Stg = TryStgSetting;

class Director implements DirectorBehavior<Stg> {
  update(
    state: GameState<Stg>,
    other: {
      overlaps: Overlaps;
    }
  ): GameState<Stg> {
    if (!state.scene.level.ended && state.time.engineTimeMs > 1000) {
      return pipe(
        () => state,
        st =>
          GameHelper.addNotification(st, 'end', {
            reason: 'clear',
            score: state.scene.level.score,
          }),
        st => GameHelper.updateLevel(st, level => ({...level, ended: true}))
      )();
    }
    return state;
  }

  represent(state: GameState<Stg>): Representation<Stg> {
    return state.scene.level;
  }
}

export const tryStgInstances: GameInstances<TryStgSetting> = {
  director: new Director(),
  actresses: {
    defaultPc: new DefaultPCBeh(),
    defaultEnemy: new DefaultEnemyBeh(),
  },
};
