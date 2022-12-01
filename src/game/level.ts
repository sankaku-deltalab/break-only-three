export type StateType =
  | {type: 'launching'}
  | {type: 'released'}
  | {type: 'fallen'}
  | {type: 'annihilated'}
  | {type: 'finished'};

export type BoLevelState = {
  score: number;
  ended: boolean;
  automaton: StateType;
};

export class BoLevelTrait {
  static createInitial(): BoLevelState {
    return {
      score: 0,
      ended: false,
      automaton: {type: 'launching'},
    };
  }
}
