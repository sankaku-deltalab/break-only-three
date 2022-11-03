import {
  DirectorBehavior,
  DirectorGameState,
  GameInstances,
  GameState,
  Overlaps,
  Representation,
} from 'curtain-call2';
import {DefaultEnemyBeh} from './actress-behaviors/default-enemy';
import {DefaultPCBeh} from './actress-behaviors/default-pc';
import {TryStgSetting} from './setting';

type Stg = TryStgSetting;

class Director implements DirectorBehavior<Stg> {
  update(
    st: DirectorGameState<Stg>,
    other: {
      overlaps: Overlaps;
    }
  ): DirectorGameState<Stg> {
    return st;
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
