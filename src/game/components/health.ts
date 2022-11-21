import {Im} from 'curtain-call3';

export type Health = {
  current: number;
  max: number;
};

export class HealthTrait {
  static create(health: number, opt?: {max?: number}): Health {
    const max = opt?.max ?? health;
    return {
      current: health,
      max,
    };
  }

  static damage(health: Health, damage: number): Health {
    return Im.replace(health, 'current', c => c - damage);
  }

  static isDead(health: Health): boolean {
    return health.current <= 0;
  }
}
