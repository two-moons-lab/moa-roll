import { Unit } from "tone";

export abstract class BaseInstrument {
  static isNoise?: boolean | undefined;
  abstract releaseAll(): void;
  abstract triggerAttack(value: string, time: Unit.Time | undefined): void;
  abstract triggerRelease(value: string, time: Unit.Time | undefined): void;
}
