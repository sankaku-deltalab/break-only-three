import {Enum, Im, RecSet, RecSetTrait} from 'curtain-call3';
import {SigilsState, SigilTrait} from './sigil';

export type PerkInfo = {
  name: string;
  description: string;
};

const perks = {
  bigPaddle: {name: 'Big Paddle', description: 'Easier to keep ball'},
  flatPaddle: {name: 'Flatten', description: 'Make paddle artless'},
  penetrativePaddle: {
    name: 'Power Paddle',
    description: 'Paddle make ball penetrative',
  },
  hyperSensitivePaddle: {
    name: 'Sensitive',
    description: 'Paddle become Hyper Sensitive',
  },
  bigBall: {name: 'Big Ball', description: 'Slightly'},
  slowBall: {name: 'Slow Speed', description: 'Be careful to time up'},
  penetrativeWall: {
    name: 'Power Wall',
    description: 'Wall make ball penetrative',
  },
  sniperLauncher: {name: 'Discreet', description: 'Super aiming power'},
  strongHitStop: {name: 'Impact', description: 'Longer hit-stop'},
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

  static getAllPerks(): PerkTypes[] {
    return Object.keys(perks) as PerkTypes[];
  }

  static getPerksAlreadyHave(perks: PerksState): RecSet {
    return RecSetTrait.new(
      Object.entries(perks)
        .filter(([k, v]) => v > 0)
        .map(([k, v]) => k)
    );
  }

  static getPerksNotHave(perks: PerksState): RecSet {
    const mutAllPerks = new Set(this.getAllPerks());
    const alreadyHave = RecSetTrait.iter(this.getPerksAlreadyHave(perks));
    for (const p of alreadyHave) {
      mutAllPerks.delete(p as PerkTypes);
    }
    return RecSetTrait.new([...mutAllPerks.keys()]);
  }

  static getPerkInfo(perk: PerkTypes): PerkInfo {
    return perks[perk];
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
  bigPaddle: {paddleExpansion: 10},
  flatPaddle: {paddleFlatten: 10},
  penetrativePaddle: {paddleMakeBallPenetrative: 1},
  hyperSensitivePaddle: {paddleSensitivity: 5},
  bigBall: {biggerBall: 5},
  slowBall: {slowerBall: 7},
  penetrativeWall: {wallMakeBallPenetrative: 1},
  sniperLauncher: {speedDownLauncherGuide: 5, longerLauncherGuide: 10},
  strongHitStop: {strongerHitStop: 10},
};
