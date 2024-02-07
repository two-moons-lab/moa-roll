import { BaseInstrument } from "./base";
import { Time } from "tone/build/esm/core/type/Units";
export declare class Drum implements BaseInstrument {
    static isNoise: boolean;
    static getDrumKitKeys: () => string[];
    constructor();
    releaseAll(): void;
    triggerAttack(value: keyof typeof this.groups, time: (Time & number) | undefined): void;
    triggerRelease(value: keyof typeof this.groups, time: (Time & number) | undefined): void;
}
