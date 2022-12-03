import {GameInstances} from 'curtain-call3';
import {DefaultBallBeh} from './actress-behaviors/default-ball';
import {DefaultBlockBeh} from './actress-behaviors/default-block';
import {DefaultPaddleBeh} from './actress-behaviors/default-paddle';
import {DefaultWallBeh} from './actress-behaviors/default-wall';
import {Director} from './director';
import {AllBlocksAreBrokenEv} from './event-appliers/all-blocks-are-broken-ev';
import {BallHitToBlockEv} from './event-appliers/ball-hit-to-block-ev';
import {BallHitToPaddleEv} from './event-appliers/ball-hit-to-paddle-ev';
import {BallWasFallenEv} from './event-appliers/ball-was-fallen-ev';
import {LaunchBallEv} from './event-appliers/launch-ball-ev';
import {NopEv} from './event-appliers/nop-ev';
import {TryStgSetting} from './setting';

type Stg = TryStgSetting;

export const tryStgInstances: GameInstances<TryStgSetting> = {
  director: new Director(),
  actresses: {
    defaultPaddle: new DefaultPaddleBeh(),
    defaultWall: new DefaultWallBeh(),
    defaultBall: new DefaultBallBeh(),
    defaultBlock: new DefaultBlockBeh(),
  },
  eventAppliers: {
    nop: new NopEv(),
    launchBall: new LaunchBallEv(),
    ballHitToPaddle: new BallHitToPaddleEv(),
    ballHitToBlock: new BallHitToBlockEv(),
    allBlocksAreBroken: new AllBlocksAreBrokenEv(),
    ballWasFallen: new BallWasFallenEv(),
  },
};
