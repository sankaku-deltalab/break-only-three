import {GameInstances} from 'curtain-call3';
import {DefaultBallBeh} from './actress-behaviors/default-ball';
import {DefaultBlockBeh} from './actress-behaviors/default-block';
import {DefaultPaddleBeh} from './actress-behaviors/default-paddle';
import {LinesEffectBeh} from './actress-behaviors/lines-effect';
import {MovingSurvivableArea} from './actress-behaviors/moving-survibable-area';
import {Director} from './director';
import {AllBlocksAreBrokenEv} from './event-appliers/all-blocks-are-broken-ev';
import {AnnihilatedStateWasFinishedEv} from './event-appliers/annihilated-state-was-finished';
import {AnyBlockGetOutFromSurvivableArea} from './event-appliers/any-block-get-out-from-survibable-area';
import {BallHitToBlockEv} from './event-appliers/ball-hit-to-block-ev';
import {BallHitToPaddleEv} from './event-appliers/ball-hit-to-paddle-ev';
import {BallWasFallenEv} from './event-appliers/ball-was-fallen-ev';
import {FallenStateWasFinishedEv} from './event-appliers/fallen-state-was-finished';
import {LaunchBallEv} from './event-appliers/launch-ball-ev';
import {NopEv} from './event-appliers/nop-ev';
import {TryStgSetting} from './setting';

type Stg = TryStgSetting;

export const tryStgInstances: GameInstances<TryStgSetting> = {
  director: new Director(),
  actresses: {
    defaultPaddle: new DefaultPaddleBeh(),
    defaultBall: new DefaultBallBeh(),
    defaultBlock: new DefaultBlockBeh(),
    movingSurvivableArea: new MovingSurvivableArea(),
    linesEffect: new LinesEffectBeh(),
  },
  eventManipulators: {
    nop: new NopEv(),
    launchBall: new LaunchBallEv(),
    ballHitToPaddle: new BallHitToPaddleEv(),
    ballHitToBlock: new BallHitToBlockEv(),
    allBlocksAreBroken: new AllBlocksAreBrokenEv(),
    ballWasFallen: new BallWasFallenEv(),
    fallenStateWasFinished: new FallenStateWasFinishedEv(),
    annihilatedStateWasFinished: new AnnihilatedStateWasFinishedEv(),
    anyBlockGetOutFromSurvivableArea: new AnyBlockGetOutFromSurvivableArea(),
  },
};
