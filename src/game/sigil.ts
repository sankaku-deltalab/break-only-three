import {Im} from 'curtain-call3';

const sigils = {
  paddleExpansion: 1,
  paddleFlatten: 1,
  paddleMakeBallPenetrative: 1,
  paddleSensitivity: 1,
  biggerBall: 1,
  slowerBall: 1,
  wallMakeBallPenetrative: 1,
  speedDownLauncherGuide: 1,
  longerLauncherGuide: 1,
  strongerHitStop: 1,
};

export type SigilTypes = keyof typeof sigils;
export type SigilsState = Record<SigilTypes, number>;

export class SigilTrait {
  static getZeroSigils(): SigilsState {
    return Im.mapObj(sigils, () => 0);
  }

  static getPaddleSizeLevel(sigils: SigilsState): number {
    const defaultLevel = 10;
    const additive = sigils.paddleExpansion ?? 0;
    return defaultLevel + additive;
  }

  static getPaddleFlatLevel(sigils: SigilsState): number {
    const defaultLevel = 10;
    const additive = sigils.paddleFlatten ?? 0;
    return defaultLevel + additive;
  }

  static getPaddleMakeBallPenetrative(sigils: SigilsState): boolean {
    return (sigils.paddleMakeBallPenetrative ?? 0) > 0;
  }

  static getBallSizeLevel(sigils: SigilsState): number {
    const defaultLevel = 10;
    const additive = sigils.biggerBall ?? 0;
    return defaultLevel + additive;
  }

  static getBallSpeedLevel(sigils: SigilsState): number {
    const defaultLevel = 10;
    const additive = -sigils.slowerBall ?? 0;
    return defaultLevel + additive;
  }

  static getLauncherGuideSpeedLevel(sigils: SigilsState): number {
    const defaultLevel = 10;
    const additive = -sigils.speedDownLauncherGuide ?? 0;
    return defaultLevel + additive;
  }

  static getLauncherGuideLengthLevel(sigils: SigilsState): number {
    const defaultLevel = 10;
    const additive = sigils.longerLauncherGuide ?? 0;
    return defaultLevel + additive;
  }

  static getWallMakeBallPenetrative(sigils: SigilsState): boolean {
    return (sigils.wallMakeBallPenetrative ?? 0) > 0;
  }

  static getAreaHitStopPeriodLevel(sigils: SigilsState): number {
    const defaultLevel = 10;
    const additive = sigils.strongerHitStop ?? 0;
    return defaultLevel + additive;
  }
}
