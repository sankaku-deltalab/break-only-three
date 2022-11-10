import {GameInstances} from 'curtain-call2';
import {DefaultEnemyBeh} from './actress-behaviors/default-enemy';
import {DefaultPCBeh} from './actress-behaviors/default-pc';
import {Director} from './director';
import {TryStgSetting} from './setting';

type Stg = TryStgSetting;

export const tryStgInstances: GameInstances<TryStgSetting> = {
  director: new Director(),
  actresses: {
    defaultPc: new DefaultPCBeh(),
    defaultEnemy: new DefaultEnemyBeh(),
  },
};
