import {Enum, Im} from 'curtain-call3';
import {SigilsState, SigilTrait} from './sigil';

const perks = {
  bigPaddle: 1,
  flatPaddle: 1,
  penetrativePaddle: 1,
  hyperSensitivePaddle: 1,
  bigBall: 1,
  slowBall: 1,
  penetrativeWall: 1,
  sniperLauncher: 1,
  strongHitStop: 1,
};

export type PerkTypes = keyof typeof perks;
export type PerksState = Record<PerkTypes, number>;

export class PerkTrait {
  static getZeroPerks(): PerksState {
    return Im.mapObj(perks, () => 0);
  }

  static addPerk(perks: PerksState, perk: PerkTypes): PerksState {
    return Im.replace(perks, perk, prev => (prev ?? 0) + 1);
  }

  static convertPerksToSigils(perks: PerksState): SigilsState {
    return Enum.reduce(
      Object.keys(perks) as PerkTypes[],
      SigilTrait.getZeroSigils(),
      (p, sigils) => {
        if ((perks[p] ?? 0) <= 0) return sigils;
        return Im.merge(sigils, perkToSigil[p]);
      }
    );
  }
}

const perkToSigil: Record<PerkTypes, Partial<SigilsState>> = {
  bigPaddle: {paddleExpansion: 1},
  flatPaddle: {paddleFlatten: 1},
  penetrativePaddle: {paddleMakeBallPenetrative: 1},
  hyperSensitivePaddle: {paddleSensitivity: 1},
  bigBall: {biggerBall: 1},
  slowBall: {slowerBall: 1},
  penetrativeWall: {wallMakeBallPenetrative: 1},
  sniperLauncher: {speedDownLauncherGuide: 1, longerLauncherGuide: 1},
  strongHitStop: {strongerHitStop: 1},
};
