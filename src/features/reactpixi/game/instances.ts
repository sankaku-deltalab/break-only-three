import {
  DirectorBehavior,
  DirectorGameState,
  GameInstances,
  Overlaps,
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
}

export const tryStgInstances: GameInstances<TryStgSetting> = {
  director: new Director(),
  actresses: {
    defaultPc: new DefaultPCBeh(),
    defaultEnemy: new DefaultEnemyBeh(),
  },
};
